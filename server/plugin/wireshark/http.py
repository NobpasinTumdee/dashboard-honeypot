import pyshark
import sqlite3
from datetime import datetime

interface = 'ztcfw2abid'
db_file = '/home/os/dashboard-honeypot/server/API/socket/HeneyPot.db'

# -----------------------------
# สร้าง/เชื่อมต่อฐานข้อมูล SQLite
# -----------------------------
conn = sqlite3.connect(db_file)
c = conn.cursor()
c.execute('''
CREATE TABLE IF NOT EXISTS HttpsPackets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    src_ip TEXT,
    src_port TEXT,
    dst_ip TEXT,
    dst_port TEXT,
    method TEXT,
    request_uri TEXT,
    userAgent TEXT
)
''')
conn.commit()

# -----------------------------
# เริ่ม LiveCapture
# -----------------------------
capture = pyshark.LiveCapture(
    interface=interface, 
    display_filter='http',
    custom_parameters=[ 
        "-o", "tls.keys_list:/etc/nginx/ssl/server.key" ## รอ key ของ honeypot มาแทน 
    ]
    )
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
                request_uri = getattr(http_layer, 'request_uri', '')
                userAgent = getattr(http_layer, 'user_agent', '')

                timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

                # -----------------------------
                # แสดงผล
                # -----------------------------
                print(f"[{timestamp}] {src_ip}:{src_port} -> {dst_ip}:{dst_port} {method} {request_uri}  User-Agent: {userAgent}")

                # -----------------------------
                # บันทึกลง SQLite
                # -----------------------------
                c.execute('''
                    INSERT INTO HttpsPackets (timestamp, src_ip, src_port, dst_ip, dst_port, method, request_uri, userAgent)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (timestamp, src_ip, src_port, dst_ip, dst_port, method, request_uri, userAgent))
                conn.commit()

    except Exception as e:
        print(f"Packet error: {e}")