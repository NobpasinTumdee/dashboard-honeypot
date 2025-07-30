import pyshark
import re
import csv
import os
from datetime import datetime

# === CONFIGURATION ===
INTERFACE = 'ztmosdoimw'
FILTER = 'tcp or http'
CSV_FILE = 'exploit_log.csv'

# === SIGNATURES TO DETECT ===
exploit_patterns = {
    "NOP sled (shellcode)": re.compile(r'\x90{10,}'),
    "Suspicious User-Agent": re.compile(r'(nikto|sqlmap|acunetix|nmap)', re.IGNORECASE),
    "Command Injection": re.compile(r'(;|&&|\||`|\$\(.*\))\s*(wget|curl|bash|nc|python|perl|rm)', re.IGNORECASE),
    "Buffer Overflow": re.compile(r'([A-Za-z]{100,})'),
    "Metasploit Payload": re.compile(r'(Meterpreter|msf|Exploit)', re.IGNORECASE),
    "Sensitive File Access": re.compile(r'(\/etc\/passwd|cmd\.exe|powershell|\/bin\/sh)', re.IGNORECASE)
}

# === INITIALIZE CSV ===
if not os.path.exists(CSV_FILE):
    with open(CSV_FILE, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['Timestamp', 'Source IP', 'Destination IP', 'Type', 'Matched Data'])

# === LOGGING FUNCTION ===
def log_to_csv(timestamp, src, dst, sig_type, matched_data):
    with open(CSV_FILE, 'a', newline='') as f:
        writer = csv.writer(f)
        writer.writerow([timestamp, src, dst, sig_type, matched_data])

# === DETECTION FUNCTION ===
def detect_exploits(pkt):
    try:
        src = pkt.ip.src if hasattr(pkt, 'ip') else 'Unknown'
        dst = pkt.ip.dst if hasattr(pkt, 'ip') else 'Unknown'
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # Check HTTP fields
        if 'http' in pkt:
            if hasattr(pkt.http, 'user_agent'):
                ua = pkt.http.user_agent
                for name, pattern in exploit_patterns.items():
                    if pattern.search(ua):
                        print(f"[{timestamp}] {name} in User-Agent from {src} to {dst}: {ua}")
                        log_to_csv(timestamp, src, dst, name, ua)

            if hasattr(pkt.http, 'request_uri'):
                uri = pkt.http.request_uri
                for name, pattern in exploit_patterns.items():
                    if pattern.search(uri):
                        print(f"[{timestamp}] {name} in URI from {src} to {dst}: {uri}")
                        log_to_csv(timestamp, src, dst, name, uri)

        # Check TCP payload
        if hasattr(pkt, 'tcp') and hasattr(pkt.tcp, 'payload'):
            raw = pkt.tcp.payload.replace(':', '')
            payload = bytes.fromhex(raw).decode('latin1', errors='ignore')
            for name, pattern in exploit_patterns.items():
                match = pattern.search(payload)
                if match:
                    matched_snippet = match.group(0)[:100].replace('\n', '\\n')  # limit long payloads
                    print(f"[{timestamp}] {name} in TCP payload from {src} to {dst}")
                    log_to_csv(timestamp, src, dst, name, matched_snippet)

    except Exception as e:
        pass  # ignore packet decoding issues

# === MAIN ===
print(f"Starting exploit signature detection on interface: {INTERFACE}")
capture = pyshark.LiveCapture(interface=INTERFACE, display_filter=FILTER)
capture.apply_on_packets(detect_exploits)
