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
MOCK_DIR = '/home/cpe27/dashboard-honeypot/server/plugin/wireshark/mock_ubuntu'
OPEN_PORTS = [22, 23, 80, 443]
WELL_KNOWN_PORTS = set(range(0, 1024))
PREFERRED_PORTS = [8000, 8001, 8002, 5000, 3000, 8888]
CURRENT_PORT_FILE = '/home/cpe27/dashboard-honeypot/server/plugin/wireshark/current_port.txt'
IP_SERVER = "172.29.169.27"

# -----------------------------
# DDos Detection Config
# -----------------------------

MAX_REQUESTS_PER_SECOND = 20
request_times = []
request_lock = Lock()

def create_mock_fs(root, files_per_dir=2, seed=None, minimal_text=False):
    import stat
    if seed is not None:
        random.seed(seed)
    now = time.time()
    os.makedirs(root, exist_ok=True)
    dirs = [
        "bin", "boot", "dev", "etc", "etc/cron.d", "etc/cron.daily", "etc/apache2",
        "etc/nginx", "etc/php", "etc/ssh", "etc/systemd/system", "etc/apt",
        "home", "home/admin", "home/www-data", "home/admin/.ssh", "home/admin/projects",
        "home/admin/projects/app1", "home/admin/projects/app1/.git", "home/admin/.config",
        "lib", "lib64", "opt", "proc", "root", "sbin", "srv", "tmp",
        "usr", "usr/bin", "usr/sbin", "usr/local", "usr/local/bin",
        "var", "var/log", "var/log/apt", "var/log/nginx", "var/log/apache2", "var/log/mysql",
        "var/www", "var/www/html", "var/www/html/wp-content", "var/www/html/wp-includes",
        "var/www/html/admin", "var/www/html/phpmyadmin", "var/www/html/uploads",
        "var/backups", "run", "mnt", "media", "srv/www", "var/www/current"
    ]
    for d in dirs:
        full_dir = os.path.join(root, d)
        try:
            os.makedirs(full_dir, exist_ok=True)
        except Exception as e:
            print(f"[HP] Failed to create dir {full_dir}: {e}")
    hollow_files = [
        "etc/hostname",
        "etc/os-release",
        "etc/hosts",
        "etc/passwd",
        "etc/group",
        "etc/shadow",
        "etc/ssh/sshd_config",
        "etc/ssh/ssh_config",
        "etc/apache2/apache2.conf",
        "etc/nginx/nginx.conf",
        "etc/php/php.ini",
        "etc/systemd/system/ssh.service",
        "etc/apt/sources.list",
        "home/admin/.bashrc",
        "home/admin/.profile",
        "home/admin/.bash_history",
        "home/admin/README.txt",
        "home/admin/.ssh/authorized_keys",
        "home/admin/.ssh/id_rsa",
        "home/admin/.ssh/id_rsa.pub",
        "home/admin/credentials.txt",
        "home/admin/.git-credentials",
        "home/admin/projects/app1/README.md",
        "home/admin/projects/app1/.git/config",
        "home/admin/projects/app1/.git/HEAD",
        "var/www/html/index.html",
        "var/www/html/index.php",
        "var/www/html/admin/index.php",
        "var/www/html/phpmyadmin/index.php",
        "var/www/html/uploads/README.txt",
        "var/www/html/api/login.php",
        "var/www/html/.env",
        "var/www/html/wp-config.php",
        "usr/local/bin/service_helper.sh",
        "usr/bin/grep",
        "usr/bin/awk",
        "sbin/init",
        "bin/bash",
        "bin/ls",
        "var/log/syslog",
        "var/log/auth.log",
        "var/log/apt/history.log",
        "var/log/nginx/access.log",
        "var/log/nginx/error.log",
        "var/log/mysql/error.log",
        "tmp/upload_tmp_123",
        "tmp/session.tmp",
        "root/.profile",
        "var/backups/full_backup_2025-09-01.sql",
        "var/backups/backup_archive_2025-08-15.tar.gz",
        "var/www/html/wp-content/plugins/plugin.php",
        "var/www/current/README.txt"
    ]
    def create_hollow_file(relpath):
        full = os.path.join(root, relpath)
        parent = os.path.dirname(full)
        if parent and not os.path.exists(parent):
            os.makedirs(parent, exist_ok=True)
        try:
            if minimal_text and any(x in relpath for x in ("id_rsa", "credentials", ".env", "shadow", "passwd", "wp-config")):
                with open(full, "w", encoding="utf-8") as f:
                    f.write("[redacted]\n")
            else:
                small_binaries = (".so", ".gz", ".tar.gz")
                if relpath.endswith(".tar.gz") or relpath.endswith(".gz"):
                    with open(full, "wb") as f:
                        f.write(b"\0" * 8192)
                elif any(relpath.endswith(ext) for ext in (".php", ".html", ".txt", ".md", ".conf", ".ini", ".service", ".sh")):
                    with open(full, "w", encoding="utf-8") as f:
                        f.write("<!-- placeholder -->\n")
                else:
                    open(full, "wb").close()
            mtime = now - random.randint(0, 365 * 24 * 3600)
            os.utime(full, (mtime, mtime))
            try:
                if relpath.endswith(".sh"):
                    os.chmod(full, 0o755)
                elif "/.ssh/" in relpath or relpath.endswith("id_rsa"):
                    os.chmod(full, 0o600)
                elif relpath.startswith("var/log") or relpath.endswith(".log"):
                    os.chmod(full, 0o640)
                else:
                    os.chmod(full, 0o644)
            except Exception:
                pass
        except Exception as e:
            print(f"[HP] Failed to create hollow file {full}: {e}")
    for p in hollow_files:
        create_hollow_file(p)
    for d in dirs:
        dirpath = os.path.join(root, d)
        for i in range(files_per_dir):
            name = random.choice([
                "README.md", "notes.txt", "config.cfg", "placeholder.tmp",
                "sample.conf", "info.txt", "index.html"
            ])
            fname = f"{i}_{name}"
            full = os.path.join(dirpath, fname)
            try:
                if minimal_text and fname.lower().find("config") >= 0:
                    with open(full, "w", encoding="utf-8") as f:
                        f.write("[redacted]\n")
                else:
                    open(full, "w", encoding="utf-8").write("placeholder\n")
                mtime = now - random.randint(0, 180 * 24 * 3600)
                os.utime(full, (mtime, mtime))
                os.chmod(full, 0o644)
            except Exception:
                pass
    try:
        target = os.path.join(root, "var/www/html")
        link = os.path.join(root, "var/www/current")
        if os.path.exists(link):
            if os.path.islink(link):
                os.remove(link)
        if os.path.exists(target):
            os.symlink(os.path.relpath(target, os.path.dirname(link)), link)
    except Exception:
        pass
    dev_placeholders = ["null", "tty", "random", "zero"]
    for name in dev_placeholders:
        path = os.path.join(root, "dev", name)
        try:
            open(path, "wb").close()
            os.chmod(path, 0o666)
        except Exception:
            pass
    try:
        archive = os.path.join(root, "var/backups/backup_archive_2025-08-15.tar.gz")
        if not os.path.exists(archive):
            with open(archive, "wb") as f:
                f.write(b"\0" * 16384)
            os.utime(archive, (now - random.randint(0, 365 * 24 * 3600),) * 2)
    except Exception:
        pass
    try:
        git_dir = os.path.join(root, "home/admin/projects/app1/.git")
        if os.path.exists(git_dir):
            with open(os.path.join(git_dir, "HEAD"), "w", encoding="utf-8") as f:
                f.write("ref: refs/heads/main\n")
            refs_heads = os.path.join(git_dir, "refs/heads")
            os.makedirs(refs_heads, exist_ok=True)
            open(os.path.join(refs_heads, "main"), "w").close()
    except Exception:
        pass
    print(f"[HP] Mock FS created at {root} (minimal_text={minimal_text})")

def select_port_from_stats():
    today = datetime.now().date()
    selected_port = None

    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
    except sqlite3.Error as e:
        print(f"[Honeypot] DB error: {e}")
        return None

    for day_offset in range(0, 7):
        check_date = today - timedelta(days=day_offset)
        check_date_str = check_date.strftime("%Y-%m-%d")

        try:
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
            max_count = max(port_counts.values())
            top_ports = [p for p, count in port_counts.items() if count == max_count]
            selected_port = next((p for p in PREFERRED_PORTS if p in top_ports), top_ports[0])

            print(f"[Honeypot] สถิติพอร์ตของวันที่ {check_date_str}:")
            for p in PREFERRED_PORTS:
                if p in port_counts:
                    mark = " <-- เลือก" if p == selected_port else ""
                    print(f"  พอร์ต {p}: {port_counts[p]} ครั้ง{mark}")

            break

    conn.close()

    if selected_port is None:
        print("[Honeypot] ไม่มีพอร์ตน่าสงสัยให้รัน server")
        return None

    with open(CURRENT_PORT_FILE, 'w') as f:
        f.write(str(selected_port))

    print(f"[Honeypot] เลือกพอร์ตใหม่ตามสถิติ: {selected_port} (จากวันที่ {check_date_str})")
    return selected_port

class HoneypotHTTPRequestHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        requested = os.path.normpath(os.path.join(MOCK_DIR, path.lstrip('/')))
        if not requested.startswith(os.path.abspath(MOCK_DIR)):
            return None
        return requested

    def check_ddos(self):
        global request_times
        now = time.time()
        with request_lock:
            request_times = [t for t in request_times if now - t < 1]
            request_times.append(now)
            if len(request_times) > MAX_REQUESTS_PER_SECOND:
                print("[Honeypot] DDos detected! Shutting down server immediately!")
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

        if os.path.isfile(safe_path):
            print(f"[Honeypot] File access attempt -> returning 404 for {self.path} (mapped {safe_path})")
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            body = b"<html><head><title>404 Not Found</title></head><body><h1>404 Not Found</h1><p>The requested file was not found on this server.</p></body></html>"
            self.wfile.write(body)
            return

        if os.path.isdir(safe_path):
            cwd = os.getcwd()
            try:
                os.chdir(MOCK_DIR)
                super().do_GET()
            finally:
                os.chdir(cwd)
            return

        self.send_response(404)
        self.end_headers()
        self.wfile.write(b'404 Not Found')

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

if __name__ == "__main__":
    if not os.path.exists(MOCK_DIR) or not os.listdir(MOCK_DIR):
        create_mock_fs(MOCK_DIR)

    port = select_port_from_stats()
    if port is None:
        print("[Honeypot] ไม่มีพอร์ตให้รัน server — abort")
    else:
        server_address = (IP_SERVER, port)
        httpd = ThreadingHTTPServer(server_address, HoneypotHTTPRequestHandler)
        print(f"[Honeypot] Fake Ubuntu server (sandboxed) running at http://{IP_SERVER}:{port}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("[Honeypot] Server stopped manually")