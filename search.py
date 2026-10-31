
import sqlite3
from rank_bm25 import BM25Okapi
import re

DB_PATH = "database/search.db"


def tokenize(text):
    return re.findall(r"[a-zA-Z_][a-zA-Z0-9_]*", text.lower())


def search_functions(query):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT repository, file_path, function_name,
               start_line, end_line, code
        FROM code_files
    """)

    functions = cursor.fetchall()
    conn.close()

    if not functions:
        print("No indexed functions found. Run python indexer.py first.")
        return

    documents = []

    for function in functions:
        searchable_text = (
            str(function[2]) + " " +
            str(function[5])
        )
        documents.append(tokenize(searchable_text))

    bm25 = BM25Okapi(documents)
    query_tokens = tokenize(query)
    scores = bm25.get_scores(query_tokens)

    ranked_results = sorted(
        zip(scores, functions),
        key=lambda item: item[0],
        reverse=True
    )

    print("\nSearch results:\n")

    for score, result in ranked_results[:5]:
        repository, file_path, name, start, end, code = result

        print(f"Function: {name}")
        print(f"File: {file_path}")
        print(f"Lines: {start}-{end}")
        print(f"Score: {score:.4f}")
        print(f"Code:\n{code}")
        print("-" * 50)


if __name__ == "__main__":
    user_query = input("Enter function or code keyword to search: ")
    search_functions(user_query)
