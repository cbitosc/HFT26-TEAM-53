def index_repository():
    
    create_database()

  def index_repository():
    create_database()

    import sqlite3
    conn = sqlite3.connect("database/search.db")
    conn.execute(
        "DELETE FROM code_files WHERE repository = ?",
        (REPOSITORY_NAME,)
    )
    conn.commit()
    conn.close()

    for root, dirs, files in os.walk("."):
        dirs[:] = [
            directory for directory in dirs
            if directory not in {".git", "venv", "__pycache__", ".vscode"}
        ]

        for filename in files:
            if filename.endswith(".py") and filename != "indexer.py":
                file_path = os.path.join(root, filename)
                index_python_file(file_path)

    print("Repository indexing completed!")