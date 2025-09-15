import sqlite3
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from collections import Counter, defaultdict
import os
import time
from threading import Lock

# -----------------------------
# Config
# -----------------------------
DB_FILE = '/home/os/dashboard-honeypot/server/API/socket/HeneyPot.db'
MOCK_DIR = '/home/os/mock_ubuntu'
OPEN_PORTS = [22, 23, 80, 443]
WELL_KNOWN_PORTS = set(range(0, 1024))
PREFERRED_PORTS = [8000, 8080, 5000, 3000, 8888]
CURRENT_PORT_FILE = '/home/os/dashboard-honeypot/current_port.txt'
IP_SERVER = "10.147.18.208"

# -----------------------------
# DDos Detection Config
# -----------------------------ib'q
MAX_REQUESTS_PER_SECOND = 20  # ถ้าเกิน จะ shutdown
request_times = []
request_lock = Lock()

# -----------------------------
# เลือกพอร์ตตามสถิติ
# -----------------------------
def select_port_from_stats():
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute("SELECT dst_port FROM DstPortStats")
        rows = c.fetchall()
        conn.close()
    except sqlite3.Error as e:
        print(f"[Honeypot] DB error: {e}")
        rows = []

    port_counts = Counter()
    for dst_port_tuple in rows:
        try:
            port = int(dst_port_tuple[0])
            if port not in OPEN_PORTS and port not in WELL_KNOWN_PORTS:
                port_counts[port] += 1
        except (TypeError, ValueError):
            continue

    if not port_counts:
        print("[Honeypot] ไม่มีพอร์ตน่าสงสัยให้รัน server")
        return 8000  # fallback port

    max_count = max(port_counts.values())
    top_ports = [p for p, count in port_counts.items() if count == max_count]
    selected_port = next((p for p in PREFERRED_PORTS if p in top_ports), top_ports[0])

    with open(CURRENT_PORT_FILE, 'w') as f:
        f.write(str(selected_port))

    print(f"[Honeypot] เลือกพอร์ตใหม่ตามสถิติ: {selected_port}")
    return selected_port

# -----------------------------
# Honeypot HTTP Handler
# -----------------------------
class HoneypotHTTPRequestHandler(SimpleHTTPRequestHandler):

    # Sandbox path
    def translate_path(self, path):
        path = os.path.normpath(os.path.join(MOCK_DIR, path.lstrip('/')))
        if not path.startswith(MOCK_DIR):
            return None
        return path

    # DDos check
    def check_ddos(self):
        global request_times
        now = time.time()
        with request_lock:
            request_times = [t for t in request_times if now - t < 1]  # keep last 1 sec
            request_times.append(now)
            if len(request_times) > MAX_REQUESTS_PER_SECOND:
                print("[Honeypot] DDos detected! Shutting down server immediately!")
                # Shutdown server in separate thread
                import threading
                threading.Thread(target=self.server.shutdown).start()

    def do_GET(self):
        self.check_ddos()
        safe_path = self.translate_path(self.path)
        if not safe_path:
            self.send_response(403)
            self.end_headers()
            self.wfile.write(b'403 Forbidden')
            return
        super().do_GET()

    # ป้องกัน method อันตราย
    def do_POST(self):
        self.check_ddos()
        self.send_response(403)
        self.end_headers()
        self.wfile.write(b'403 Forbidden')

    def do_PUT(self):
        self.check_ddos()
        self.send_response(403)
        self.end_headers()
        self.wfile.write(b'403 Forbidden')

    def do_DELETE(self):
        self.check_ddos()
        self.send_response(403)
        self.end_headers()
        self.wfile.write(b'403 Forbidden')

    def do_PATCH(self):
        self.check_ddos()
        self.send_response(403)
        self.end_headers()
        self.wfile.write(b'403 Forbidden')

    def do_CONNECT(self):
        self.check_ddos()
        self.send_response(403)
        self.end_headers()
        self.wfile.write(b'403 Forbidden')

# -----------------------------
# เปิด server
# -----------------------------
if __name__ == "__main__":
    port = select_port_from_stats()
    os.chdir(MOCK_DIR)
    server_address = (IP_SERVER, port)
    httpd = ThreadingHTTPServer(server_address, HoneypotHTTPRequestHandler)
    print(f"[Honeypot] Fake Ubuntu server (sandboxed) running at http://{IP_SERVER}:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("[Honeypot] Server stopped manually")