#!/usr/bin/env python3
"""Dev server for oiljs: everything no-store so edited ES modules always reload."""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8471
    handler = partial(NoCacheHandler, directory=".")
    print(f"oiljs on http://localhost:{port}")
    ThreadingHTTPServer(("", port), handler).serve_forever()
