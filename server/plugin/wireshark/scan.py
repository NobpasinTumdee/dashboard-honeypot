import pyshark
import csv
import os
import time
from datetime import datetime

# === CONFIGURATION ===
INTERFACE = 'ztcfw2abid'
CSV_FILE = 'scan_log.csv'
DEDUP_WINDOW = 2  # วินาที

# เก็บเหตุการณ์ล่าสุดเพื่อป้องกัน duplicate
recent_logs = {}

# สร้างไฟล์ถ้ายังไม่มี และใส่ header (แค่ครั้งแรก)
if not os.path.exists(CSV_FILE):
    with open(CSV_FILE, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow([
            'Timestamp', 'Src_IP', 'Src_Port',
            'Type', 'Dst_IP', 'Dst_Port'
        ])


def is_suspicious_packet(pkt):
    """Determine if packet matches known scan types."""
    try:
        if 'TCP' in pkt:
            flags = int(pkt.tcp.flags, 16)

            syn = (flags & 0x02) != 0
            ack = (flags & 0x10) != 0
            fin = (flags & 0x01) != 0
            rst = (flags & 0x04) != 0
            psh = (flags & 0x08) != 0
            urg = (flags & 0x20) != 0

            if syn and not ack and not fin and not rst:
                return "SYN Scan"
            if flags == 0:
                return "NULL Scan"
            if fin and psh and urg and not syn and not ack and not rst:
                return "XMAS Scan"
            if fin and not any([syn, ack, rst, psh, urg]):
                return "FIN Scan"

        if 'ICMP' in pkt and pkt.icmp.type == '8':
            return "Ping Sweep"

    except AttributeError:
        pass

    return None


def log_scan(src_ip, src_port, dst_ip, dst_port, scan_type):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    with open(CSV_FILE, 'a', newline='') as f:
        writer = csv.writer(f)
        writer.writerow([
            timestamp, src_ip, src_port,
            scan_type, dst_ip, dst_port
        ])

    print(f"[!!] {scan_type} from {src_ip}:{src_port} -> {dst_ip}:{dst_port}")


def capture_packets(interface):
    print(f"[*] Capturing on interface: {interface}")
    capture = pyshark.LiveCapture(interface=interface)

    for pkt in capture.sniff_continuously():
        alert = is_suspicious_packet(pkt)
        if not alert:
            continue

        try:
            src_ip = pkt.ip.src
            dst_ip = pkt.ip.dst
            src_port = pkt[pkt.transport_layer].srcport
            dst_port = pkt[pkt.transport_layer].dstport

            # ตรวจว่าซ้ำภายในเวลา DEDUP_WINDOW ไหม
            key = (src_ip, dst_ip, dst_port, alert)
            now = time.time()
            if key in recent_logs and now - recent_logs[key] < DEDUP_WINDOW:
                continue  # ข้าม ไม่ log ซ้ำ

            recent_logs[key] = now
            log_scan(src_ip, src_port, dst_ip, dst_port, alert)

        except AttributeError:
            continue


if __name__ == "__main__":
    capture_packets(INTERFACE)