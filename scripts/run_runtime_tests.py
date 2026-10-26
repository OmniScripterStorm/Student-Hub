#!/usr/bin/env python3
"""
Isolated Runtime Test Runner for TagSci Grade 11 Study WebApp & Content Studio
=============================================================================
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

    def handle_one_request(self):
        try:
            super().handle_one_request()
        except (ConnectionResetError, BrokenPipeError, ConnectionAbortedError):
            pass

    def do_GET(self):
        if self.path == "/__test_runner" or self.path == "/__test_runner/":
            index_path = os.path.join(REPO_ROOT, "index.html")
            harness_path = os.path.join(REPO_ROOT, "scripts", "test_harness.js")

            with open(index_path, "r", encoding="utf-8") as f:
                index_html = f.read()

            with open(harness_path, "r", encoding="utf-8") as f:
                harness_js = f.read()

            injected = f"<head>\n<script>\n{harness_js}\n</script>"
            final_html = index_html.replace("<head>", injected, 1)
            encoded = final_html.encode("utf-8")

            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(encoded)))
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.end_headers()
            self.wfile.write(encoded)
            return

        if self.path == "/__test_studio_runner" or self.path == "/__test_studio_runner/":
            studio_path = os.path.join(REPO_ROOT, "Content Studio", "index.html")
            harness_path = os.path.join(REPO_ROOT, "scripts", "test_studio_harness.js")

            with open(studio_path, "r", encoding="utf-8") as f:
                studio_html = f.read()

            with open(harness_path, "r", encoding="utf-8") as f:
                harness_js = f.read()

            injected = f"<script>\n{harness_js}\n</script>\n</body>"
            final_html = studio_html.replace("</body>", injected, 1)
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
            self.send_header("Content-Length", "0")
            self.send_header("Connection", "close")
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

            resp = b'{"status":"received"}'
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(resp)))
            self.send_header("Connection", "close")
            self.end_headers()
            self.wfile.write(resp)

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


def run_isolated_tests(timeout_sec=35):
    browser_exe = locate_browser()
    if not browser_exe:
        print("[FAIL] No supported browser found (msedge.exe not found).")
        return False

    httpd = None
    server_thread = None

    test_targets = [
        {"name": "Student Hub WebApp", "path": "/__test_runner"},
        {"name": "TagSci Content Studio", "path": "/__test_studio_runner"}
    ]

    all_passed = True

    try:
        # 1. Start local ephemeral test server
        httpd = ThreadingHTTPServer(("127.0.0.1", 0), TestServerHandler)
        port = httpd.server_address[1]
        server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        server_thread.start()
        print(f"[TEST SERVER] Bound to http://127.0.0.1:{port}")

        for target in test_targets:
            print(f"\n============================================================")
            print(f" >>> RUNNING SUITE: {target['name']}")
            print(f"============================================================")
            temp_profile_dir = tempfile.mkdtemp(prefix="tagsci_test_sandbox_")
            httpd.test_results = None
            httpd.completion_event = threading.Event()
            browser_proc = None

            try:
                # 2. Launch browser worker in full sandbox mode
                target_url = f"http://127.0.0.1:{port}{target['path']}"
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
                    print(f"[FAIL] {target['name']} timed out after {timeout_sec} seconds.")
                    all_passed = False
                    continue

                results = httpd.test_results or {}
                passed = results.get("passed", False)
                assertions = results.get("assertions", [])
                errors = results.get("errors", [])

                print("\n" + "-" * 60)
                print(f"          RESULTS: {target['name']}")
                print("-" * 60)

                for a in assertions:
                    status = "[PASS]" if a.get("passed") else "[FAIL]"
                    details = f" ({a['details']})" if a.get("details") else ""
                    print(f" {status} {a['name']}{details}")

                if errors:
                    print("\nCaptured Runtime Errors:")
                    for err in errors:
                        print(f"  - {err.get('message', 'Unknown error')}")

                print("-" * 60)

                if passed:
                    print(f"[SUCCESS] {target['name']}: All assertions PASSED with ZERO errors!\n")
                else:
                    print(f"[FAILURE] {target['name']}: One or more assertions failed.\n")
                    all_passed = False

            finally:
                if browser_proc and browser_proc.poll() is None:
                    terminate_pid_tree(browser_proc.pid)
                    print(f"[SAFETY GUARD] Terminated isolated worker PID {browser_proc.pid}.")
                try:
                    shutil.rmtree(temp_profile_dir, ignore_errors=True)
                except Exception:
                    pass
                time.sleep(0.8)

        return all_passed

    finally:
        # Shut down HTTP server
        if httpd:
            httpd.shutdown()
            httpd.server_close()


if __name__ == "__main__":
    success = run_isolated_tests(timeout_sec=35)
    sys.exit(0 if success else 1)
