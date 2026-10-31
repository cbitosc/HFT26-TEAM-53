import json, re
from collections import Counter
from datetime import datetime, timezone
from fastapi import HTTPException
from config import WORKSPACE
import file_walker

META_DIR = WORKSPACE / "_meta"
ID_PATTERN = re.compile(r"^[a-f0-9]{8}$")

def build_meta(repo_id, name, source, source_url=None):
    root = WORKSPACE / repo_id
    files = []
    for p in file_walker.walk_repo(root):
        text = p.read_text(encoding="utf-8", errors="replace")
        files.append({
            "path": p.relative_to(root).as_posix(),
            "language": p.suffix.lower().lstrip("."),
            "size_bytes": p.stat().st_size,
            "line_count": text.count("\n") + 1,
        })
    meta = {
        "repo_id": repo_id, "name": name, "source": source, "source_url": source_url,
        "status": "ready", "file_count": len(files),
        "total_lines": sum(f["line_count"] for f in files),
        "languages": dict(Counter(f["language"] for f in files)),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "files": files,
    }
    META_DIR.mkdir(parents=True, exist_ok=True)
    (META_DIR / f"{repo_id}.json").write_text(json.dumps(meta), encoding="utf-8")
    return meta

def require_repo(repo_id: str) -> dict:
    path = META_DIR / f"{repo_id}.json"
    if not ID_PATTERN.match(repo_id) or not path.exists():
        raise HTTPException(404, "Repository not found")
    return json.loads(path.read_text(encoding="utf-8"))