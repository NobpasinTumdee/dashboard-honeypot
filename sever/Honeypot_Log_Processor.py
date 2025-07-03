import sqlite3
import json
import time
import os
from datetime import datetime

# กำหนดเส้นทางไฟล์ log ของ Cowrie JSON
COWRIE_JSON_LOG_PATH = 'C:/Users/ACER/Documents/GitHub/dashboard-honeypot/sever/cowrie.json'
# กำหนดเส้นทางไฟล์ log ของ OpenCanary 
OPENCANARY_LOG_PATH = 'C:/Users/ACER/Documents/GitHub/dashboard-honeypot/sever/opencanary.log'
# กำหนดเส้นทางฐานข้อมูล SQLite (เปลี่ยนชื่อให้สื่อถึงทั้งสอง honeypot)
SQLITE_DB_PATH = 'C:/Users/ACER/Documents/GitHub/dashboard-honeypot/sever/API/CowrieAPI/cowrie.db'

# Dictionary เพื่อเก็บตำแหน่งสุดท้ายที่อ่านของแต่ละไฟล์
# เมื่อโปรแกรมเริ่มต้นครั้งแรก ตำแหน่งจะเป็น 0 ซึ่งหมายถึงจะอ่านจากต้นไฟล์
# หากโปรแกรมถูกปิดและเปิดใหม่ จะเริ่มอ่านจากท้ายไฟล์ปัจจุบัน (เหมือนเดิม)
# แต่ถ้าไฟล์ถูกตัดทอน (เช่น log rotation) จะเริ่มอ่านใหม่จากต้นไฟล์
last_file_positions = {
    COWRIE_JSON_LOG_PATH: 0,
    OPENCANARY_LOG_PATH: 0
}

def setup_database():
    """
    ตั้งค่าฐานข้อมูล SQLite: เชื่อมต่อและสร้างตาราง honeypot_logs และ opencanary_logs หากยังไม่มี
    """
    try:
        conn = sqlite3.connect(SQLITE_DB_PATH)
        cursor = conn.cursor()

        # สร้างตาราง honeypot_logs หากยังไม่มี (สำหรับ Cowrie)
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
        print(f"ตรวจสอบและสร้างตาราง 'honeypot_logs' เรียบร้อยแล้ว")

        # สร้างตาราง opencanary_logs หากยังไม่มี (สำหรับ OpenCanary)
        # คอลัมน์ถูกกำหนดตามโครงสร้าง JSON ที่คุณให้มา
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS opencanary_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dst_host TEXT,
                dst_port INTEGER,
                local_time TEXT,
                local_time_adjusted TEXT,
                logdata_raw TEXT,           -- เก็บส่วน 'logdata' ทั้งหมดเป็น JSON string
                logdata_msg_logdata TEXT,   -- เก็บค่า 'logdata.msg.logdata' เพื่อให้เข้าถึงง่าย
                logtype INTEGER,
                node_id TEXT,
                src_host TEXT,
                src_port INTEGER,
                utc_time TEXT,
                full_json_line TEXT         -- เก็บ JSON ดั้งเดิมทั้งบรรทัด
            )
        ''')
        conn.commit()
        print(f"ตรวจสอบและสร้างตาราง 'opencanary_logs' เรียบร้อยแล้ว")
        print(f"ฐานข้อมูล SQLite '{SQLITE_DB_PATH}' ถูกตั้งค่าเรียบร้อยแล้ว")
        return conn, cursor
    except sqlite3.Error as e:
        print(f"เกิดข้อผิดพลาดในการตั้งค่าฐานข้อมูล: {e}")
        return None, None

def process_cowrie_log_entry(cursor, log_entry_json):
    """
    ประมวลผลรายการ log ของ Cowrie และบันทึกลงในตาราง honeypot_logs
    """
    try:
        log_data = json.loads(log_entry_json)

        # ดึงข้อมูลจาก JSON โดยใช้ .get() เพื่อป้องกัน KeyError หากฟิลด์ไม่มีอยู่
        timestamp = log_data.get('timestamp')
        eventid = log_data.get('eventid')
        session = log_data.get('session')
        
        message_raw = log_data.get('message')
        if isinstance(message_raw, list) or isinstance(message_raw, dict):
            # If message is a list or dict, convert it to a JSON string
            message = json.dumps(message_raw)
        elif message_raw is None:
            message = None # Keep it None if it's None
        else:
            message = str(message_raw) # Convert other types to string

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
        # print(f"บันทึกข้อมูล Cowrie log '{eventid}' จากเซสชัน '{session}' ลงฐานข้อมูลแล้ว")

    except json.JSONDecodeError as e:
        print(f"ข้ามบรรทัด Cowrie log ที่ไม่ใช่ JSON ที่ถูกต้อง: {log_entry_json.strip()} - ข้อผิดพลาด: {e}")
    except sqlite3.Error as e:
        print(f"เกิดข้อผิดพลาดในการบันทึกข้อมูล Cowrie log ลงฐานข้อมูล: {e} - ข้อมูล: {log_entry_json.strip()}")

def process_opencanary_log_entry(cursor, log_entry_json):
    """
    ประมวลผลรายการ log ของ OpenCanary และบันทึกลงในตาราง opencanary_logs
    """
    try:
        log_data = json.loads(log_entry_json)

        dst_host = log_data.get('dst_host')
        dst_port = log_data.get('dst_port')
        local_time = log_data.get('local_time')
        local_time_adjusted = log_data.get('local_time_adjusted')
        
        # logdata เป็น dictionary, เก็บเป็น JSON string และดึงค่า msg.logdata
        logdata_raw = json.dumps(log_data.get('logdata')) if log_data.get('logdata') else None
        logdata_msg_logdata = log_data.get('logdata', {}).get('msg', {}).get('logdata')

        logtype = log_data.get('logtype')
        node_id = log_data.get('node_id')
        src_host = log_data.get('src_host')
        src_port = log_data.get('src_port')
        utc_time = log_data.get('utc_time')
        
        full_json_line = log_entry_json # เก็บ JSON ดั้งเดิมทั้งบรรทัด

        cursor.execute('''
            INSERT INTO opencanary_logs (
                dst_host, dst_port, local_time, local_time_adjusted,
                logdata_raw, logdata_msg_logdata, logtype, node_id,
                src_host, src_port, utc_time, full_json_line
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            dst_host, dst_port, local_time, local_time_adjusted,
            logdata_raw, logdata_msg_logdata, logtype, node_id,
            src_host, src_port, utc_time, full_json_line
        ))
        # print(f"บันทึกข้อมูล OpenCanary log '{logtype}' จากโหนด '{node_id}' ลงฐานข้อมูลแล้ว")

    except json.JSONDecodeError as e:
        print(f"ข้ามบรรทัด OpenCanary log ที่ไม่ใช่ JSON ที่ถูกต้อง: {log_entry_json.strip()} - ข้อผิดพลาด: {e}")
    except sqlite3.Error as e:
        print(f"เกิดข้อผิดพลาดในการบันทึกข้อมูล OpenCanary log ลงฐานข้อมูล: {e} - ข้อมูล: {log_entry_json.strip()}")

def monitor_log_file(log_path, cursor, process_func, last_pos_dict):
    """
    ตรวจสอบไฟล์ log ที่กำหนดแบบเรียลไทม์และบันทึกข้อมูลใหม่ลงในฐานข้อมูล
    Parameters:
        log_path (str): เส้นทางของไฟล์ log ที่จะตรวจสอบ
        cursor (sqlite3.Cursor): ออบเจกต์ cursor ของฐานข้อมูล SQLite
        process_func (function): ฟังก์ชันที่จะใช้ประมวลผลแต่ละบรรทัด log (เช่น process_cowrie_log_entry)
        last_pos_dict (dict): Dictionary ที่เก็บตำแหน่งสุดท้ายที่อ่านของแต่ละไฟล์
    """
    if not os.path.exists(log_path):
        print(f"ข้อผิดพลาด: ไม่พบไฟล์ log ที่ '{log_path}' โปรดตรวจสอบเส้นทาง")
        return

    try:
        # รับขนาดปัจจุบันของไฟล์
        current_size = os.path.getsize(log_path)
        last_read_position = last_pos_dict.get(log_path, 0)

        # ตรวจสอบว่าไฟล์ถูกตัดทอน (truncated) หรือไม่ (เช่น log rotation)
        # ถ้าขนาดปัจจุบันน้อยกว่าตำแหน่งที่อ่านล่าสุด แสดงว่าไฟล์ถูกรีเซ็ต
        if current_size < last_read_position:
            print(f"ไฟล์ '{log_path}' ถูกตัดทอน (truncated) - เริ่มอ่านใหม่จากต้นไฟล์")
            last_read_position = 0 # รีเซ็ตตำแหน่งที่อ่านเป็น 0
            last_pos_dict[log_path] = 0 # อัปเดตใน dictionary

        with open(log_path, 'r') as f:
            # ย้ายตัวชี้ไปยังตำแหน่งสุดท้ายที่อ่าน
            f.seek(last_read_position)
            
            new_lines_processed = 0
            while True:
                line = f.readline()
                if not line:
                    # ไม่มีบรรทัดใหม่, หยุดอ่านสำหรับไฟล์นี้
                    break
                
                # ประมวลผลบรรทัดที่อ่านได้ด้วยฟังก์ชันที่ระบุ
                process_func(cursor, line)
                new_lines_processed += 1
            
            # อัปเดตตำแหน่งสุดท้ายที่อ่านหลังจากประมวลผลเสร็จสิ้น
            last_pos_dict[log_path] = f.tell()
            if new_lines_processed > 0:
                print(f"ประมวลผล {new_lines_processed} บรรทัดใหม่จากไฟล์ '{log_path}'")

    except FileNotFoundError:
        print(f"ข้อผิดพลาด: ไม่พบไฟล์ log ที่ '{log_path}'")
    except Exception as e:
        print(f"เกิดข้อผิดพลาดที่ไม่คาดคิดขณะตรวจสอบไฟล์ log '{log_path}': {e}")

if __name__ == "__main__":
    conn, cursor = setup_database()
    if conn and cursor:
        print("กำลังเริ่มต้นการตรวจสอบไฟล์ log ทั้งหมด...")
        try:
            while True:
                # ตรวจสอบและประมวลผล Cowrie logs
                monitor_log_file(COWRIE_JSON_LOG_PATH, cursor, process_cowrie_log_entry, last_file_positions)
                
                # ตรวจสอบและประมวลผล OpenCanary logs
                monitor_log_file(OPENCANARY_LOG_PATH, cursor, process_opencanary_log_entry, last_file_positions)
                
                conn.commit() # คอมมิตการเปลี่ยนแปลงทั้งหมดหลังจากประมวลผลทั้งสองไฟล์
                time.sleep(2) # รอ 2 วินาทีก่อนตรวจสอบอีกครั้ง เพื่อไม่ให้ใช้ CPU มากเกินไป
        except KeyboardInterrupt:
            print("หยุดการตรวจสอบ log โดยผู้ใช้")
        except Exception as e:
            print(f"เกิดข้อผิดพลาดหลักในโปรแกรม: {e}")
        finally:
            if conn:
                conn.close()
                print("ปิดการเชื่อมต่อฐานข้อมูลแล้ว")
    else:
        print("ไม่สามารถเริ่มต้นการตรวจสอบ log ได้เนื่องจากปัญหาการตั้งค่าฐานข้อมูล")
