
import os
import sqlite3
from pathlib import Path

from tree_sitter_language_pack import get_parser
from database import create_database, insert_structure

REPOSITORY_NAME = "HFT26-TEAM-53"

LANGUAGES = {
    ".py": "python",
    ".js": "javascript",
    ".jsx": "javascript",
    ".ts": "typescript",
    ".tsx": "tsx",
    ".java": "java",
    ".c": "c",
    ".h": "c",
    ".cpp": "cpp",
    ".hpp": "cpp",
    ".cc": "cpp",
    ".go": "go",
    ".rs": "rust",
    ".php": "php",
}

FUNCTION_TYPES = {
    "function_definition",
    "function_declaration",
    "generator_function_declaration",
    "method_definition",
    "method_declaration",
    "constructor_declaration",
    "function_item",
}

CLASS_TYPES = {
    "class_definition",
    "class_declaration",
    "class_specifier",
    "struct_specifier",
    "interface_declaration",
    "enum_declaration",
    "struct_item",
    "enum_item",
    "trait_item",
}


def get_name(node, source_code):
    name_node = node.child_by_field_name("name")

    if name_node is None:
        return "anonymous"

    return source_code[
        name_node.start_byte:name_node.end_byte
    ].decode("utf-8", errors="replace")


def extract_structures(file_path):
    path = Path(file_path)
    language = LANGUAGES.get(path.suffix.lower())

    if language is None:
        return []

    try:
        source_code = path.read_bytes()
        parser = get_parser(language)
        tree = parser.parse(source_code)

    except Exception as error:
        print(f"Skipped {file_path}: {error}")
        return []

    results = []

    def walk(node):
        kind = None

        if node.type in FUNCTION_TYPES:
            kind = "function"

        elif node.type in CLASS_TYPES:
            kind = "class"

        if kind:
            name = get_name(node, source_code)

            code = source_code[
                node.start_byte:node.end_byte
            ].decode("utf-8", errors="replace")

            results.append({
                "name": name,
                "type": kind,
                "language": language,
                "file_path": str(path),
                "start_line": node.start_point.row + 1,
                "end_line": node.end_point.row + 1,
                "code": code
            })

        for child in node.children:
            walk(child)

    walk(tree.root_node)
    return results


def index_file(file_path):
    create_database()
    structures = extract_structures(file_path)

    for item in structures:
        insert_structure(
            REPOSITORY_NAME,
            item["file_path"],
            item["name"],
            item["start_line"],
            item["end_line"],
            item["code"],
            item["type"],
            item["language"]
        )

        print(f"Saved {item['type']}: {item['name']}")

    print(f"Total structures saved: {len(structures)}")


def index_repository():
    create_database()

    # Remove previous records for this repository
    # so repeated indexing does not create duplicates.
    conn = sqlite3.connect("database/search.db")
    conn.execute(
        "DELETE FROM code_files WHERE repository = ?",
        (REPOSITORY_NAME,)
    )
    conn.commit()
    conn.close()

    total_files = 0
    total_structures = 0

    ignored_dirs = {
        ".git", ".vscode", "__pycache__",
        "venv", ".venv", "node_modules",
        "database", "dist", "build"
    }

    for root, dirs, files in os.walk("."):
        dirs[:] = [
            directory for directory in dirs
            if directory not in ignored_dirs
        ]

        for filename in files:
            extension = Path(filename).suffix.lower()

            if extension not in LANGUAGES:
                continue

            file_path = os.path.join(root, filename)

            structures = extract_structures(file_path)
            total_files += 1

            for item in structures:
                insert_structure(
                    REPOSITORY_NAME,
                    item["file_path"],
                    item["name"],
                    item["start_line"],
                    item["end_line"],
                    item["code"],
                    item["type"],
                    item["language"]
                )

                total_structures += 1

            print(
                f"Indexed {file_path}: "
                f"{len(structures)} structures"
            )

    print("\n================================")
    print("REPOSITORY INDEXING COMPLETED!")
    print("Files scanned:", total_files)
    print("Structures saved:", total_structures)
    print("================================")


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        index_file(sys.argv[1])
    else:
        index_repository()
