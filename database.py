
import sqlite3
import os

DB_PATH = os.path.join("database", "search.db")


def create_database():
    os.makedirs("database", exist_ok=True)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS code_files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            repository TEXT NOT NULL,
            file_path TEXT NOT NULL,
            function_name TEXT NOT NULL,
            start_line INTEGER,
            end_line INTEGER,
            code TEXT,
            structure_type TEXT DEFAULT 'function',
            language TEXT DEFAULT 'unknown'
        )
    """)

    # Safely upgrade existing databases
    cursor.execute("PRAGMA table_info(code_files)")
    columns = [row[1] for row in cursor.fetchall()]

    if "structure_type" not in columns:
        cursor.execute("""
            ALTER TABLE code_files
            ADD COLUMN structure_type TEXT DEFAULT 'function'
        """)

    if "language" not in columns:
        cursor.execute("""
            ALTER TABLE code_files
            ADD COLUMN language TEXT DEFAULT 'unknown'
        """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS search_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            search_query TEXT NOT NULL,
            searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()

    print("Database created/updated successfully!")


def insert_structure(repository, file_path, name,
                     start_line, end_line, code,
                     structure_type="function",
                     language="unknown"):

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO code_files
        (repository, file_path, function_name,
         start_line, end_line, code,
         structure_type, language)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        repository, file_path, name,
        start_line, end_line, code,
        structure_type, language
    ))

    conn.commit()
    conn.close()


# Keep compatibility with the existing Python indexer
def insert_function(repository, file_path, function_name,
                    start_line, end_line, code):

    insert_structure(
        repository, file_path, function_name,
        start_line, end_line, code,
        "function", "python"
    )


def get_all_functions():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM code_files")
    results = cursor.fetchall()

    conn.close()
    return results


def save_search(query):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO search_history (search_query) VALUES (?)",
        (query,)
    )

    conn.commit()
    conn.close()


if __name__ == "__main__":
    create_database()

