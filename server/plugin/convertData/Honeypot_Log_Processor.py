import sqlite3
import json
import time
import os
from datetime import datetime

# กำหนดเส้นทางไฟล์ Linux
COWRIE_JSON_LOG_PATH = '/home/cowrie/cowrie/var/log/cowrie/cowrie.json'
OPENCANARY_LOG_PATH = '/var/tmp/opencanary.log'
SQLITE_DB_PATH = '/home/os/dashboard-honeypot/sever/API/backend/HeneyPot.db'

# กำหนดเส้นทางไฟล์ windows
# COWRIE_JSON_LOG_PATH = 'C:/Users/ACER/Documents/GitHub/dashboard-honeypot/server/cowrie.json'
# OPENCANARY_LOG_PATH = 'C:/Users/ACER/Documents/GitHub/dashboard-honeypot/server/opencanary.log'
# SQLITE_DB_PATH = 'C:/Users/ACER/Documents/GitHub/dashboard-honeypot/server/API/backend/HeneyPot.db'

# Dictionary เก็บตำแหน่งสุดท้ายที่อ่านของแต่ละไฟล์
last_file_positions = {
    COWRIE_JSON_LOG_PATH: 0,
    OPENCANARY_LOG_PATH: 0
}

def setup_database():
    db_exists = os.path.exists(SQLITE_DB_PATH)
    conn = sqlite3.connect(SQLITE_DB_PATH)
    cursor = conn.cursor()

    # สร้างตาราง honeypot_logs (Cowrie)
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

    # สร้างตาราง opencanary_logs (OpenCanary)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS opencanary_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dst_host TEXT,
            dst_port INTEGER,
            local_time TEXT,
            local_time_adjusted TEXT,
            logdata_raw TEXT,
            logdata_msg_logdata TEXT,
            logtype INTEGER,
            node_id TEXT,
            src_host TEXT,
            src_port INTEGER,
            utc_time TEXT,
            full_json_line TEXT
        )
    ''')

    # สร้างตาราง users
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            UserID INTEGER PRIMARY KEY AUTOINCREMENT,
            Email TEXT NOT NULL,
            UserName TEXT NOT NULL,
            Password TEXT NOT NULL,
            createdAt DATETIME DEFAULT (CURRENT_TIMESTAMP),
            updatedAt DATETIME DEFAULT (CURRENT_TIMESTAMP),
            deletedAt DATETIME
        )
    ''')

    conn.commit()
    return conn, cursor, not db_exists

def process_cowrie_log_entry(cursor, log_entry_json):
    try:
        log_data = json.loads(log_entry_json)
        full_json_data = log_entry_json

        message_raw = log_data.get('message')
        message = json.dumps(message_raw) if isinstance(message_raw, (list, dict)) else str(message_raw) if message_raw is not None else None

        cursor.execute('''
            INSERT INTO honeypot_logs (
                timestamp, eventid, session, message, protocol,
                src_ip, src_port, dst_ip, dst_port,
                username, password, input, command, duration, ttylog, json_data
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            log_data.get('timestamp'), log_data.get('eventid'), log_data.get('session'), message, log_data.get('protocol'),
            log_data.get('src_ip'), log_data.get('src_port'), log_data.get('dst_ip'), log_data.get('dst_port'),
            log_data.get('username'), log_data.get('password'), log_data.get('input'), log_data.get('command'), log_data.get('duration'), log_data.get('ttylog'), full_json_data
        ))
    except json.JSONDecodeError as e:
        print(f"Skipping invalid Cowrie JSON: {log_entry_json.strip()} - Error: {e}")
    except sqlite3.Error as e:
        print(f"DB Error processing Cowrie log: {e} - Data: {log_entry_json.strip()}")
    except Exception as e:
        print(f"Unexpected error in Cowrie processing: {e} - Data: {log_entry_json.strip()}")

def process_opencanary_log_entry(cursor, log_entry_json):
    try:
        log_data = json.loads(log_entry_json)
        full_json_line = log_entry_json

        logdata_raw = json.dumps(log_data.get('logdata')) if log_data.get('logdata') else None
        logdata_msg_logdata = log_data.get('logdata', {}).get('msg', {}).get('logdata')

        cursor.execute('''
            INSERT INTO opencanary_logs (
                dst_host, dst_port, local_time, local_time_adjusted,
                logdata_raw, logdata_msg_logdata, logtype, node_id,
                src_host, src_port, utc_time, full_json_line
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            log_data.get('dst_host'), log_data.get('dst_port'), log_data.get('local_time'), log_data.get('local_time_adjusted'),
            logdata_raw, logdata_msg_logdata, log_data.get('logtype'), log_data.get('node_id'),
            log_data.get('src_host'), log_data.get('src_port'), log_data.get('utc_time'), full_json_line
        ))
    except json.JSONDecodeError as e:
        print(f"Skipping invalid OpenCanary JSON: {log_entry_json.strip()} - Error: {e}")
    except sqlite3.Error as e:
        print(f"DB Error processing OpenCanary log: {e} - Data: {log_entry_json.strip()}")
    except Exception as e:
        print(f"Unexpected error in OpenCanary processing: {e} - Data: {log_entry_json.strip()}")

def monitor_log_file(log_path, cursor, process_func, last_pos_dict, initial_load=False):
    if not os.path.exists(log_path):
        print(f"File not found: '{log_path}'")
        return

    try:
        current_size = os.path.getsize(log_path)
        last_read_position = last_pos_dict.get(log_path, 0)

        if current_size < last_read_position:
            print(f"'{log_path}' truncated - reading from start.")
            last_read_position = 0
            last_pos_dict[log_path] = 0

        with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
            if not initial_load:
                f.seek(last_read_position)
            
            new_lines_processed = 0
            for line in f:
                process_func(cursor, line)
                new_lines_processed += 1
            
            last_pos_dict[log_path] = f.tell()
            
            if new_lines_processed > 0:
                print(f"Processed {new_lines_processed} new lines from '{log_path}'")

    except Exception as e:
        print(f"Error monitoring '{log_path}': {e}")

if __name__ == "__main__":
    conn, cursor, is_new_db = setup_database()
    
    if conn and cursor:
        if is_new_db:
            print("New database created. Performing initial full load...")
            monitor_log_file(COWRIE_JSON_LOG_PATH, cursor, process_cowrie_log_entry, last_file_positions, initial_load=True)
            monitor_log_file(OPENCANARY_LOG_PATH, cursor, process_opencanary_log_entry, last_file_positions, initial_load=True)
            conn.commit()
            print("Initial load complete. Starting real-time monitoring.")
        else:
            print("Existing database found. Starting real-time monitoring for new data.")
            # สำหรับ DB ที่มีอยู่แล้ว เราจะตั้งค่า last_file_positions ให้เป็นขนาดไฟล์ปัจจุบัน
            # เพื่อให้เริ่มอ่านจากท้ายไฟล์ทันทีเมื่อรันโปรแกรม
            if os.path.exists(COWRIE_JSON_LOG_PATH):
                last_file_positions[COWRIE_JSON_LOG_PATH] = os.path.getsize(COWRIE_JSON_LOG_PATH)
            if os.path.exists(OPENCANARY_LOG_PATH):
                last_file_positions[OPENCANARY_LOG_PATH] = os.path.getsize(OPENCANARY_LOG_PATH)

        try:
            while True:
                monitor_log_file(COWRIE_JSON_LOG_PATH, cursor, process_cowrie_log_entry, last_file_positions)
                monitor_log_file(OPENCANARY_LOG_PATH, cursor, process_opencanary_log_entry, last_file_positions)
                
                conn.commit() 
                time.sleep(2)

        except KeyboardInterrupt:
            print("Monitoring stopped by user.")
        except Exception as e:
            print(f"Main program error: {e}")
        finally:
            if conn:
                conn.close()
                print("Database connection closed.")
    else:
        print("Failed to set up database.")