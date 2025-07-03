import sqlite3
import json
import time
import os
from datetime import datetime

# กำหนดเส้นทางไฟล์ log ของ Cowrie JSON
COWRIE_JSON_LOG_PATH = '/home/cowrie/cowrie/var/log/cowrie/cowrie.json'
# กำหนดเส้นทางฐานข้อมูล SQLite
SQLITE_DB_PATH = '/home/os/dashboard-honeypot/sever/API/CowrieAPI/cowrie.db'

def setup_database():
    """
    ตั้งค่าฐานข้อมูล SQLite: เชื่อมต่อและสร้างตาราง honeypot_logs หากยังไม่มี
    """
    try:
        conn = sqlite3.connect(SQLITE_DB_PATH)
        cursor = conn.cursor()

        # สร้างตาราง honeypot_logs หากยังไม่มี
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS honeypot_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                eventid TEXT,
                session TEXT,
                message TEXT,
                protocol TEXT,
                src_ip TEXT,
                src_port INTEGER,
                dst_ip TEXT,
                dst_port INTEGER,
                username TEXT,
                password TEXT,
                input TEXT,
                command TEXT,
                duration REAL,
                ttylog TEXT,
                json_data TEXT
            )
        ''')
        conn.commit()
        print(f"ฐานข้อมูล SQLite '{SQLITE_DB_PATH}' ถูกตั้งค่าเรียบร้อยแล้ว")
        return conn, cursor
    except sqlite3.Error as e:
        print(f"เกิดข้อผิดพลาดในการตั้งค่าฐานข้อมูล: {e}")
        return None, None

def process_log_entry(cursor, log_entry_json):
    """
    ประมวลผลรายการ log แต่ละรายการและบันทึกลงในฐานข้อมูล
    """
    try:
        log_data = json.loads(log_entry_json)

        # ดึงข้อมูลจาก JSON โดยใช้ .get() เพื่อป้องกัน KeyError หากฟิลด์ไม่มีอยู่
        timestamp = log_data.get('timestamp')
        eventid = log_data.get('eventid')
        session = log_data.get('session')
        message = log_data.get('message')
        protocol = log_data.get('protocol')
        src_ip = log_data.get('src_ip')
        src_port = log_data.get('src_port')
        dst_ip = log_data.get('dst_ip')
        dst_port = log_data.get('dst_port')

        # ข้อมูลเฉพาะสำหรับเหตุการณ์ login
        username = log_data.get('username')
        password = log_data.get('password')

        # ข้อมูลเฉพาะสำหรับเหตุการณ์ command
        input_cmd = log_data.get('input') # เปลี่ยนชื่อตัวแปรเพื่อไม่ให้ชนกับ built-in function
        command = log_data.get('command')

        # ข้อมูลเฉพาะสำหรับเหตุการณ์ session
        duration = log_data.get('duration')
        ttylog = log_data.get('ttylog')

        # เก็บ JSON ดั้งเดิมไว้ในคอลัมน์ json_data
        full_json_data = log_entry_json

        cursor.execute('''
            INSERT INTO honeypot_logs (
                timestamp, eventid, session, message, protocol,
                src_ip, src_port, dst_ip, dst_port,
                username, password, input, command, duration, ttylog, json_data
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            timestamp, eventid, session, message, protocol,
            src_ip, src_port, dst_ip, dst_port,
            username, password, input_cmd, command, duration, ttylog, full_json_data
        ))
        print(f"บันทึกข้อมูล log '{eventid}' จากเซสชัน '{session}' ลงฐานข้อมูลแล้ว")

    except json.JSONDecodeError as e:
        print(f"ข้ามบรรทัดที่ไม่ใช่ JSON ที่ถูกต้อง: {log_entry_json.strip()} - ข้อผิดพลาด: {e}")
    except sqlite3.Error as e:
        print(f"เกิดข้อผิดพลาดในการบันทึกข้อมูลลงฐานข้อมูล: {e} - ข้อมูล: {log_entry_json.strip()}")

def monitor_cowrie_log_realtime(conn, cursor):
    """
    ตรวจสอบไฟล์ Cowrie JSON log แบบเรียลไทม์และบันทึกข้อมูลใหม่ลงในฐานข้อมูล
    """
    if not os.path.exists(COWRIE_JSON_LOG_PATH):
        print(f"ข้อผิดพลาด: ไม่พบไฟล์ log ที่ '{COWRIE_JSON_LOG_PATH}' โปรดตรวจสอบเส้นทาง")
        return

    print(f"กำลังเริ่มตรวจสอบไฟล์ log ที่ '{COWRIE_JSON_LOG_PATH}'...")
    try:
        # เปิดไฟล์ในโหมดอ่านและย้ายตัวชี้ไปยังท้ายไฟล์
        # 'a+' โหมดจะเปิดไฟล์สำหรับการอ่านและเขียน และย้ายตัวชี้ไปที่ท้ายไฟล์
        # แต่เราต้องการแค่ 'r' และจัดการการอ่านเอง
        with open(COWRIE_JSON_LOG_PATH, 'r') as f:
            # ย้ายตัวชี้ไปยังท้ายไฟล์เพื่ออ่านเฉพาะข้อมูลใหม่
            f.seek(0, os.SEEK_END)
            print("พร้อมที่จะอ่านข้อมูล log ใหม่...")

            while True:
                line = f.readline()
                if not line:
                    # ไม่มีบรรทัดใหม่, รอสักครู่แล้วลองอีกครั้ง
                    time.sleep(1)
                    continue
                
                # ประมวลผลบรรทัดที่อ่านได้
                process_log_entry(cursor, line)
                conn.commit() # คอมมิตทุกครั้งที่เพิ่มข้อมูล เพื่อให้ข้อมูลถูกบันทึกทันที

    except FileNotFoundError:
        print(f"ข้อผิดพลาด: ไม่พบไฟล์ log ที่ '{COWRIE_JSON_LOG_PATH}'")
    except Exception as e:
        print(f"เกิดข้อผิดพลาดที่ไม่คาดคิดขณะตรวจสอบไฟล์ log: {e}")
    finally:
        if conn:
            conn.close()
            print("ปิดการเชื่อมต่อฐานข้อมูลแล้ว")

if __name__ == "__main__":
    conn, cursor = setup_database()
    if conn and cursor:
        monitor_cowrie_log_realtime(conn, cursor)
    else:
        print("ไม่สามารถเริ่มต้นการตรวจสอบ log ได้เนื่องจากปัญหาการตั้งค่าฐานข้อมูล")