import pyshark
import csv
import sqlite3
from datetime import datetime

interface = 'ztmosdoimw'
csv_file = 'http_packets.csv'
db_file = 'http_packets.db'

# -----------------------------
# สร้าง/เชื่อมต่อฐานข้อมูล SQLite
# -----------------------------
conn = sqlite3.connect(db_file)
c = conn.cursor()
c.execute('''
CREATE TABLE IF NOT EXISTS http_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    src_ip TEXT,
    src_port TEXT,
    dst_ip TEXT,
    dst_port TEXT,
    method TEXT,
    uri TEXT,
    user_agent TEXT
)
''')
conn.commit()

# -----------------------------
# สร้าง CSV และเขียน header
# -----------------------------
with open(csv_file, mode='w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['Timestamp', 'Source IP', 'Source Port', 'Destination IP', 'Destination Port', 'HTTP Method', 'Request URI', 'User-Agent'])

# -----------------------------
# เริ่ม LiveCapture
# -----------------------------
capture = pyshark.LiveCapture(interface=interface, display_filter='http')
print("Starting LiveCapture on interface:", interface)

for pkt in capture.sniff_continuously():
    try:
        if 'HTTP' in pkt:
            # IP
            src_ip = pkt.ip.src if hasattr(pkt, 'ip') else 'N/A'
            dst_ip = pkt.ip.dst if hasattr(pkt, 'ip') else 'N/A'

            # Port
            if hasattr(pkt, 'tcp'):
                src_port = pkt.tcp.srcport
                dst_port = pkt.tcp.dstport
            elif hasattr(pkt, 'udp'):
                src_port = pkt.udp.srcport
                dst_port = pkt.udp.dstport
            else:
                src_port = dst_port = 'N/A'

            # HTTP layer
            http_layer = pkt.http
            if hasattr(http_layer, 'request_method'):
                method = http_layer.request_method
                uri = getattr(http_layer, 'request_uri', '')
                user_agent = getattr(http_layer, 'user_agent', '')

                timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

                # -----------------------------
                # แสดงผล
                # -----------------------------
                print(f"[{timestamp}] {src_ip}:{src_port} -> {dst_ip}:{dst_port} {method} {uri}  User-Agent: {user_agent}")

                # -----------------------------
                # บันทึกลง CSV
                # -----------------------------
                with open(csv_file, mode='a', newline='') as f:
                    writer = csv.writer(f)
                    writer.writerow([timestamp, src_ip, src_port, dst_ip, dst_port, method, uri, user_agent])

                # -----------------------------
                # บันทึกลง SQLite
                # -----------------------------
                c.execute('''
                    INSERT INTO http_requests (timestamp, src_ip, src_port, dst_ip, dst_port, method, uri, user_agent)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (timestamp, src_ip, src_port, dst_ip, dst_port, method, uri, user_agent))
                conn.commit()

    except Exception as e:
        print(f"Packet error: {e}")