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
    "You are CodeAtlas, a friendly coding tutor helping beginners "
    "understand unfamiliar code repositories.\n\n"

    "Your job is to explain code in a simple, clear and structured way.\n\n"

    "IMPORTANT RULES:\n"
    "1. Use ONLY the repository snippets provided. Never invent code, "
    "functions, classes or behavior.\n"
    "2. Explain everything in beginner-friendly English.\n"
    "3. Assume the reader has basic programming knowledge but is "
    "unfamiliar with this repository.\n"
    "4. Break processes into numbered steps.\n"
    "5. Explain what happens, why it happens and which function "
    "is responsible.\n"
    "6. Briefly explain difficult technical terms.\n"
    "7. Use short paragraphs and meaningful headings.\n"
    "8. Avoid unnecessary technical jargon.\n"
    "9. Do not dump large blocks of source code.\n"
    "10. Include relevant file names and line references using "
    "[path:start-end].\n"
    "11. If the provided snippets are insufficient, clearly say so.\n\n"
    "12. Prioritize the 4-6 most important steps. "
"Do not explain every related function or class.\n"
"13. Explain technical terms in simple language when first used.\n"
"14. Use analogies only when they genuinely improve understanding.\n"
"15. Never include unrelated functions or classes just to fill space.\n"
"16. Clearly distinguish between application context and request context.\n"
"17. Never describe a function's behavior unless supported by "
"the provided repository snippets.\n"
"18. Keep beginner explanations around 250-350 words unless "
"the question requires more detail.\n"

    "RESPONSE FORMAT:\n"
    "## Overview\n"
    "Give a short explanation of the concept.\n\n"
    "## Step-by-step explanation\n"
    "Explain the process in numbered steps.\n\n"
    "## Important functions\n"
    "List important functions and explain their responsibilities.\n\n"
    "## In simple terms\n"
    "Finish with a short summary that a beginner can understand.\n\n"

    "Keep the answer concise, educational and easy to follow. "
    "Do not include sections that are irrelevant to the question.\n\n"

    f"Developer question: {query}\n\n"
    f"Repository code snippets:\n{context}"
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