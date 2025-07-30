import pyshark
from collections import defaultdict
from datetime import datetime, timedelta
import csv
import os

# === CONFIG ===
INTERFACE = 'ztmosdoimw' 
TIME_WINDOW = timedelta(seconds=10)
THRESHOLD_ATTEMPTS = 5
CSV_FILE = 'brute_force_log.csv'

# === STATE ===
login_attempts = defaultdict(list)
blocked_ips = {}
BLOCK_TIME = timedelta(seconds=10)
SERVER_IPS = {'10.147.18.208'}  # ใส่ IP เซิร์ฟเวอร์ของคุณ

# === Init CSV File ===
if not os.path.exists(CSV_FILE):
    with open(CSV_FILE, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['Timestamp', 'Source IP', 'Destination IP', 'Protocol', 'Attempt Count', 'Info'])

def is_login_attempt(packet):
    try:
        if 'ftp' in packet or 'ssh' in packet or 'telnet' in packet or 'smb' in packet:
            return True
        return False
    except:
        return False

def handle_packet(packet):
    try:
        if not is_login_attempt(packet):
            return

        if not hasattr(packet, 'ip'):
            return  # ไม่ใช่ IPv4

        ip_src = packet.ip.src
        ip_dst = packet.ip.dst
        now = datetime.now()
        proto = packet.highest_layer
        info = packet.info if hasattr(packet, "info") else ''

        if ip_src in SERVER_IPS:
            return

        if ip_src in blocked_ips and now - blocked_ips[ip_src] < BLOCK_TIME:
            return

        login_attempts[ip_src].append(now)
        login_attempts[ip_src] = [t for t in login_attempts[ip_src] if now - t <= TIME_WINDOW]

        if len(login_attempts[ip_src]) >= THRESHOLD_ATTEMPTS:
            print(f"[{now.strftime('%Y-%m-%d %H:%M:%S')}] Potential Brute Force from {ip_src} to {ip_dst} via {proto} ({len(login_attempts[ip_src])} attempts)")

            with open(CSV_FILE, 'a', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([
                    now.strftime('%Y-%m-%d %H:%M:%S'),
                    ip_src,
                    ip_dst,
                    proto,
                    len(login_attempts[ip_src]),
                    info
                ])

            login_attempts[ip_src] = []
            blocked_ips[ip_src] = now

    except AttributeError:
        pass

print("Starting capture brute force... (Press Ctrl+C to stop)")
capture = pyshark.LiveCapture(
    interface=INTERFACE,
    bpf_filter="tcp port 21 or tcp port 22 or tcp port 23 or tcp port 445"
)

try:
    for packet in capture.sniff_continuously():
        handle_packet(packet)
except KeyboardInterrupt:
    print("Capture stopped.")
