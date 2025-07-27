import pyshark
import csv
from datetime import datetime, timedelta
from threading import Timer

SCAN_TIMEOUT = timedelta(seconds=2)
CHECK_INTERVAL = 0.5
scan_sessions = {}
CSV_FILE = 'scan_log.csv'

# Create CSV file and write header
with open(CSV_FILE, 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['Timestamp', 'Attacker_IP', 'Src_Port', 'Type', 'Destination_IPs', 'Dst_Port(s)', 'Target_IP_Count'])

def is_suspicious_packet(pkt):
    try:
        if 'TCP' in pkt:
            tcp = pkt.tcp
            flags = int(tcp.flags, 16)

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
            if fin and not syn and not ack and not rst and not psh and not urg:
                return "FIN Scan"

        if 'ICMP' in pkt and pkt.icmp.type == '8':
            return "Ping Sweep"

    except AttributeError:
        return None
    return None

def log_scan(ip, scan_type, session):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    dest_ips = session['dst_ips']
    src_ports = session['src_ports']
    dst_ports = session['dst_ports']

    # defined src_port based on the number of unique source ports
    src_port = next(iter(src_ports)) if len(src_ports) == 1 else f"+{len(src_ports)}"

    # defined dst_port based on the number of unique destination ports
    if len(dst_ports) == 1:
        dst_port_display = next(iter(dst_ports))
    else:
        dst_port_display = f"+{len(dst_ports)}"

    with open(CSV_FILE, 'a', newline='') as f:
        writer = csv.writer(f)
        writer.writerow([timestamp, ip, src_port, scan_type, ','.join(dest_ips), dst_port_display, len(dest_ips)])

    print(f"\n[!!] Suspicious Detected [{scan_type}] from {ip}")
    print(f"     Src Port: {src_port} | Dst Port(s): {dst_port_display}")
    print(f"     Targeted Hosts: {', '.join(dest_ips)}")
    print(f"     Total IPs: {len(dest_ips)}")
    print("-" * 60)

def check_timeouts():
    now = datetime.now()
    expired_keys = [k for k, v in scan_sessions.items() if now - v['last_seen'] > SCAN_TIMEOUT]
    for key in expired_keys:
        src_ip, scan_type = key
        log_scan(src_ip, scan_type, scan_sessions[key])
        del scan_sessions[key]

    Timer(CHECK_INTERVAL, check_timeouts).start()

def capture_packets(interface):
    print(f"[*] Capturing on interface: {interface}")
    capture = pyshark.LiveCapture(interface=interface)
    check_timeouts()

    for pkt in capture.sniff_continuously():
        now = datetime.now()
        alert = is_suspicious_packet(pkt)
        if not alert:
            continue

        try:
            src_ip = pkt.ip.src
            dst_ip = pkt.ip.dst
            src_port = pkt[pkt.transport_layer].srcport
            dst_port = pkt[pkt.transport_layer].dstport

            key = (src_ip, alert)
            session = scan_sessions.get(key)

            if session:
                session['last_seen'] = now
                session['dst_ips'].add(dst_ip)
                session['src_ports'].add(src_port)
                session['dst_ports'].add(dst_port)
            else:
                scan_sessions[key] = {
                    'last_seen': now,
                    'dst_ips': set([dst_ip]),
                    'src_ports': set([src_port]),
                    'dst_ports': set([dst_port])
                }

        except AttributeError:
            continue

if __name__ == "__main__":
    capture_packets(interface='ztmosdoimw')
