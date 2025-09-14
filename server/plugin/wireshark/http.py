import pyshark
import sqlite3
import urllib.parse
import base64
from datetime import datetime

# -----------------------------
# Config
# -----------------------------
interface ='ztcfw2abid'
DB_FILE ='/home/cpe27/HeneyPot.db'

# -----------------------------
# Create/connect SQLite DB
# -----------------------------
conn = sqlite3.connect(DB_FILE)
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
# Function: decode payload
# -----------------------------
def decode_payload(payload: str):
    if not payload:
        return ""
    decoded = payload

    # Decode URL multiple times
    for _ in range(2):
        decoded = urllib.parse.unquote(decoded)
        decoded = urllib.parse.unquote_plus(decoded)

    # Decode Base64 if possible
    try:
        decoded_b64 = base64.b64decode(decoded).decode('utf-8')
        decoded += " " + decoded_b64
    except Exception:
        pass

    return decoded

# -----------------------------
# Start LiveCapture
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
            src_ip = pkt.ip.src if hasattr(pkt, 'ip') else 'N/A'
            dst_ip = pkt.ip.dst if hasattr(pkt, 'ip') else 'N/A'
            if hasattr(pkt, 'tcp'):
                src_port = pkt.tcp.srcport
                dst_port = pkt.tcp.dstport
            else:
                src_port = dst_port = 'N/A'

            http_layer = pkt.http
            if hasattr(http_layer, 'request_method'):
                method = http_layer.request_method
                request_uri = getattr(http_layer, 'request_uri', '')
                userAgent = getattr(http_layer, 'user_agent', '')

                # combine payload
                payload_parts = [request_uri]
                if hasattr(http_layer, 'file_data'):
                    payload_parts.append(http_layer.file_data)
                for header_field in ['cookie', 'authorization', 'referer']:
                    val = getattr(http_layer, header_field, None)
                    if val:
                        payload_parts.append(val)
                full_payload = " ".join(payload_parts)

                # decode payload
                decoded_payload = decode_payload(full_payload)

                timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                print(f"[{timestamp}] {src_ip}:{src_port} -> {dst_ip}:{dst_port} {method} {decoded_payload} User-Agent: {userAgent}")

                # insert into DB
                c.execute('''
                    INSERT INTO HttpsPackets (timestamp, src_ip, src_port, dst_ip, dst_port, method, request_uri, userAgent)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (timestamp, src_ip, src_port, dst_ip, dst_port, method, decoded_payload, userAgent))
                conn.commit()

    except Exception as e:
        print(f"Packet error: {e}")