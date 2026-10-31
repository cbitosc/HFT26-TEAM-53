
from fastapi import APIRouter, HTTPException

from config import WORKSPACE
from registry import require_repo
from architecture_analyzer import analyze_repository

router = APIRouter()


@router.get("/architecture/{repo_id}")
def get_repository_architecture(repo_id: str):

    # Validate repository ID and metadata.
    try:
        require_repo(repo_id)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(404, "Repository not found")

    # Locate repository directory safely.
    root = (WORKSPACE / repo_id).resolve()

    if not root.is_relative_to(WORKSPACE.resolve()) or not root.is_dir():
        raise HTTPException(404, "Repository directory not found")

    try:
        result = analyze_repository(root)

        return {
            "success": True,
            "repository_id": repo_id,
            **result
        }

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Architecture analysis failed"
        )
