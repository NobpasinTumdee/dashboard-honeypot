import pyshark
import sqlite3
from datetime import datetime
import base64

interface = 'ztcfw2abid'
db_file = '/home/cpe27/HeneyPot.db'

# -----------------------------
# ฟังก์ชันช่วย decode payload แบบปลอดภัย
# -----------------------------
def safe_b64decode(data: str) -> str:
    try:
        return base64.b64decode(data, validate=True).decode('utf-8', errors='ignore')
    except Exception:
        return None  # ถ้า decode ไม่ได้

# -----------------------------
# ฟังก์ชันช่วยแปลง hex string เป็น text
# -----------------------------
def hex_to_text(hex_str: str) -> str:
    hex_str = hex_str.replace(':', '').replace(' ', '')
    try:
        return bytes.fromhex(hex_str).decode('utf-8', errors='ignore')
    except Exception:
        return hex_str

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
        "-o", "tls.keys_list:172.29.169.27,443,http,/etc/ssl/opencanary/opencanary.key"
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

                # decode payload ถ้ามี
                full_uri = request_uri
                if hasattr(http_layer, 'file_data'):
                    payload = http_layer.file_data

                    # 1. ลอง decode Base64 ก่อน
                    decoded_payload = safe_b64decode(payload)
                    if decoded_payload:
                        full_uri += '?' + decoded_payload
                    else:
                        # 2. ถ้าไม่ใช่ Base64 ลองแปลง hex
                        decoded_payload = hex_to_text(payload)
                        full_uri += '?' + decoded_payload
                        print(f"[!] Non-Base64 payload detected, used hex/text conversion: {decoded_payload}")

                userAgent = getattr(http_layer, 'user_agent', '')

                timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

                print(f"[{timestamp}] {src_ip}:{src_port} -> {dst_ip}:{dst_port} {method} {full_uri}  User-Agent: {userAgent}")

                c.execute('''
                    INSERT INTO HttpsPackets (timestamp, src_ip, src_port, dst_ip, dst_port, method, request_uri, userAgent)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (timestamp, src_ip, src_port, dst_ip, dst_port, method, full_uri, userAgent))
                conn.commit()

    except Exception as e:
        print(f"Packet error: {e}")