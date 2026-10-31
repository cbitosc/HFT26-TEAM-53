from pydantic import BaseModel, Field

class GithubImportReq(BaseModel):
    url: str

class FileInfo(BaseModel):
    path: str
    language: str
    size_bytes: int
    line_count: int

class RepoSummary(BaseModel):
    repo_id: str
    name: str
    source: str
    source_url: str | None = None
    status: str
    file_count: int
    total_lines: int
    languages: dict[str, int]
    created_at: str

class RepoDetails(RepoSummary):
    files: list[FileInfo]

class SearchReq(BaseModel):
    repo_id: str
    query: str
    top_k: int = Field(5, ge=1, le=20)

class SearchResult(BaseModel):
    file_path: str
    symbol: str | None = None
    start_line: int
    end_line: int
    snippet: str
    description: str
    score: float
    match_reasons: list[str]

class SearchResponse(BaseModel):
    repo_id: str
    query: str
    results: list[SearchResult]

class AskReq(BaseModel):
    repo_id: str
    question: str
    top_k: int = Field(5, ge=1, le=10)

class AskResponse(BaseModel):
    repo_id: str
    question: str
    answer: str
    answer_source: str
    references: list[SearchResult]