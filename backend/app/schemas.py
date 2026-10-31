from pydantic import BaseModel

class SearchReq(BaseModel):
    query: str
    top_k: int = 5

class Result(BaseModel):
    file_path: str
    symbol: str | None = None
    start_line: int
    end_line: int
    snippet: str
    score: float
    match_reasons: list[str]

class Explanation(BaseModel):
    text: str
    cited_files: list[str]

class SearchResponse(BaseModel):
    query: str
    results: list[Result]
    explanation: Explanation | None = None