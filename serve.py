import http.server
import socketserver
import webbrowser
import sys
import os

os.chdir(r'C:\Users\venka\OneDrive\Documents\Default Project')

PORT = 8090

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

with socketserver.TCPServer(("127.0.0.1", PORT), QuietHandler) as httpd:
    print(f"Server ready: http://127.0.0.1:{PORT}/car_viewer.html", flush=True)
    webbrowser.open(f"http://127.0.0.1:{PORT}/car_viewer.html")
    httpd.serve_forever()
