import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


def explain(query: str, results: list) -> dict:
    """Return {"text", "cited_files", "generated_by"}.

    `results` is a list of SearchResult objects from the index.
    cited_files always comes from those results, never from the model's text.
    """
    cited = [f"{r.file_path}:{r.start_line}-{r.end_line}" for r in results]

    if not results:
        return {
            "text": "No matching code was found for this question.",
            "cited_files": [],
            "generated_by": "none",
        }

    if not os.getenv("LLM_API_KEY"):
        return {
            "text": "AI explanation is not configured. See the matched code references.",
            "cited_files": cited,
            "generated_by": "none",
        }

    context = "\n\n".join(
        f"[{r.file_path}:{r.start_line}-{r.end_line}]\n{r.snippet}" for r in results
    )
    prompt = (
        "Answer the developer's question using ONLY the code snippets below. "
        "Cite sources as [path:start-end]. If the snippets do not answer the "
        "question, say so instead of guessing.\n\n"
        f"Question: {query}\n\nSnippets:\n{context}"
    )

    try:
        client = OpenAI(
            base_url=os.getenv("LLM_BASE_URL"),
            api_key=os.getenv("LLM_API_KEY"),
        )
        resp = client.chat.completions.create(
            model=os.getenv("LLM_MODEL"),
            messages=[{"role": "user", "content": prompt}],
            timeout=30,
        )
        return {
            "text": resp.choices[0].message.content,
            "cited_files": cited,
            "generated_by": "llm",
        }
    except Exception:
        return {
            "text": "The AI explanation failed. See the matched code references.",
            "cited_files": cited,
            "generated_by": "none",
        }