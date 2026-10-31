"""CodeAtlas API audit.  Usage:  python eval\audit_api.py [base_url]
Sends real HTTP requests to a RUNNING backend (standard library only).
Writes eval/audit_report.json with sample requests and responses."""
import io
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
import zipfile
from pathlib import Path

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080").rstrip("/")
ORIGIN = "http://localhost:5173"
passed = failed = 0
samples = {}


def call(method, path, body=None, raw=None, headers=None):
    data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
    h = {"Origin": ORIGIN}
    if body is not None:
        h["Content-Type"] = "application/json"
    h.update(headers or {})
    req = urllib.request.Request(BASE + path, data=data, headers=h, method=method)
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            status, txt, hdrs = r.status, r.read().decode("utf-8", "replace"), r.headers
    except urllib.error.HTTPError as e:
        status, txt, hdrs = e.code, e.read().decode("utf-8", "replace"), e.headers
    except Exception as e:
        return 0, None, repr(e), {}
    try:
        js = json.loads(txt)
    except Exception:
        js = None
    return status, js, txt, hdrs


def record(name, method, path, body, status, js):
    trimmed = {k: (v[:2] if isinstance(v, list) else v) for k, v in js.items()} if isinstance(js, dict) else js
    samples[name] = {"request": f"{method} {path}", "body": body, "status": status, "response": trimmed}


def check(name, ok, detail=""):
    global passed, failed
    ok = bool(ok)
    passed += ok
    failed += not ok
    print(("PASS  " if ok else "FAIL  ") + name + ("" if ok else "\n        -> " + str(detail)[:400]))


def info(name, value):
    print(f"INFO  {name}: {str(value)[:400]}")


def make_zip(files):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as z:
        for name, text in files.items():
            z.writestr(name, text)
    return buf.getvalue()


def upload(filename, content):
    b = uuid.uuid4().hex
    head = (f'--{b}\r\nContent-Disposition: form-data; name="file"; filename="{filename}"\r\n'
            f"Content-Type: application/octet-stream\r\n\r\n").encode()
    body = head + content + f"\r\n--{b}--\r\n".encode()
    return call("POST", "/upload", raw=body, headers={"Content-Type": f"multipart/form-data; boundary={b}"})


# ---------------------------------------------------------------- server + CORS
s, _, txt, _ = call("GET", "/docs")
check("server reachable at " + BASE, s == 200, f"{s} {txt}")
if s != 200:
    sys.exit("Start the backend first.")
s, _, _, h = call("OPTIONS", "/search", headers={
    "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type"})
check("CORS preflight allows " + ORIGIN, h.get("access-control-allow-origin") == ORIGIN,
      f"status={s} allow-origin={h.get('access-control-allow-origin')}")

# ---------------------------------------------------------------- 1. upload
SAMPLE = {
    "proj/src/app.py": "def login_user(name):\n    return name\n\n\nclass AuthService:\n    def check_password(self, pw):\n        return True\n",
    "proj/src/util.js": "function parseOptions(x) {\n  return x;\n}\n",
    "proj/node_modules/lib/index.js": "var a = 1;\n",
    "proj/.git/config": "[core]\n",
    "proj/build/out.py": "x = 1\n",
    "proj/dist/bundle.js": "var b = 2;\n",
    "proj/static/app.min.js": "var c=3;",
    "proj/README.md": "# demo\n",
}
s, js, txt, _ = upload("sample.zip", make_zip(SAMPLE))
record("POST /upload", "POST", "/upload", "multipart/form-data: file=sample.zip", s, js)
rid = js.get("repo_id") if isinstance(js, dict) else None
check("POST /upload -> 200 with repo_id", s == 200 and rid, f"{s} {txt}")
s, js2, txt, _ = upload("notes.txt", b"hello")
check("upload of non-zip -> 400", s == 400, f"{s} {txt}")
s, js2, txt, _ = upload("broken.zip", b"this is not a zip")
check("upload of corrupt zip -> 400", s == 400, f"{s} {txt}")
s, js2, txt, _ = upload("slip.zip", make_zip({"ok/a.py": "x=1\n", "../escape.py": "x=2\n"}))
check("zip path traversal -> 400", s == 400, f"{s} {txt}")

# ---------------------------------------------------------------- 3. details
paths = []
if rid:
    s, js, txt, _ = call("GET", f"/repository/{rid}")
    record("GET /repository/{repo_id}", "GET", f"/repository/{rid}", None, s, js)
    need = {"repo_id", "name", "source", "status", "file_count", "total_lines", "languages", "created_at", "files"}
    check("details: 200 and all metadata fields", s == 200 and isinstance(js, dict) and need <= set(js), f"{s} {txt[:200]}")
    if s == 200:
        paths = [f["path"] for f in js["files"]]
        check("details: every file has path/language/size_bytes/line_count",
              paths and all({"path", "language", "size_bytes", "line_count"} <= set(f) for f in js["files"]))
        check("details: file_count equals len(files)", js["file_count"] == len(paths), (js["file_count"], len(paths)))
        check("source files indexed (src/app.py)", any(p.endswith("src/app.py") for p in paths), paths)
        for bad in ("node_modules", ".git/", "/build/", "/dist/"):
            check(f"ignored directory excluded: {bad}", not any(bad in p for p in paths), paths)
        check("minified *.min.js excluded", not any(p.endswith(".min.js") for p in paths), paths)
        info("languages value", js["languages"])
        info("first file entry", js["files"][0])
s, js, txt, _ = call("GET", "/repository/00000000")
check("details: unknown repo -> 404 with detail", s == 404 and isinstance(js, dict) and "detail" in js, f"{s} {txt}")
s, js, txt, _ = call("GET", "/repository/not-a-valid-id")
check("details: malformed id -> 404", s == 404, f"{s} {txt}")

# ---------------------------------------------------------------- 4. file content
app_path = next((p for p in paths if p.endswith("src/app.py")), None)
if rid and app_path:
    q = urllib.parse.quote(app_path)
    s, js, txt, _ = call("GET", f"/repository/{rid}/file?path={q}&start=1&end=3")
    record("GET /repository/{repo_id}/file", "GET", f"/repository/{rid}/file?path={app_path}&start=1&end=3", None, s, js)
    check("file: 200 with file_path/start_line/end_line/content",
          s == 200 and isinstance(js, dict) and {"file_path", "start_line", "end_line", "content"} <= set(js)
          and "login_user" in js["content"], f"{s} {txt}")
    s, js, txt, _ = call("GET", f"/repository/{rid}/file?path=../../config.py&start=1&end=5")
    check("file: path traversal -> 404", s == 404, f"{s} {txt[:200]}")
    s, js, txt, _ = call("GET", f"/repository/{rid}/file?path=nope.py")
    check("file: missing file -> 404", s == 404, f"{s} {txt}")
    s, js, txt, _ = call("GET", f"/repository/{rid}/file?path={urllib.parse.quote(app_path.rsplit('/', 1)[0])}")
    check("file: directory path -> 404", s == 404, f"{s} {txt}")
    s, js, txt, _ = call("GET", f"/repository/{rid}/file?path={q}&start=0&end=3")
    info("file: start=0 behaviour (should be 400/422)", f"status={s} body={txt[:150]}")
    s, js, txt, _ = call("GET", f"/repository/{rid}/file?path={q}&start=5&end=2")
    info("file: start>end behaviour (should be 400/422)", f"status={s} body={txt[:150]}")
    s, js, txt, _ = call("GET", f"/repository/{rid}/file?path=.git/config")
    info("file: reading an ignored file (.git/config)", f"status={s}")
s, js, txt, _ = call("GET", "/repository/00000000/file?path=a.py")
check("file: unknown repo -> 404", s == 404, f"{s} {txt}")

# ---------------------------------------------------------------- 5. search
if rid:
    s, js, txt, _ = call("POST", "/search", {"repo_id": rid, "query": "login user", "top_k": 10})
    record("POST /search", "POST", "/search", {"repo_id": rid, "query": "login user", "top_k": 10}, s, js)
    keys = {"file_path", "symbol", "start_line", "end_line", "snippet", "description", "score", "match_reasons"}
    ok = s == 200 and isinstance(js, dict) and js.get("results")
    check("search: 200 with results", ok, f"{s} {txt[:300]}")
    if ok:
        r0 = js["results"][0]
        check("search: result has all fields", keys <= set(r0), set(r0))
        check("search: top result is src/app.py for 'login user'", r0["file_path"].endswith("src/app.py"), r0["file_path"])
        check("search: start_line <= end_line", all(r["start_line"] <= r["end_line"] for r in js["results"]))
        s2, j2, t2, _ = call("GET", f"/repository/{rid}/file?path={urllib.parse.quote(r0['file_path'])}"
                                    f"&start={r0['start_line']}&end={r0['end_line']}")
        check("search: snippet equals file lines at reported range", j2 and j2.get("content") == r0["snippet"], t2[:200])
    s, js, txt, _ = call("POST", "/search", {"repo_id": rid, "query": "", "top_k": 10})
    info("search: empty query", f"status={s} results={len(js['results']) if isinstance(js, dict) and 'results' in js else txt[:100]}")
    s, js, txt, _ = call("POST", "/search", {"repo_id": rid})
    check("search: missing query -> 422", s == 422, f"{s} {txt[:200]}")
    info("422 'detail' type (frontend must handle a list, not a string)", type(js.get("detail")).__name__ if isinstance(js, dict) else None)
    s, js, txt, _ = call("POST", "/search", {"repo_id": rid, "query": "x", "top_k": 50})
    info("search: top_k=50", f"status={s}")
s, js, txt, _ = call("POST", "/search", {"repo_id": "00000000", "query": "x"})
check("search: unknown repo -> 404", s == 404, f"{s} {txt}")

# ---------------------------------------------------------------- 6. ask
if rid:
    body = {"repo_id": rid, "question": "Where is login handled?", "top_k": 10}
    t0 = time.time()
    s, js, txt, _ = call("POST", "/ask", body)
    record("POST /ask", "POST", "/ask", body, s, js)
    ok = s == 200 and isinstance(js, dict) and {"answer", "answer_source", "references"} <= set(js)
    check("ask: 200 with answer/answer_source/references", ok, f"{s} {txt[:300]}")
    if ok:
        info("ask: answer_source / seconds", f"{js['answer_source']} / {time.time() - t0:.1f}")
        check("ask: answer_source is llm or none", js["answer_source"] in ("llm", "none"), js["answer_source"])
        check("ask: references not empty", bool(js["references"]))
        info("ask: answer (first 300 chars)", js["answer"])
        refs = {(r["file_path"], r["start_line"], r["end_line"]) for r in js["references"]}
        cited = re.findall(r"\[([^\]\s:]+):(\d+)-(\d+)\]", js["answer"])
        if js["answer_source"] == "llm":
            bad = [c for c in cited if (c[0], int(c[1]), int(c[2])) not in refs]
            check("ask: every [path:start-end] cited in the answer exists in references", not bad, bad)
    s, js, txt, _ = call("POST", "/ask", {"repo_id": rid, "question": "zzqqxx plorbfnizz", "top_k": 5})
    check("ask: no evidence -> no references, answer_source none",
          s == 200 and isinstance(js, dict) and js["references"] == [] and js["answer_source"] == "none", f"{s} {txt[:300]}")
    if s == 200 and isinstance(js, dict):
        info("ask: no-evidence answer text", js["answer"])
s, js, txt, _ = call("POST", "/ask", {"repo_id": "00000000", "question": "x"})
check("ask: unknown repo -> 404", s == 404, f"{s} {txt}")

# ---------------------------------------------------------------- 2. github import
for label, url in (("non-GitHub host", "https://example.com/x/y"), ("not a URL", "hello world"),
                   ("nonexistent repo", "https://github.com/pallets/this-repo-does-not-exist-xyz")):
    s, js, txt, _ = call("POST", "/github/import", {"url": url})
    check(f"import: {label} -> 400", s == 400, f"{s} {txt[:200]}")
    info(f"import error message ({label})", js.get("detail") if isinstance(js, dict) else txt)
t0 = time.time()
s, js, txt, _ = call("POST", "/github/import", {"url": "https://github.com/pallets/click"})
record("POST /github/import", "POST", "/github/import", {"url": "https://github.com/pallets/click"}, s, js)
check("import: public repo -> 200 with repo_id", s == 200 and isinstance(js, dict) and js.get("repo_id"), f"{s} {txt[:300]}")
if s == 200 and isinstance(js, dict):
    info("import seconds / file_count / languages", f"{time.time() - t0:.1f} / {js['file_count']} / {js['languages']}")
    s, js, txt, _ = call("POST", "/search", {"repo_id": js["repo_id"], "query": "parse options", "top_k": 10})
    if s == 200 and js["results"]:
        info("click 'parse options' top 3 files", [r["file_path"] for r in js["results"][:3]])

# ---------------------------------------------------------------- summary
print(f"\n{passed} passed, {failed} failed")
out = Path(__file__).with_name("audit_report.json")
out.write_text(json.dumps(samples, indent=2), encoding="utf-8")
print("Sample requests/responses saved to", out)