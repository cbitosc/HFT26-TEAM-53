import re

import file_walker
from config import WORKSPACE

CHUNK_LINES = 40
LOW_PRIORITY = ("test", "example", "docs", "demo", "tutorial", "benchmark")
STOP = {"the", "are", "how", "what", "where", "does", "and", "for", "this",
        "that", "which", "with", "from", "handled", "implemented"}
SYMBOL = re.compile(r"^\s*(?:async\s+def|def|class|function)\s+(\w+)")
_cache = {}


def _stem(t):
    for suf in ("ing", "ed", "es", "s"):
        if t.endswith(suf) and len(t) - len(suf) >= 4:
            return t[:-len(suf)]
    return t


def _terms(text):
    return {_stem(t) for t in re.findall(r"[a-zA-Z_]+", text.lower())
            if len(t) > 2 and t not in STOP}


def _chunks(repo_id):
    if repo_id in _cache:
        return _cache[repo_id]
    root = WORKSPACE / repo_id
    out = []
    for p in file_walker.walk_repo(root):
        lines = p.read_text(encoding="utf-8", errors="replace").splitlines()
        rel = p.relative_to(root).as_posix()
        for i in range(0, len(lines), CHUNK_LINES):
            part = lines[i:i + CHUNK_LINES]
            symbol = next((m.group(1) for m in map(SYMBOL.match, part) if m), None)
            text = "\n".join(part)
            out.append({"file_path": rel, "symbol": symbol, "start_line": i + 1,
                        "end_line": i + len(part), "snippet": text, "lower": text.lower()})
    _cache[repo_id] = out
    return out


def search(repo_id, query, top_k=5):
    terms = _terms(query)
    scored = []
    for c in _chunks(repo_id):
        path_l = c["file_path"].lower()
        path_hits = [t for t in terms if t in path_l]
        sym_hits = [t for t in terms if c["symbol"] and t in c["symbol"].lower()]
        body_hits = [t for t in terms if t in c["lower"]]
        score = 3 * len(path_hits) + 4 * len(sym_hits) + len(body_hits)
        if any(w in path_l and w not in terms for w in LOW_PRIORITY):
            score *= 0.5
        if score == 0:
            continue
        reasons = ([f"path match: {t}" for t in path_hits]
                   + [f"symbol in region: {c['symbol']}" for _ in sym_hits[:1]]
                   + [f"body match: {t}" for t in body_hits])
        scored.append((score, c, reasons, body_hits + path_hits))
    scored.sort(key=lambda x: -x[0])
    top = scored[:top_k]
    best = top[0][0] if top else 1
    return [{**{k: c[k] for k in ("file_path", "symbol", "start_line", "end_line", "snippet")},
             "score": round(s / best, 2), "match_reasons": r, "matched": sorted(set(m))}
            for s, c, r, m in top]