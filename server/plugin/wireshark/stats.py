import sqlite3
import threading
from datetime import datetime
import pyshark

DB_FILE ="/home/os/dashboard-honeypot/server/API/socket/HeneyPot.db"

lock = threading.Lock()

# =========================
# สร้าง DB / ตารางถ้ายังไม่มี
# =========================
conn = sqlite3.connect(DB_FILE, check_same_thread=False)
c = conn.cursor()

c.execute("""
CREATE TABLE IF NOT EXISTS TimeSeriesPackets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    count INTEGER
)
""")

c.execute("""
CREATE TABLE IF NOT EXISTS ProtocolStats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    protocol TEXT,
    timestamp TEXT,
    count INTEGER
)
""")

c.execute("""
CREATE TABLE IF NOT EXISTS SrcIpStats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    src_ip TEXT,
    timestamp TEXT,
    count INTEGER
)
""")

c.execute("""
CREATE TABLE IF NOT EXISTS DstPortStats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dst_port TEXT,
    timestamp TEXT,
    count INTEGER
)
""")
conn.commit()

# =========================
# ฟังก์ชันอัปเดต DB
# =========================
def update_db(pkt):
    try:
        dt = datetime.fromtimestamp(float(pkt.sniff_timestamp))
        timestamp = dt.replace(minute=0, second=0, microsecond=0).strftime("%Y-%m-%d %H:%M")

        with lock:
            # TimeSeriesPackets
            c.execute("SELECT id, count FROM TimeSeriesPackets WHERE timestamp=?", (timestamp,))
            row = c.fetchone()
            if row:
                c.execute("UPDATE TimeSeriesPackets SET count=? WHERE id=?", (row[1]+1, row[0]))
            else:
                c.execute("INSERT INTO TimeSeriesPackets (timestamp, count) VALUES (?, 1)", (timestamp,))

            # ProtocolStats
            proto = pkt.highest_layer
            c.execute("SELECT id, count FROM ProtocolStats WHERE timestamp=? AND protocol=?", (timestamp, proto))
            row = c.fetchone()
            if row:
                c.execute("UPDATE ProtocolStats SET count=? WHERE id=?", (row[1]+1, row[0]))
            else:
                c.execute("INSERT INTO ProtocolStats (timestamp, protocol, count) VALUES (?, ?, 1)", (timestamp, proto))

            # SrcIpStats
            if hasattr(pkt, "ip"):
                src_ip = pkt.ip.src
                c.execute("SELECT id, count FROM SrcIpStats WHERE timestamp=? AND src_ip=?", (timestamp, src_ip))
                row = c.fetchone()
                if row:
                    c.execute("UPDATE SrcIpStats SET count=? WHERE id=?", (row[1]+1, row[0]))
                else:
                    c.execute("INSERT INTO SrcIpStats (timestamp, src_ip, count) VALUES (?, ?, 1)", (timestamp, src_ip))

            # DstPortStats
            dst = None
            if hasattr(pkt, "tcp"):
                dst = str(pkt.tcp.dstport)
            elif hasattr(pkt, "udp"):
                dst = str(pkt.udp.dstport)
            if dst is not None:
                c.execute("SELECT id, count FROM DstPortStats WHERE timestamp=? AND dst_port=?", (timestamp, dst))
                row = c.fetchone()
                if row:
                    c.execute("UPDATE DstPortStats SET count=? WHERE id=?", (row[1]+1, row[0]))
                else:
                    c.execute("INSERT INTO DstPortStats (timestamp, dst_port, count) VALUES (?, ?, 1)", (timestamp, dst))

            conn.commit()

    except Exception as e:
        print("Error updating DB:", e)

# =========================
# Thread capture packet
# =========================
def capture_thread(interface="enp0s3"):
    print(f"Starting packet capture on {interface}...")
    capture = pyshark.LiveCapture(interface=interface, bpf_filter='not arp and not broadcast and not multicast')
    for pkt in capture.sniff_continuously():
        update_db(pkt)

# =========================
# Main
# =========================
if __name__ == "__main__":
    thread = threading.Thread(target=capture_thread, daemon=True)
    thread.start()

    try:
        while True:
            pass
    except KeyboardInterrupt:
        print("Exiting...")
        conn.close()