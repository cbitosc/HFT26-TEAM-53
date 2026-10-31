
import sqlite3
import numpy as np
from sentence_transformers import SentenceTransformer

DB_PATH = "database/search.db"
MODEL_NAME = "all-MiniLM-L6-v2"


def build_semantic_index():
    print("\nLoading local embedding model...")
    model = SentenceTransformer(MODEL_NAME)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS semantic_embeddings (
            code_file_id INTEGER PRIMARY KEY,
            embedding BLOB NOT NULL
        )
    """)

    cursor.execute("""
        SELECT id, function_name, code,
               structure_type, language, file_path
        FROM code_files
    """)

    structures = cursor.fetchall()

    if not structures:
        print("No code found. Run Tree-sitter indexing first.")
        conn.close()
        return

    texts = [
        f"Name: {name}\nType: {kind}\nLanguage: {language}\n"
        f"File: {file_path}\nCode:\n{code}"
        for code_id, name, code, kind, language, file_path
        in structures
    ]

    print("Creating semantic embeddings...")
    embeddings = model.encode(
        texts,
        normalize_embeddings=True,
        show_progress_bar=True
    )

    cursor.execute("DELETE FROM semantic_embeddings")

    for item, embedding in zip(structures, embeddings):
        code_id = item[0]

        cursor.execute("""
            INSERT INTO semantic_embeddings
            (code_file_id, embedding)
            VALUES (?, ?)
        """, (
            code_id,
            sqlite3.Binary(
                np.asarray(embedding, dtype=np.float32).tobytes()
            )
        ))

    conn.commit()
    conn.close()

    print(f"\nSemantic index created successfully!")
    print(f"Structures indexed: {len(structures)}")


def semantic_search(query):
    if not query.strip():
        print("Please enter a search query.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT c.function_name, c.file_path,
               c.start_line, c.end_line, c.code,
               c.structure_type, c.language,
               e.embedding
        FROM code_files c
        JOIN semantic_embeddings e
        ON c.id = e.code_file_id
    """)

    results = cursor.fetchall()
    conn.close()

    if not results:
        print("No semantic index found. Build it first using option 1.")
        return

    print("\nLoading local embedding model...")
    model = SentenceTransformer(MODEL_NAME)

    query_embedding = model.encode(
        query,
        normalize_embeddings=True
    )

    ranked_results = []

    for result in results:
        embedding = np.frombuffer(
            result[7],
            dtype=np.float32
        )

        score = float(np.dot(query_embedding, embedding))
        ranked_results.append((score, result))

    ranked_results.sort(
        key=lambda item: item[0],
        reverse=True
    )

    print("\nSemantic Search Results:\n")

    for score, result in ranked_results[:5]:
        name, file_path, start, end, code, kind, language, _ = result

        print(f"Name: {name}")
        print(f"Type: {kind}")
        print(f"Language: {language}")
        print(f"File: {file_path}")
        print(f"Lines: {start}-{end}")
        print(f"Similarity: {score:.4f}")
        print(f"Code:\n{code}")
        print("-" * 50)


if __name__ == "__main__":
    build_semantic_index()
