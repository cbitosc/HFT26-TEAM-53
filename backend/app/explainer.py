import json
import os
import urllib.error
import urllib.request

from dotenv import load_dotenv

load_dotenv()


def _chat(prompt: str) -> str:
    base = os.getenv("LLM_BASE_URL", "https://api.featherless.ai/v1").rstrip("/")
    body = json.dumps({
        "model": os.getenv("LLM_MODEL"),
        "messages": [{"role": "user", "content": prompt}],
    }).encode("utf-8")
    req = urllib.request.Request(
        base + "/chat/completions",
        data=body,
        headers={
            "Authorization": "Bearer " + os.getenv("LLM_API_KEY", ""),
            "Content-Type": "application/json",
            "User-Agent": "CodeAtlas/1.0",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "CodeAtlas",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        data = json.load(r)
    return data["choices"][0]["message"]["content"]


def explain(query: str, results: list) -> dict:
    """Return {"text", "cited_files", "generated_by"}.

    cited_files always comes from the retrieved results, never from the model's text.
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
        return {
            "text": _chat(prompt),
            "cited_files": cited,
            "generated_by": "llm",
        }
    except urllib.error.HTTPError as e:
        print("LLM ERROR: HTTP", e.code, e.read().decode("utf-8", "replace")[:300])
    except Exception as e:
        print("LLM ERROR:", repr(e))

    return {
        "text": "The AI explanation failed. See the matched code references.",
        "cited_files": cited,
        "generated_by": "none",
    }