import sqlite3
import json
import os
import time

# Path ไปยังไฟล์ cowrie.json 
COWRIE_JSON_LOG_PATH = '/home/cowrie/cowrie/var/log/cowrie/cowrie.json'
# Path ไปยังฐานข้อมูล SQLite ที่จะสร้าง
SQLITE_DB_PATH = '/home/os/dashbord/dashboard-honeypot/sever/API/CowrieAPI/cowrie.db'

def create_table(conn):
    """สร้างตารางในฐานข้อมูล SQLite หากยังไม่มี"""
    try:
        cursor = conn.cursor()
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
        print("Table 'honeypot_logs' created or already exists.")
    except sqlite3.Error as e:
        print(f"Error creating table: {e}")

def insert_log(conn, log_entry):
    """แทรกข้อมูล Log เข้าไปในตาราง"""
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO honeypot_logs (
                timestamp, eventid, session, message, protocol,
                src_ip, src_port, dst_ip, dst_port,
                username, password, input, command, duration, ttylog, json_data
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            log_entry.get('timestamp'),
            log_entry.get('eventid'),
            log_entry.get('session'),
            log_entry.get('message'),
            log_entry.get('protocol'),
            log_entry.get('src_ip'),
            log_entry.get('src_port'),
            log_entry.get('dst_ip'),
            log_entry.get('dst_port'),
            log_entry.get('username'),
            log_entry.get('password'),
            log_entry.get('input'),
            log_entry.get('command'),
            log_entry.get('duration'),
            log_entry.get('ttylog'),
            json.dumps(log_entry) # เก็บ JSON ดิบไว้ด้วยเผื่อต้องการข้อมูลเพิ่มเติม
        ))
        conn.commit()
        # print(f"Inserted log: {log_entry.get('eventid')}")
    except sqlite3.Error as e:
        print(f"Error inserting log: {e}")
        print(f"Problematic log entry: {log_entry}")

def process_new_logs(conn, last_processed_position):
    """ประมวลผล Log ใหม่ที่ถูกเพิ่มเข้ามาในไฟล์"""
    try:
        with open(COWRIE_JSON_LOG_PATH, 'r') as f:
            f.seek(last_processed_position) # เลื่อนตำแหน่งการอ่านไปยังตำแหน่งที่ประมวลผลล่าสุด
            for line in f:
                try:
                    log_entry = json.loads(line.strip())
                    insert_log(conn, log_entry)
                except json.JSONDecodeError as e:
                    print(f"Error decoding JSON: {e} - Line: {line.strip()}")
            new_position = f.tell() # บันทึกตำแหน่งปัจจุบัน
            return new_position
    except FileNotFoundError:
        print(f"Error: Log file not found at {COWRIE_JSON_LOG_PATH}")
        return last_processed_position
    except Exception as e:
        print(f"An unexpected error occurred during log processing: {e}")
        return last_processed_position

def main():
    conn = None
    try:
        conn = sqlite3.connect(SQLITE_DB_PATH)
        create_table(conn)

        # เก็บตำแหน่งที่อ่านล่าสุดเพื่อหลีกเลี่ยงการอ่านซ้ำ
        last_processed_position_file = SQLITE_DB_PATH + '.position'
        last_processed_position = 0
        if os.path.exists(last_processed_position_file):
            with open(last_processed_position_file, 'r') as f:
                try:
                    last_processed_position = int(f.read().strip())
                except ValueError:
                    print("Warning: Could not read last processed position, starting from beginning.")
                    last_processed_position = 0

        print(f"Starting log importer. Monitoring {COWRIE_JSON_LOG_PATH}")
        while True:
            new_position = process_new_logs(conn, last_processed_position)
            if new_position > last_processed_position:
                last_processed_position = new_position
                with open(last_processed_position_file, 'w') as f:
                    f.write(str(last_processed_position))
            time.sleep(5) # ตรวจสอบ Log ทุก 5 วินาที

    except sqlite3.Error as e:
        print(f"Database error: {e}")
    except KeyboardInterrupt:
        print("\nExiting log importer.")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    main()
