
import re
from pathlib import Path
from repository_indexer import index_repository


STOP_WORDS = {
    "the", "is", "a", "an", "in", "on", "at", "of",
    "to", "for", "and", "or", "where", "what", "how",
    "does", "do", "this", "that", "are", "was", "were",
    "can", "which", "with", "from", "my", "your"
}


def tokenize(text):
    words = re.findall(r"[a-zA-Z_][a-zA-Z0-9_]*", text.lower())
    return [word for word in words if word not in STOP_WORDS]


def search_repository(repo_path, query):

    indexed_files = index_repository(repo_path)

    query_words = set(tokenize(query))
    results = []

    if not query_words:
        return results

    for file_info in indexed_files:

        score = 0
        file_name = file_info["file"].lower()
        content = file_info["content"].lower()

        # Search in file names
        for word in query_words:
            if word in file_name:
                score += 10

        # Search in code content
        for word in query_words:
            score += content.count(word)

        # Search in function and class names
        matched_symbols = []
        seen_symbols = set()

        for symbol in file_info["symbols"]:

            symbol_name = symbol["name"].lower()

            for word in query_words:
                if word in symbol_name:
                    score += 8

                    symbol_key = (
                        symbol["name"],
                        symbol["line"]
                    )

                    if symbol_key not in seen_symbols:
                        matched_symbols.append(symbol)
                        seen_symbols.add(symbol_key)

                    break

        if score > 0:
            results.append({
                "file": file_info["file"],
                "score": score,
                "symbols": matched_symbols,
                "content": file_info["content"][:3000]
            })

    results.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    return results


if __name__ == "__main__":

    project_path = Path(__file__).resolve().parent.parent

    question = input("\nAsk about your repository: ")

    search_results = search_repository(
        project_path,
        question
    )

    print("\nCODELENS AI - SEARCH RESULTS")
    print("--------------------------------")

    if not search_results:
        print("No relevant files found.")

    for result in search_results[:5]:

        print("\nFile:", result["file"])
        print("Relevance score:", result["score"])

        for symbol in result["symbols"]:
            print(
                "Function/Class:",
                symbol["name"],
                "| Line:",
                symbol["line"]
            )

    print("\nSearch completed!")
