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
    bucket_time TEXT PRIMARY KEY,
    count INTEGER
)
""")

c.execute("""
CREATE TABLE IF NOT EXISTS protocol_stats (
    date TEXT,
    protocol TEXT,
    count INTEGER,
    PRIMARY KEY(date, protocol)
)
""")

c.execute("""
CREATE TABLE IF NOT EXISTS src_ip_stats (
    date TEXT,
    src_ip TEXT,
    count INTEGER,
    PRIMARY KEY(date, src_ip)
)
""")

c.execute("""
CREATE TABLE IF NOT EXISTS dst_port_stats (
    date TEXT,
    dst_port INTEGER,
    count INTEGER,
    PRIMARY KEY(date, dst_port)
)
""")
conn.commit()

# =========================
# ฟังก์ชัน snapshot
# =========================
def get_snapshot():
    snapshot = {"time_series": [], "protocol": [], "src_ip": [], "dst_port": []}
    with lock:
        c.execute("SELECT bucket_time, count FROM time_series ORDER BY bucket_time")
        snapshot["time_series"] = [{"time": r[0], "count": r[1]} for r in c.fetchall()]

        c.execute("SELECT date, protocol, count FROM protocol_stats ORDER BY date")
        snapshot["protocol"] = [{"date": r[0], "protocol": r[1], "count": r[2]} for r in c.fetchall()]

        c.execute("SELECT date, src_ip, count FROM src_ip_stats ORDER BY date")
        snapshot["src_ip"] = [{"date": r[0], "src_ip": r[1], "count": r[2]} for r in c.fetchall()]

        c.execute("SELECT date, dst_port, count FROM dst_port_stats ORDER BY date")
        snapshot["dst_port"] = [{"date": r[0], "dst_port": r[1], "count": r[2]} for r in c.fetchall()]

    return snapshot

# =========================
# ฟังก์ชันอัปเดต DB + คืนค่า msg
# =========================
def update_db(pkt):
    try:
        dt = datetime.fromtimestamp(float(pkt.sniff_timestamp))
        bucket_time = dt.replace(minute=0, second=0, microsecond=0).strftime("%Y-%m-%d %H:%M")
        date_only = dt.strftime("%Y-%m-%d")

        msg = {}

        with lock:
            # time_series
            c.execute("""
                INSERT INTO time_series(bucket_time, count)
                VALUES (?,1)
                ON CONFLICT(bucket_time) DO UPDATE SET count=count+1
            """, (bucket_time,))
            c.execute("SELECT count FROM time_series WHERE bucket_time=?", (bucket_time,))
            ts_count = c.fetchone()[0]
            msg["time_series"] = [{"time": bucket_time, "count": ts_count}]

            # protocol
            proto = pkt.highest_layer
            c.execute("""
                INSERT INTO protocol_stats(date, protocol, count)
                VALUES (?, ?, 1)
                ON CONFLICT(date, protocol) DO UPDATE SET count=count+1
            """, (date_only, proto))
            c.execute("SELECT count FROM protocol_stats WHERE date=? AND protocol=?", (date_only, proto))
            msg["protocol"] = [{"date": date_only, "protocol": proto, "count": c.fetchone()[0]}]

            # src_ip
            if hasattr(pkt, "ip"):
                src_ip = pkt.ip.src
                c.execute("""
                    INSERT INTO src_ip_stats(date, src_ip, count)
                    VALUES (?, ?, 1)
                    ON CONFLICT(date, src_ip) DO UPDATE SET count=count+1
                """, (date_only, src_ip))
                c.execute("SELECT count FROM src_ip_stats WHERE date=? AND src_ip=?", (date_only, src_ip))
                msg["src_ip"] = [{"date": date_only, "src_ip": src_ip, "count": c.fetchone()[0]}]

            # dst_port
            dst = None
            if hasattr(pkt, "tcp"):
                dst = int(pkt.tcp.dstport)
            elif hasattr(pkt, "udp"):
                dst = int(pkt.udp.dstport)
            if dst is not None:
                c.execute("""
                    INSERT INTO dst_port_stats(date, dst_port, count)
                    VALUES (?, ?, 1)
                    ON CONFLICT(date, dst_port) DO UPDATE SET count=count+1
                """, (date_only, dst))
                c.execute("SELECT count FROM dst_port_stats WHERE date=? AND dst_port=?", (date_only, dst))
                msg["dst_port"] = [{"date": date_only, "dst_port": dst, "count": c.fetchone()[0]}]

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