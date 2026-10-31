
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
            code TEXT
        )
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

    print("Database created successfully!")


def insert_function(repository, file_path, function_name,
                    start_line, end_line, code):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO code_files
        (repository, file_path, function_name,
         start_line, end_line, code)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (repository, file_path, function_name,
          start_line, end_line, code))

    conn.commit()
    conn.close()


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
