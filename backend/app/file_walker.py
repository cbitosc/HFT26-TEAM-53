import os
from pathlib import Path

from config import IGNORE_DIRS, IGNORE_EXTS, MAX_FILE_BYTES, SUPPORTED_EXTS

SKIP_SUFFIXES = tuple(IGNORE_EXTS)


def walk_repo(root: Path):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS and d != "__MACOSX"]
        for name in filenames:
            lower = name.lower()
            if lower.endswith(SKIP_SUFFIXES) or name.startswith("._"):
                continue
            p = Path(dirpath) / name
            if p.suffix.lower() not in SUPPORTED_EXTS:
                continue
            if p.stat().st_size > MAX_FILE_BYTES:
                continue
            yield p