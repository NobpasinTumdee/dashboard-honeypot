import sqlite3
import json
import threading
import asyncio
from datetime import datetime
import pyshark
from fastapi import FastAPI, WebSocket
import uvicorn

app = FastAPI()
DB_FILE = "packet_stats.db"
lock = threading.Lock()

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
    proto TEXT,
    count INTEGER,
    PRIMARY KEY(date, proto)
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
# ฟังก์ชันอัปเดต DB จาก packet
# =========================
def update_db(pkt):
    try:
        dt = datetime.fromtimestamp(float(pkt.sniff_timestamp))
        bucket_time = dt.replace(minute=0, second=0, microsecond=0).strftime("%Y-%m-%d %H:%M")
        date_only = dt.strftime("%Y-%m-%d")  # สำหรับ protocol/src_ip/dst_port

        with lock:
            # time_series
            c.execute("""
                INSERT INTO time_series(bucket_time, count)
                VALUES (?,1)
                ON CONFLICT(bucket_time) DO UPDATE SET count=count+1
            """, (bucket_time,))

            # protocol
            proto = pkt.highest_layer
            c.execute("""
                INSERT INTO protocol_stats(date, proto, count)
                VALUES (?, ?, 1)
                ON CONFLICT(date, proto) DO UPDATE SET count=count+1
            """, (date_only, proto))

            # src_ip
            if hasattr(pkt, "ip"):
                c.execute("""
                    INSERT INTO src_ip_stats(date, src_ip, count)
                    VALUES (?, ?, 1)
                    ON CONFLICT(date, src_ip) DO UPDATE SET count=count+1
                """, (date_only, pkt.ip.src))

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

            conn.commit()
    except Exception as e:
        print("Error updating DB:", e)

# =========================
# Thread สำหรับ capture packet
# =========================
def capture_thread(interface="enp0s3"):
    capture = pyshark.LiveCapture(interface=interface)
    for pkt in capture.sniff_continuously():
        update_db(pkt)

# =========================
# WebSocket endpoint
# =========================
@app.websocket("/ws/packets")
async def websocket_packets(ws: WebSocket):
    await ws.accept()
    # start capture in background thread
    threading.Thread(target=capture_thread, daemon=True).start()

    try:
        while True:
            with lock:
                # time_series
                c.execute("SELECT bucket_time, count FROM time_series ORDER BY bucket_time")
                time_series = [{"time": row[0], "count": row[1]} for row in c.fetchall()]

                # protocol
                c.execute("SELECT date, proto, count FROM protocol_stats ORDER BY date")
                protocol = [{"date": row[0], "protocol": row[1], "count": row[2]} for row in c.fetchall()]

                # src_ip
                c.execute("SELECT date, src_ip, count FROM src_ip_stats ORDER BY date")
                src_ip = [{"date": row[0], "src_ip": row[1], "count": row[2]} for row in c.fetchall()]

                # dst_port
                c.execute("SELECT date, dst_port, count FROM dst_port_stats ORDER BY date")
                dst_port = [{"date": row[0], "dst_port": row[1], "count": row[2]} for row in c.fetchall()]

            # ส่ง JSON ไป frontend
            await ws.send_text(json.dumps({
                "time_series": time_series,
                "protocol": protocol,
                "src_ip": src_ip,
                "dst_port": dst_port
            }))
            await asyncio.sleep(1)
    except Exception as e:
        print("WebSocket closed:", e)

# =========================
# Run app
# =========================
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=2004)