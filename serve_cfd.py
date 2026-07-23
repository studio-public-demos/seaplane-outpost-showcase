import http.server
import socketserver
import os

os.chdir(r'C:\Users\venka\OneDrive\Documents\Default Project')

PORT = 8091

class CORSHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Cross-Origin-Resource-Policy', 'cross-origin')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def log_message(self, format, *args):
        pass

with socketserver.TCPServer(("127.0.0.1", PORT), CORSHandler) as httpd:
    print(f"CFD server ready: http://127.0.0.1:{PORT}/car_cfd_viewer.html", flush=True)
    httpd.serve_forever()
