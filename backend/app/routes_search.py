from fastapi import APIRouter
from schemas import SearchReq, SearchResponse, SearchResult, AskReq, AskResponse
import registry, retrieval, explainer

router = APIRouter()

def run_search(repo_id: str, query: str, top_k: int) -> list[SearchResult]:
    registry.require_repo(repo_id)
    results = []
    for r in retrieval.search(repo_id, query, top_k):
        desc = f"{r['file_path']} lines {r['start_line']}-{r['end_line']}"
        if r["symbol"]:
            desc += f"; defines `{r['symbol']}`"
        if r["matched"]:
            desc += "; matched terms: " + ", ".join(r["matched"])
        results.append(SearchResult(description=desc, **{k: r[k] for k in (
            "file_path", "symbol", "start_line", "end_line", "snippet", "score", "match_reasons")}))
    return results

@router.post("/search", response_model=SearchResponse)
def search(req: SearchReq):
    return SearchResponse(repo_id=req.repo_id, query=req.query,
                          results=run_search(req.repo_id, req.query, req.top_k))

@router.post("/ask", response_model=AskResponse)
def ask(req: AskReq):
    refs = run_search(req.repo_id, req.question, req.top_k)
    exp = explainer.explain(req.question, refs)
    return AskResponse(repo_id=req.repo_id, question=req.question,
                       answer=exp["text"], answer_source=exp["generated_by"],
                       references=refs)