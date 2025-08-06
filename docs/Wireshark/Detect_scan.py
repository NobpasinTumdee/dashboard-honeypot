import pyshark
import csv
from datetime import datetime, timedelta
from threading import Timer

# === CONFIGURATION ===
INTERFACE = 'ztmosdoimw'
SCAN_TIMEOUT = timedelta(seconds=2)
CHECK_INTERVAL = 0.5
CSV_FILE = 'scan_log.csv'

# Store scan sessions with key: (src_ip, scan_type)
scan_sessions = {}

# Initialize CSV file
with open(CSV_FILE, 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow([
        'Timestamp', 'Src_IP', 'Src_Port',
        'Type', 'Dst_IP', 'Dst_Port', 'Target_IP_Count'
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

def log_scan(ip, scan_type, session):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    dst_ips = session['dst_ips']
    src_ports = session['src_ports']
    dst_ports = session['dst_ports']

    # แสดงรายการ src ports หาก ≤ 5 พอร์ต
    if len(src_ports) <= 5:
        src_port_display = ','.join(sorted(src_ports))
    else:
        src_port_display = f"+{len(src_ports)}"

    # แสดงรายการ dst ports หาก ≤ 5 พอร์ต
    if len(dst_ports) <= 5:
        dst_port_display = ','.join(sorted(dst_ports))
    else:
        dst_port_display = f"+{len(dst_ports)}"

    with open(CSV_FILE, 'a', newline='') as f:
        writer = csv.writer(f)
        writer.writerow([
            timestamp, ip, src_port_display, scan_type,
            ','.join(dst_ips), dst_port_display, len(dst_ips)
        ])

    print(f"\n[!!] Suspicious Detected [{scan_type}] from {ip}")
    print(f"     Src Port(s): {src_port_display} | Dst Port(s): {dst_port_display}")
    print(f"     Targeted Hosts: {', '.join(dst_ips)}")
    print(f"     Total IPs: {len(dst_ips)}")
    print("-" * 60)

def check_timeouts():
    """Periodically check for expired scan sessions and log them."""
    now = datetime.now()
    expired = [k for k, v in scan_sessions.items() if now - v['last_seen'] > SCAN_TIMEOUT]

    for key in expired:
        src_ip, scan_type = key
        log_scan(src_ip, scan_type, scan_sessions[key])
        del scan_sessions[key]

    Timer(CHECK_INTERVAL, check_timeouts).start()

def capture_packets(interface):
    """Capture live packets and track potential scans."""
    print(f"[*] Capturing on interface: {interface}")
    capture = pyshark.LiveCapture(interface=interface)
    check_timeouts()

    for pkt in capture.sniff_continuously():
        alert = is_suspicious_packet(pkt)
        if not alert:
            continue

        try:
            src_ip = pkt.ip.src
            dst_ip = pkt.ip.dst
            src_port = pkt[pkt.transport_layer].srcport
            dst_port = pkt[pkt.transport_layer].dstport

            key = (src_ip, alert)
            now = datetime.now()

            if key in scan_sessions:
                session = scan_sessions[key]
                session['last_seen'] = now
                session['dst_ips'].add(dst_ip)
                session['src_ports'].add(src_port)
                session['dst_ports'].add(dst_port)
            else:
                scan_sessions[key] = {
                    'last_seen': now,
                    'dst_ips': set([dst_ip]),
                    'src_ports': set([src_port]),
                    'dst_ports': set([dst_port]),
                }

        except AttributeError:
            continue

if __name__ == "__main__":
    capture_packets(INTERFACE)