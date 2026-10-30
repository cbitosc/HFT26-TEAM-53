
from pathlib import Path
from code_search import search_repository
from ai_engine import generate_ai_response


def ask_codelens(question):

    # Locate the project repository
    project_path = Path(__file__).resolve().parent.parent

    # Search for relevant files
    results = search_repository(project_path, question)

    if not results:
        return "No relevant code found in this repository."

    # Prepare context using the top 3 search results
    context_parts = []

    for item in results[:3]:

        context_parts.append(
            f"""
File: {item['file']}
Relevance Score: {item['score']}

Relevant Functions and Classes:
{', '.join(symbol['name'] for symbol in item['symbols']) or 'No matching symbols found'}

Repository Code:
{item['content']}
"""
        )

    repository_context = "\n".join(context_parts)

    # Generate an answer using repository evidence
    answer = generate_ai_response(
        question,
        repository_context
    )

    return answer


if __name__ == "__main__":

    print("\n========== CODELENS AI ==========")

    question = input("\nAsk a question about your code: ")

    print("\nAnalyzing repository...")

    response = ask_codelens(question)

    print("\n========== AI ANSWER ==========")
    print(response)
