import subprocess, uuid, zipfile, shutil
from pathlib import Path
from urllib.parse import urlparse
from config import WORKSPACE

def clone_repo(url: str) -> str:
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.netloc != "github.com":
        raise ValueError("Only https://github.com URLs are allowed")
    repo_id = uuid.uuid4().hex[:8]
    dest = WORKSPACE / repo_id
    WORKSPACE.mkdir(exist_ok=True)
    subprocess.run(["git", "clone", "--depth", "1", url, str(dest)],
                   check=True, timeout=120, capture_output=True)
    return repo_id

def extract_zip(file_obj) -> str:
    repo_id = uuid.uuid4().hex[:8]
    dest = (WORKSPACE / repo_id).resolve()
    dest.mkdir(parents=True)
    with zipfile.ZipFile(file_obj) as z:
        for member in z.namelist():
            target = (dest / member).resolve()
            if not str(target).startswith(str(dest)):   # zip-slip protection
                shutil.rmtree(dest)
                raise ValueError("Unsafe path in archive")
        z.extractall(dest)
    return repo_id