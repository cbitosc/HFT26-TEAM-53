
import ast
import os
from pathlib import Path

from tree_sitter_language_pack import get_parser


SUPPORTED_EXTENSIONS = {
    ".py": "python",
    ".js": "javascript",
    ".jsx": "javascript",
    ".ts": "typescript",
    ".tsx": "tsx",
    ".java": "java",
}

IGNORED_DIRS = {
    ".git", "node_modules", "venv", ".venv",
    "__pycache__", "dist", "build", "target",
    ".next", ".idea", "vendor"
}

MAX_FILE_BYTES = 500_000


def scan_files(root: Path):
    """Find supported source files inside a repository."""
    files = []

    for current, dirs, filenames in os.walk(root):
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS]

        for filename in filenames:
            path = Path(current) / filename

            if path.suffix.lower() not in SUPPORTED_EXTENSIONS:
                continue

            try:
                if path.stat().st_size > MAX_FILE_BYTES:
                    continue
            except OSError:
                continue

            files.append(path)

    return files


def relative_path(path: Path, root: Path):
    return path.relative_to(root).as_posix()


def get_imports(path: Path):
    """Extract imports from supported programming languages."""
    language = SUPPORTED_EXTENSIONS.get(path.suffix.lower())

    if not language:
        return []

    try:
        source = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return []

    # Python: use AST for accurate import extraction.
    if language == "python":
        imports = []

        try:
            tree = ast.parse(source)

            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        imports.append(alias.name)

                elif isinstance(node, ast.ImportFrom):
                    if node.module:
                        imports.append("." * node.level + node.module)

        except SyntaxError:
            pass

        return imports

    # JavaScript, TypeScript and Java: use Tree-sitter.
    try:
        parser = get_parser(language)
        tree = parser.parse(source.encode("utf-8"))

        import_node_types = {
            "javascript": {"import_statement", "export_statement"},
            "typescript": {"import_statement", "export_statement"},
            "tsx": {"import_statement", "export_statement"},
            "java": {"import_declaration"},
        }

        results = []

        def walk(node):
            if node.type in import_node_types.get(language, set()):
                text = node.text.decode("utf-8", errors="replace")
                results.append(text)

            for child in node.children:
                walk(child)

        walk(tree.root_node)
        return results

    except Exception:
        return []


def resolve_import(import_name: str, source_file: Path, all_files):
    """Resolve common local imports to files in the repository."""

    candidates = []

    if import_name.startswith("."):
        base = (source_file.parent / import_name).resolve()
    else:
        cleaned = import_name.replace("static ", "").strip()

        if cleaned.endswith(";"):
            cleaned = cleaned[:-1]

        # JavaScript/TypeScript module paths.
        if "/" in cleaned or cleaned.startswith("@"):
            base = (source_file.parent / cleaned).resolve()
        else:
            # Python module paths.
            base = (source_file.parent / cleaned.replace(".", "/")).resolve()

    candidates.extend([
        base,
        base.with_suffix(".py"),
        base.with_suffix(".js"),
        base.with_suffix(".jsx"),
        base.with_suffix(".ts"),
        base.with_suffix(".tsx"),
        base / "index.js",
        base / "index.jsx",
        base / "index.ts",
        base / "index.tsx",
        base / "__init__.py",
    ])

    known = {path.resolve() for path in all_files}

    for candidate in candidates:
        if candidate in known:
            return candidate

    # Java class-name matching.
    cleaned = import_name.replace("static ", "").strip().rstrip(";")
    class_name = cleaned.split(".")[-1]

    for path in all_files:
        if path.suffix.lower() == ".java" and path.stem == class_name:
            return path

    return None


def analyze_repository(root: Path):
    """Generate React Flow-compatible nodes and dependency edges."""

    root = root.resolve()
    files = scan_files(root)

    nodes = []
    edges = []
    imports_by_file = {}

    for path in files:
        rel = relative_path(path, root)
        imports = get_imports(path)

        imports_by_file[path] = imports

        language = SUPPORTED_EXTENSIONS[path.suffix.lower()]

        nodes.append({
            "id": rel,
            "type": "architecture",
            "position": {"x": 0, "y": 0},
            "data": {
                "title": path.name,
                "path": rel,
                "language": language,
                "type": "FILE",
                "description": f"{language.upper()} source file",
                "imports": imports,
            },
        })

    edge_count = 0

    for source_file, imports in imports_by_file.items():
        for import_name in imports:
            target = resolve_import(import_name, source_file, files)

            if target is None or target == source_file:
                continue

            source = relative_path(source_file, root)
            destination = relative_path(target, root)

            edges.append({
                "id": f"edge-{edge_count}",
                "source": source,
                "target": destination,
                "label": "imports",
                "animated": False,
            })

            edge_count += 1

    return {
        "repository": root.name,
        "total_files": len(nodes),
        "total_connections": len(edges),
        "nodes": nodes,
        "edges": edges,
    }
