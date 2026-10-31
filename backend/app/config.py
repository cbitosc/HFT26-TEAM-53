from pathlib import Path

WORKSPACE = Path("workspace")
MAX_FILE_BYTES = 500_000
IGNORE_DIRS = {".git", "node_modules", "venv", ".venv", "__pycache__",
               "dist", "build", "target", ".idea", ".next", "vendor"}
IGNORE_EXTS = {".png", ".jpg", ".gif", ".pdf", ".zip", ".exe", ".dll",
               ".so", ".pyc", ".lock", ".min.js", ".map"}
SUPPORTED_EXTS = {".py", ".js", ".ts", ".java"}  # limited languages for prototype
MAX_UPLOAD_BYTES = 50_000_000