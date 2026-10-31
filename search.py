
import sqlite3
from rank_bm25 import BM25Okapi
import re
from database import save_search

DB_PATH = "database/search.db"


def tokenize(text):
    return re.findall(r"[a-zA-Z_][a-zA-Z0-9_]*", text.lower())


def search_functions(query):
    if not query.strip():
        print("Please enter a search keyword.")
        return

    save_search(query)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT repository, file_path, function_name,
               start_line, end_line, code,
               structure_type, language
        FROM code_files
    """)

    structures = cursor.fetchall()
    conn.close()

    if not structures:
        print("No indexed code found. Run python parser.py first.")
        return

    documents = []

    for item in structures:
        searchable_text = (
            str(item[2]) + " " +
            str(item[5]) + " " +
            str(item[6]) + " " +
            str(item[7]) + " " +
            str(item[1])
        )

        documents.append(tokenize(searchable_text))

    bm25 = BM25Okapi(documents)
    query_tokens = tokenize(query)

    if not query_tokens:
        print("No searchable keywords found.")
        return

    scores = bm25.get_scores(query_tokens)

    ranked_results = sorted(
        zip(scores, structures),
        key=lambda item: item[0],
        reverse=True
    )

    # Display only results with a positive BM25 score
    relevant_results = [
        item for item in ranked_results if item[0] > 0
    ]

    if not relevant_results:
        print("No matching code found.")
        return

    print("\nBM25 Search Results:\n")

    for score, result in relevant_results[:5]:
        repository, file_path, name, start, end, code, structure_type, language = result

        print(f"Name: {name}")
        print(f"Type: {structure_type}")
        print(f"Language: {language}")
        print(f"File: {file_path}")
        print(f"Lines: {start}-{end}")
        print(f"BM25 Score: {score:.4f}")
        print(f"Code:\n{code}")
        print("-" * 50)


if __name__ == "__main__":
    user_query = input("Enter function or code keyword to search: ")
    search_functions(user_query)
