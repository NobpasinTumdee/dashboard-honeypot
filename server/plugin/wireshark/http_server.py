import sqlite3
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from collections import Counter, defaultdict
import os
import time
from threading import Lock
from datetime import datetime, timedelta
import random

# -----------------------------
# Config
# -----------------------------
DB_FILE ='/home/cpe27/HeneyPot.db'
MOCK_DIR = '/home/cpe27/mock_ubuntu'
OPEN_PORTS = [22, 23, 80, 443]
WELL_KNOWN_PORTS = set(range(0, 1024))
PREFERRED_PORTS = [8000, 8001, 8002, 8080, 5000, 3000, 8888]
CURRENT_PORT_FILE = '/home/cpe27/dashboard-honeypot/server/plugin/wireshark/current_port.txt'
IP_SERVER = "172.29.169.27"

# -----------------------------
# DDos Detection Config
# -----------------------------
MAX_REQUESTS_PER_SECOND = 20  # ถ้าเกิน จะ shutdown
request_times = []
request_lock = Lock()

def create_mock_fs(root, files_per_dir=2):
    """
    สร้างโครงสร้างโฟลเดอร์ไม่ให้ดู 'กลวง' และสร้างไฟล์เปล่า (empty files)
    - root: พาธรากของ mock filesystem
    - files_per_dir: จำนวนไฟล์ placeholder ที่จะสร้างในแต่ละไดเรกทอรี (default 2)
    """
    now = time.time()
    os.makedirs(root, exist_ok=True)

    # โครงสร้างโฟลเดอร์มาตรฐานที่มักพบบน Ubuntu
    dirs = [
        "bin", "boot", "dev", "etc", "home/os", "home/user", "home/os/.ssh",
        "lib", "lib64", "opt", "proc", "root", "sbin", "srv", "tmp",
        "usr/bin", "usr/local/bin", "var/log", "var/log/apt", "var/www/html",
        "var/backups", "run", "mnt", "media", "srv/www"
    ]

    # ไฟล์ระบบ/ไฟล์ที่มักเห็น (จะถูกสร้างเป็นไฟล์เปล่า)
    common_files = [
        "etc/hostname",
        "etc/os-release",
        "etc/passwd",
        "etc/shadow",
        "home/os/.bashrc",
        "home/os/.bash_history",
        "home/os/README.txt",
        "home/os/.ssh/authorized_keys",
        "var/www/html/index.html",
        "usr/local/bin/fakeapp",
        "README_HOSTING.txt",
        "var/log/syslog",
        "var/log/auth.log",
        "var/log/apt/history.log",
        "tmp/temp_upload",
        "root/.profile",
        "usr/bin/ls",
    ]

    # สร้างไดเรกทอรี
    for d in dirs:
        full_dir = os.path.join(root, d)
        try:
            os.makedirs(full_dir, exist_ok=True)
        except Exception as e:
            print(f"[Honeypot] Failed to create dir {full_dir}: {e}")

    # สร้างไฟล์ common (empty)
    for relpath in common_files:
        full = os.path.join(root, relpath)
        try:
            parent = os.path.dirname(full)
            if parent and not os.path.exists(parent):
                os.makedirs(parent, exist_ok=True)
            # สร้างไฟล์เปล่า
            open(full, "wb").close()
            # ตั้งเวลาแก้ไขแบบสุ่มเล็กน้อยเพื่อให้ดูสมจริง
            mtime = now - random.randint(0, 30 * 24 * 3600)
            os.utime(full, (mtime, mtime))
        except Exception as e:
            print(f"[Honeypot] Failed to create file {full}: {e}")

    # เติมไฟล์ placeholder ในแต่ละโฟลเดอร์เพื่อไม่ให้ดูว่างเปล่า
    placeholder_names = ["README", "placeholder1", "placeholder2", "notes.txt", "index.html"]
    for d in dirs:
        dir_full = os.path.join(root, d)
        # อย่าใส่ไฟล์เพิ่มเติมในบางโฟลเดอร์ที่ไม่ควร (เช่น proc, dev)
        if d in ("proc", "dev", "run"):
            continue
        try:
            for i in range(files_per_dir):
                name = placeholder_names[i % len(placeholder_names)]
                # หลีกเลี่ยงชื่อซ้ำ: เพิ่มเลขหากไฟล์มีอยู่แล้ว
                candidate = os.path.join(dir_full, name)
                if os.path.exists(candidate):
                    candidate = os.path.join(dir_full, f"{name}.{i}")
                open(candidate, "wb").close()
                mtime = now - random.randint(0, 30 * 24 * 3600)
                os.utime(candidate, (mtime, mtime))
        except Exception as e:
            print(f"[Honeypot] Failed to add placeholders in {dir_full}: {e}")

    print(f"[Honeypot] Mock filesystem ready at {root}")

# -----------------------------
# เลือกพอร์ตตามสถิติ (ย้อนหลังสูงสุด 7 วัน)
# -----------------------------
def select_port_from_stats():
    today = datetime.now().date()
    selected_port = None

    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
    except sqlite3.Error as e:
        print(f"[Honeypot] DB error: {e}")
        return None  # ไม่เปิด server

    # ลูปย้อนหลังสูงสุด 7 วัน
    for day_offset in range(0, 7):
        check_date = today - timedelta(days=day_offset)
        check_date_str = check_date.strftime("%Y-%m-%d")

        try:
            # ใช้ SUM(count) เพื่อรวมจำนวนจริงของแต่ละพอร์ต
            c.execute(
                "SELECT dst_port, SUM(count) FROM DstPortStats WHERE date(timestamp) = ? GROUP BY dst_port",
                (check_date_str,)
            )
            rows = c.fetchall()
        except sqlite3.Error as e:
            print(f"[Honeypot] DB query error: {e}")
            rows = []

        port_counts = Counter()
        for dst_port, total_count in rows:
            try:
                port = int(dst_port)
                if port not in OPEN_PORTS and port not in WELL_KNOWN_PORTS:
                    port_counts[port] = int(total_count)
            except (TypeError, ValueError):
                continue

        if port_counts:
            # เลือกพอร์ตมากที่สุด
            max_count = max(port_counts.values())
            top_ports = [p for p, count in port_counts.items() if count == max_count]
            selected_port = next((p for p in PREFERRED_PORTS if p in top_ports), top_ports[0])

            # แสดงสถิติเรียงตาม PREFERRED_PORTS
            print(f"[Honeypot] สถิติพอร์ตของวันที่ {check_date_str}:")
            for p in PREFERRED_PORTS:
                if p in port_counts:
                    mark = " <-- เลือก" if p == selected_port else ""
                    print(f"  พอร์ต {p}: {port_counts[p]} ครั้ง{mark}")

            break  # เจอข้อมูลแล้ว ไม่ต้องย้อนวันต่อไป

    conn.close()

    if selected_port is None:
        print("[Honeypot] ไม่มีพอร์ตน่าสงสัยให้รัน server")
        return None

    # บันทึกพอร์ตปัจจุบัน
    with open(CURRENT_PORT_FILE, 'w') as f:
        f.write(str(selected_port))

    print(f"[Honeypot] เลือกพอร์ตใหม่ตามสถิติ: {selected_port} (จากวันที่ {check_date_str})")
    return selected_port

# -----------------------------
# Honeypot HTTP Handler
# -----------------------------
class HoneypotHTTPRequestHandler(SimpleHTTPRequestHandler):

    # Sandbox path
    def translate_path(self, path):
        # ปรับ path ให้ชี้ภายใน MOCK_DIR เท่านั้น
        requested = os.path.normpath(os.path.join(MOCK_DIR, path.lstrip('/')))
        if not requested.startswith(os.path.abspath(MOCK_DIR)):
            return None
        return requested

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

        # ถ้าเป็นไฟล์จริง ให้ตอบ 404 เพื่อหลอกคนที่กดดูไฟล์
        if os.path.isfile(safe_path):
            # Log เบื้องต้น
            print(f"[Honeypot] File access attempt -> returning 404 for {self.path} (mapped {safe_path})")
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            # ข้อความ 404 แบบเรียบง่าย
            body = b"<html><head><title>404 Not Found</title></head><body><h1>404 Not Found</h1><p>The requested file was not found on this server.</p></body></html>"
            self.wfile.write(body)
            return

        # ถ้าเป็นไดเรกทอรี ให้ใช้ behavior ปกติของ SimpleHTTPRequestHandler (list directory / serve index)
        if os.path.isdir(safe_path):
            # เปลี่ยน working dir ชั่วคราวให้ SimpleHTTPRequestHandler ทำงานถูกต้อง
            cwd = os.getcwd()
            try:
                os.chdir(MOCK_DIR)
                # ปรับ self.path ให้ relative กับ MOCK_DIR ก่อนเรียก parent
                super().do_GET()
            finally:
                os.chdir(cwd)
            return

        # ถ้า path ไม่มีอยู่จริง ให้ตอบ 404 ตามปกติ
        self.send_response(404)
        self.end_headers()
        self.wfile.write(b'404 Not Found')

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
    # สร้าง mock fs ถ้ายังไม่มี
    if not os.path.exists(MOCK_DIR) or not os.listdir(MOCK_DIR):
        create_mock_fs(MOCK_DIR)

    port = select_port_from_stats()
    if port is None:
        print("[Honeypot] ไม่มีพอร์ตให้รัน server — abort")
    else:
        # chdir ไม่จำเป็นเพราะ handler จะ chdir ชั่วคราวก่อน serve directory
        server_address = (IP_SERVER, port)
        httpd = ThreadingHTTPServer(server_address, HoneypotHTTPRequestHandler)
        print(f"[Honeypot] Fake Ubuntu server (sandboxed) running at http://{IP_SERVER}:{port}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("[Honeypot] Server stopped manually")