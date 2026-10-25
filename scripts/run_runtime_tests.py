#!/usr/bin/env python3
"""
Isolated Runtime Test Runner for TagSci Grade 11 Study WebApp
=============================================================
Safely executes runtime validation in an isolated, sandboxed browser
worker with zero interference to the user's active browser sessions.
"""

import sys
import os
import time
import json
import shutil
import tempfile
import threading
import subprocess
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EDGE_PATHS = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
]

class TestServerHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=REPO_ROOT, **kwargs)

    def do_GET(self):
        if self.path == "/__test_runner" or self.path == "/__test_runner/":
            index_path = os.path.join(REPO_ROOT, "index.html")
            harness_path = os.path.join(REPO_ROOT, "scripts", "test_harness.js")

            with open(index_path, "r", encoding="utf-8") as f:
                index_html = f.read()

            with open(harness_path, "r", encoding="utf-8") as f:
                harness_js = f.read()

            injected = f"<script>\n{harness_js}\n</script>\n</body>"
            final_html = index_html.replace("</body>", injected, 1)
            encoded = final_html.encode("utf-8")

            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(encoded)))
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.end_headers()
            self.wfile.write(encoded)
            return

        return super().do_GET()

    def do_POST(self):
        if self.path == "/__log":
            content_len = int(self.headers.get("Content-Length", 0))
            msg = self.rfile.read(content_len).decode("utf-8", errors="replace")
            print(f"[BROWSER LOG] {msg}")
            self.send_response(200)
            self.end_headers()
            return

        if self.path == "/__report_results":
            content_len = int(self.headers.get("Content-Length", 0))
            post_body = self.rfile.read(content_len).decode("utf-8")
            try:
                data = json.loads(post_body)
                self.server.test_results = data
            except Exception as e:
                self.server.test_results = {"passed": False, "error": str(e)}

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"status":"received"}')

            # Signal test completion
            self.server.completion_event.set()
            return

        self.send_error(404, "Unknown endpoint")

    def log_message(self, format, *args):
        # Silence routine HTTP requests
        pass


def locate_browser():
    for p in EDGE_PATHS:
        if os.path.exists(p):
            return p
    return None


def terminate_pid_tree(pid):
    """Safely terminates ONLY the specific child PID and its descendants."""
    if not pid:
        return
    try:
        subprocess.run(
            ["taskkill", "/PID", str(pid), "/T", "/F"],
            capture_output=True,
            check=False
        )
    except Exception:
        pass


def run_isolated_tests(timeout_sec=15):
    browser_exe = locate_browser()
    if not browser_exe:
        print("[FAIL] No supported browser found (msedge.exe not found).")
        return False

    temp_profile_dir = tempfile.mkdtemp(prefix="tagsci_test_sandbox_")
    httpd = None
    server_thread = None
    browser_proc = None

    try:
        # 1. Start local ephemeral test server
        httpd = ThreadingHTTPServer(("127.0.0.1", 0), TestServerHandler)
        port = httpd.server_address[1]
        httpd.test_results = None
        httpd.completion_event = threading.Event()

        server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        server_thread.start()
        print(f"[TEST SERVER] Bound to http://127.0.0.1:{port}")

        # 2. Launch browser worker in full sandbox mode
        target_url = f"http://127.0.0.1:{port}/__test_runner"
        flags = [
            browser_exe,
            "--headless=new",
            "--disable-gpu",
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--disable-extensions",
            "--no-first-run",
            "--no-default-browser-check",
            "--disable-background-networking",
            "--disable-sync",
            "--remote-debugging-port=0",
            f"--user-data-dir={temp_profile_dir}",
            target_url
        ]

        browser_proc = subprocess.Popen(
            flags,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        print(f"[BROWSER WORKER] Spawned isolated worker (PID: {browser_proc.pid})")
        print("[SAFETY GUARD] Active browser sessions are completely untouched.")

        # 3. Await test callback
        completed = httpd.completion_event.wait(timeout=timeout_sec)

        if not completed:
            print(f"[FAIL] Runtime test timed out after {timeout_sec} seconds.")
            return False

        results = httpd.test_results or {}
        passed = results.get("passed", False)
        assertions = results.get("assertions", [])
        errors = results.get("errors", [])

        print("\n" + "=" * 60)
        print("          RUNTIME TEST RESULTS SUMMARY")
        print("=" * 60)

        for a in assertions:
            status = "[PASS]" if a.get("passed") else "[FAIL]"
            details = f" ({a['details']})" if a.get("details") else ""
            print(f" {status} {a['name']}{details}")

        if errors:
            print("\nCaptured Runtime Errors:")
            for err in errors:
                print(f"  - {err.get('message', 'Unknown error')}")

        print("=" * 60)

        if passed:
            print("[SUCCESS] All runtime assertions PASSED with ZERO console errors!\n")
            return True
        else:
            print("[FAILURE] One or more runtime assertions failed.\n")
            return False

    finally:
        # 4. Strict Cleanup: Kill ONLY the spawned worker PID
        if browser_proc and browser_proc.poll() is None:
            terminate_pid_tree(browser_proc.pid)
            print(f"[SAFETY GUARD] Terminated isolated worker PID {browser_proc.pid}.")

        # 5. Shut down HTTP server
        if httpd:
            httpd.shutdown()
            httpd.server_close()

        # 6. Delete ephemeral sandbox directory
        shutil.rmtree(temp_profile_dir, ignore_errors=True)


if __name__ == "__main__":
    success = run_isolated_tests()
    sys.exit(0 if success else 1)
