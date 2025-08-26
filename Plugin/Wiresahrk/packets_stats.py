import sqlite3
import json
import threading
import asyncio
from datetime import datetime
import pyshark
from fastapi import FastAPI, WebSocket
import uvicorn
from queue import Queue

app = FastAPI()
DB_FILE = "packet_stats.db"
lock = threading.Lock()
connected_clients = set()
event_queue = Queue()

# =========================
# สร้าง DB / ตารางถ้ายังไม่มี
# =========================
conn = sqlite3.connect(DB_FILE, check_same_thread=False)
c = conn.cursor()

c.execute("""
CREATE TABLE IF NOT EXISTS time_series (
    timestamp TEXT PRIMARY KEY,
    count INTEGER
)
""")

c.execute("""
CREATE TABLE IF NOT EXISTS protocol_stats (
    timestamp TEXT,
    protocol TEXT,
    count INTEGER,
    PRIMARY KEY(timestamp, protocol)
)
""")

c.execute("""
CREATE TABLE IF NOT EXISTS src_ip_stats (
    timestamp TEXT,
    src_ip TEXT,
    count INTEGER,
    PRIMARY KEY(timestamp, src_ip)
)
""")

c.execute("""
CREATE TABLE IF NOT EXISTS dst_port_stats (
    timestamp TEXT,
    dst_port INTEGER,
    count INTEGER,
    PRIMARY KEY(timestamp, dst_port)
)
""")
conn.commit()

# =========================
# ฟังก์ชัน snapshot
# =========================
def get_snapshot():
    snapshot = {"time_series": [], "protocol": [], "src_ip": [], "dst_port": []}
    with lock:
        c.execute("SELECT timestamp, count FROM time_series ORDER BY timestamp")
        snapshot["time_series"] = [{"time": r[0], "count": r[1]} for r in c.fetchall()]

        c.execute("SELECT timestamp, protocol, count FROM protocol_stats ORDER BY timestamp")
        snapshot["protocol"] = [{"timestamp": r[0], "protocol": r[1], "count": r[2]} for r in c.fetchall()]

        c.execute("SELECT timestamp, src_ip, count FROM src_ip_stats ORDER BY timestamp")
        snapshot["src_ip"] = [{"timestamp": r[0], "src_ip": r[1], "count": r[2]} for r in c.fetchall()]

        c.execute("SELECT timestamp, dst_port, count FROM dst_port_stats ORDER BY timestamp")
        snapshot["dst_port"] = [{"timestamp": r[0], "dst_port": r[1], "count": r[2]} for r in c.fetchall()]

    return snapshot

# =========================
# ฟังก์ชันอัปเดต DB + คืนค่า msg
# =========================
def update_db(pkt):
    try:
        dt = datetime.fromtimestamp(float(pkt.sniff_timestamp))
        # ใช้ timestamp แบบเต็ม (YYYY-MM-DD HH:MM)
        timestamp = dt.replace(minute=0, second=0, microsecond=0).strftime("%Y-%m-%d %H:%M")

        msg = {}

        with lock:
            # time_series
            c.execute("""
                INSERT INTO time_series(timestamp, count)
                VALUES (?,1)
                ON CONFLICT(timestamp) DO UPDATE SET count=count+1
            """, (timestamp,))
            c.execute("SELECT count FROM time_series WHERE timestamp=?", (timestamp,))
            ts_count = c.fetchone()[0]
            msg["time_series"] = [{"time": timestamp, "count": ts_count}]

            # protocol
            proto = pkt.highest_layer
            c.execute("""
                INSERT INTO protocol_stats(timestamp, protocol, count)
                VALUES (?, ?, 1)
                ON CONFLICT(timestamp, protocol) DO UPDATE SET count=count+1
            """, (timestamp, proto))
            c.execute("SELECT count FROM protocol_stats WHERE timestamp=? AND protocol=?", (timestamp, proto))
            msg["protocol"] = [{"timestamp": timestamp, "protocol": proto, "count": c.fetchone()[0]}]

            # src_ip
            if hasattr(pkt, "ip"):
                src_ip = pkt.ip.src
                c.execute("""
                    INSERT INTO src_ip_stats(timestamp, src_ip, count)
                    VALUES (?, ?, 1)
                    ON CONFLICT(timestamp, src_ip) DO UPDATE SET count=count+1
                """, (timestamp, src_ip))
                c.execute("SELECT count FROM src_ip_stats WHERE timestamp=? AND src_ip=?", (timestamp, src_ip))
                msg["src_ip"] = [{"timestamp": timestamp, "src_ip": src_ip, "count": c.fetchone()[0]}]

            # dst_port
            dst = None
            if hasattr(pkt, "tcp"):
                dst = int(pkt.tcp.dstport)
            elif hasattr(pkt, "udp"):
                dst = int(pkt.udp.dstport)
            if dst is not None:
                c.execute("""
                    INSERT INTO dst_port_stats(timestamp, dst_port, count)
                    VALUES (?, ?, 1)
                    ON CONFLICT(timestamp, dst_port) DO UPDATE SET count=count+1
                """, (timestamp, dst))
                c.execute("SELECT count FROM dst_port_stats WHERE timestamp=? AND dst_port=?", (timestamp, dst))
                msg["dst_port"] = [{"timestamp": timestamp, "dst_port": dst, "count": c.fetchone()[0]}]

            conn.commit()

        return msg
    except Exception as e:
        print("Error updating DB:", e)
        return None

# =========================
# ฟังก์ชัน notify clients
# =========================
async def notify_clients(message: dict):
    if connected_clients:
        data = json.dumps({"type": "update", "data": message})
        await asyncio.gather(*[ws.send_text(data) for ws in connected_clients])

# =========================
# Thread capture packet
# =========================
def capture_thread(interface="enp0s3"):
    capture = pyshark.LiveCapture(interface=interface)
    for pkt in capture.sniff_continuously():
        msg = update_db(pkt)
        if msg:
            event_queue.put(msg)

# =========================
# Async task push events
# =========================
async def push_events():
    while True:
        msg = await asyncio.to_thread(event_queue.get)
        await notify_clients(msg)

# =========================
# WebSocket endpoint
# =========================
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    connected_clients.add(ws)

    # ส่ง snapshot
    snapshot = get_snapshot()
    await ws.send_text(json.dumps({"type": "snapshot", "data": snapshot}))

    try:
        while True:
            await asyncio.sleep(1)
    except Exception:
        pass
    finally:
        connected_clients.remove(ws)

# =========================
# Startup event
# =========================
@app.on_event("startup")
async def startup_event():
    threading.Thread(target=capture_thread, daemon=True).start()
    asyncio.create_task(push_events())

# =========================
# Run
# =========================
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=2004)