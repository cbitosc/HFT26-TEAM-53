from pathlib import Path

WORKSPACE = (
    Path(__file__).resolve().parents[3]
    / "HFT26-TEAM-53-backend"
    / "backend"
    / "app"
    / "workspace"
)

MAX_FILE_BYTES = 500_000

IGNORE_DIRS = {
    ".git", "node_modules", "venv", ".venv", "__pycache__",
    "dist", "build", "target", ".idea", ".next", "vendor"
}

IGNORE_EXTS = {
    ".png", ".jpg", ".gif", ".pdf", ".zip", ".exe", ".dll",
    ".so", ".pyc", ".lock", ".min.js", ".map"
}

SUPPORTED_EXTS = {".py", ".js", ".ts", ".java"}

MAX_UPLOAD_BYTES = 50_000_000