import subprocess
import zipfile
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

import registry
import repo_loader
from config import IGNORE_DIRS, MAX_UPLOAD_BYTES, WORKSPACE
from schemas import GithubImportReq, RepoDetails, RepoSummary

router = APIRouter()


@router.post("/upload", response_model=RepoSummary)
def upload(file: UploadFile = File(...)):
    filename = file.filename or ""
    if not filename.lower().endswith(".zip"):
        raise HTTPException(400, "Please upload a .zip file")
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    if size > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "Zip file is too large")
    try:
        repo_id = repo_loader.extract_zip(file.file)
    except zipfile.BadZipFile:
        raise HTTPException(400, "File is not a valid zip archive")
    except ValueError as e:
        raise HTTPException(400, str(e))
    return registry.build_meta(repo_id, Path(filename).stem, "zip")


@router.post("/github/import", response_model=RepoSummary)
def github_import(req: GithubImportReq):
    try:
        repo_id = repo_loader.clone_repo(req.url)
    except ValueError as e:
        raise HTTPException(400, str(e))
    except subprocess.TimeoutExpired:
        raise HTTPException(400, "Cloning took too long. The repository may be too large.")
    except subprocess.CalledProcessError:
        raise HTTPException(
            400,
            "Could not clone this repository. Check that it is a public GitHub repo, "
            "for example https://github.com/owner/repo",
        )
    except FileNotFoundError:
        raise HTTPException(500, "Git is not installed on the server.")
    name = req.url.rstrip("/").split("/")[-1].removesuffix(".git")
    return registry.build_meta(repo_id, name, "github", req.url)


@router.get("/repository/{repo_id}", response_model=RepoDetails)
def repository_details(repo_id: str):
    return registry.require_repo(repo_id)


@router.get("/repository/{repo_id}/file")
def get_file(repo_id: str, path: str, start: int = 1, end: int = 200):
    registry.require_repo(repo_id)
    if start < 1 or end < start:
        raise HTTPException(400, "start must be at least 1 and end must not be less than start")
    clean = path.replace("\\", "/")
    if any(part in IGNORE_DIRS for part in Path(clean).parts):
        raise HTTPException(404, "File not found")
    root = (WORKSPACE / repo_id).resolve()
    target = (root / clean).resolve()
    if not str(target).startswith(str(root)) or not target.is_file():
        raise HTTPException(404, "File not found")
    lines = target.read_text(encoding="utf-8", errors="replace").splitlines()
    return {
        "file_path": clean,
        "start_line": start,
        "end_line": min(end, len(lines)),
        "content": "\n".join(lines[start - 1:end]),
    }