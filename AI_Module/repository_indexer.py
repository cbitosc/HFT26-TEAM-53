
import ast
from pathlib import Path

# Project folders that should not be scanned
IGNORED_DIRS = {
    ".git", "__pycache__", ".venv", "venv",
    "node_modules", ".idea", ".vscode"
}

# Supported source-code files
SUPPORTED_EXTENSIONS = {
    ".py", ".js", ".ts", ".java",
    ".c", ".cpp", ".h", ".html",
    ".css", ".md"
}


def index_repository(repo_path, max_files=200):

    repo_path = Path(repo_path)

    if not repo_path.exists():
        raise FileNotFoundError("Repository folder not found")

    indexed_files = []

    for file_path in repo_path.rglob("*"):

        if not file_path.is_file():
            continue

        if any(part in IGNORED_DIRS for part in file_path.parts):
            continue

        if file_path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            continue

        if len(indexed_files) >= max_files:
            break

        try:
            if file_path.stat().st_size > 100_000:
                continue

            content = file_path.read_text(
                encoding="utf-8",
                errors="ignore"
            )

            file_info = {
                "file": str(file_path.relative_to(repo_path)),
                "content": content[:12000],
                "symbols": []
            }

            # Extract Python functions and classes
            if file_path.suffix == ".py":
                try:
                    tree = ast.parse(content)

                    for node in ast.walk(tree):

                        if isinstance(
                            node,
                            (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)
                        ):
                            file_info["symbols"].append({
                                "name": node.name,
                                "type": (
                                    "class"
                                    if isinstance(node, ast.ClassDef)
                                    else "function"
                                ),
                                "line": node.lineno
                            })

                except SyntaxError:
                    pass

            indexed_files.append(file_info)

        except (OSError, UnicodeError):
            continue

    return indexed_files


if __name__ == "__main__":

    project_path = Path(__file__).resolve().parent.parent

    results = index_repository(project_path)

    print("\nCODELENS AI - REPOSITORY INDEX")
    print("--------------------------------")

    print("Total files indexed:", len(results))

    for item in results:
        print("\nFile:", item["file"])

        for symbol in item["symbols"]:
            print(
                "  ",
                symbol["type"],
                ":",
                symbol["name"],
                "- Line",
                symbol["line"]
            )

    print("\nRepository indexing completed!")
