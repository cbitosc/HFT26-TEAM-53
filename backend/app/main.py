from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from config import WORKSPACE
import repo_loader, file_walker
from schemas import SearchReq, SearchResponse, Result, Explanation

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class CloneReq(BaseModel):
    url: str


@app.post("/repos/clone")
def clone(req: CloneReq):
    try:
        return {"repo_id": repo_loader.clone_repo(req.url)}
    except Exception as e:
        raise HTTPException(400, str(e))


@app.post("/repos/upload")
def upload(file: UploadFile):
    return {"repo_id": repo_loader.extract_zip(file.file)}


@app.get("/repos/{repo_id}/files")
def files(repo_id: str):
    root = WORKSPACE / repo_id
    return [p.relative_to(root).as_posix() for p in file_walker.walk_repo(root)]


@app.post("/repos/{repo_id}/search", response_model=SearchResponse)
def search(repo_id: str, req: SearchReq):
    # MOCK DATA: replace with the real retrieval call later
    return SearchResponse(
        query=req.query,
        results=[
            Result(
                file_path="src/auth/login.py",
                symbol="login_user",
                start_line=42,
                end_line=71,
                snippet="def login_user(username, password):\n    ...",
                score=0.83,
                match_reasons=["symbol name match", "keyword: auth"],
            )
        ],
        explanation=Explanation(
            text="MOCK: this is placeholder text, not real analysis.",
            cited_files=["src/auth/login.py:42-71"],
        ),
    )


@app.get("/repos/{repo_id}/file")
def get_file(repo_id: str, path: str, start: int = 1, end: int = 200):
    root = (WORKSPACE / repo_id).resolve()
    target = (root / path).resolve()

    if not target.is_relative_to(root) or not target.is_file():
        raise HTTPException(404, "File not found")

    lines = target.read_text(encoding="utf-8", errors="replace").splitlines()

    return {
        "file_path": path.replace("\\", "/"),
        "start_line": start,
        "end_line": min(end, len(lines)),
        "content": "\n".join(lines[start - 1:end]),
    }