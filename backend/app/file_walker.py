import os
from pathlib import Path
from config import *

def walk_repo(root: Path):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]
        for name in filenames:
            p = Path(dirpath) / name
            if p.suffix.lower() not in SUPPORTED_EXTS: continue
            if p.stat().st_size > MAX_FILE_BYTES: continue
            yield p