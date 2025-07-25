import joblib
import json
import time
import os
import pandas as pd
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# --- กำหนดค่าที่คุณต้องแก้ไข ---
# กำหนดเส้นทางไปยังไฟล์ log ของ Cowrie ที่จะตรวจสอบแบบเรียลไทม์
COWRIE_LIVE_LOG_FILE = r'C:\Users\ACER\Documents\GitHub\dashboard-honeypot\server\plugin\convertData\cowrie.json' # <<< แก้ไขแล้ว

# กำหนดเส้นทางไปยังโมเดลและ vectorizer ที่บันทึกไว้
MODEL_LOAD_PATH = 'cowrie_prediction_model_simple.pkl'
VECTORIZER_LOAD_PATH = 'tfidf_vectorizer_simple.pkl'
# -----------------------------

# โหลดโมเดลและ vectorizer ที่ฝึกไว้
try:
    vectorizer = joblib.load(VECTORIZER_LOAD_PATH)
    model = joblib.load(MODEL_LOAD_PATH)
    print("โหลดโมเดลและ vectorizer สำเร็จ.")
except FileNotFoundError:
    print("ข้อผิดพลาด: ไม่พบไฟล์โมเดลหรือ vectorizer.")
    print(f"กรุณาตรวจสอบว่าไฟล์ '{MODEL_LOAD_PATH}' และ '{VECTORIZER_LOAD_PATH}' อยู่ในไดเรกทอรีเดียวกันกับสคริปต์นี้")
    print("หรือรัน 'cowrie_log_trainer_simple.py' ก่อนเพื่อสร้างไฟล์เหล่านี้.")
    exit(1)
except Exception as e:
    print(f"ข้อผิดพลาดในการโหลดโมเดล: {e}")
    exit(1)

def preprocess_log_entry_simple(log_entry):
    """
    เตรียมข้อมูล log entry เดียวกันกับที่ใช้ตอนฝึกโมเดล (cowrie_log_trainer_simple.py)
    """
    if 'eventid' not in log_entry:
        return None

    # สร้าง 'text' สำหรับการทำนาย
    text = f"{log_entry['eventid']} " + \
           (f"{log_entry['message']} " if pd.notna(log_entry.get('message')) else "") + \
           (f"input:{log_entry['input']} " if pd.notna(log_entry.get('input')) else "") + \
           (f"user:{log_entry['username']} pass:{log_entry['password']}" if pd.notna(log_entry.get('username')) and pd.notna(log_entry.get('password')) else (f"user:{log_entry['username']}" if pd.notna(log_entry.get('username')) else ""))
    
    if text.strip() != '':
        return text.strip()
    return None

def predict_log_behavior(log_entry_text):
    """
    ใช้โมเดลที่โหลดมาทำนายพฤติกรรมจากข้อความ log
    """
    if not log_entry_text:
        return "Unknown"
    
    # แปลงข้อความเป็น feature vector
    X_new = vectorizer.transform([log_entry_text])
    
    # ทำนายผล
    prediction = model.predict(X_new)
    
    return prediction[0]

class CowrieLogHandler(FileSystemEventHandler):
    def __init__(self, log_file_path):
        self.log_file_path = log_file_path
        self.last_position = 0
        self._initialize_last_position()

    def _initialize_last_position(self):
        """
        ตั้งค่าตำแหน่งเริ่มต้นของไฟล์ เพื่ออ่านเฉพาะข้อมูลใหม่
        """
        if os.path.exists(self.log_file_path):
            try:
                with open(self.log_file_path, 'r', encoding='utf-8') as f:
                    f.seek(0, os.SEEK_END)
                    self.last_position = f.tell()
                print(f"เริ่มอ่านไฟล์ log จากตำแหน่ง: {self.last_position}")
            except Exception as e:
                print(f"ข้อผิดพลาดในการเริ่มต้นอ่านไฟล์ log: {e}")
                self.last_position = 0 # ตั้งค่าเป็น 0 หากมีปัญหาในการเข้าถึงไฟล์
        else:
            print(f"ไฟล์ log ไม่พบที่: {self.log_file_path} ในการเริ่มต้น.")

    def on_modified(self, event):
        """
        เมื่อไฟล์ถูกแก้ไข (log ใหม่ถูกเขียน)
        """
        if not event.is_directory and event.src_path == self.log_file_path:
            self._process_new_logs()

    def _process_new_logs(self):
        """
        อ่าน log ที่เพิ่มเข้ามาใหม่และทำการทำนาย
        """
        try:
            with open(self.log_file_path, 'r', encoding='utf-8') as f:
                f.seek(self.last_position)
                new_lines = f.readlines()
                self.last_position = f.tell()

                for line in new_lines:
                    try:
                        log_entry = json.loads(line)
                        processed_text = preprocess_log_entry_simple(log_entry)
                        if processed_text:
                            predicted_behavior = predict_log_behavior(processed_text)
                            
                            # แสดงผลลัพธ์
                            session = log_entry.get('session', 'N/A')
                            eventid = log_entry.get('eventid', 'N/A')
                            source_ip = log_entry.get('src_ip', 'N/A')
                            message = log_entry.get('message', 'N/A')
                            input_cmd = log_entry.get('input', 'N/A')

                            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] "
                                  f"Session: {session}, IP: {source_ip}, "
                                  f"EventID: {eventid}, Log: \"{message}\" (Input: '{input_cmd}') -> "
                                  f"Predicted Behavior: \033[1m{predicted_behavior}\033[0m") # เพิ่มสีตัวหนา

                            # ตัวอย่างการแจ้งเตือน
                            if predicted_behavior in ['failed_login_attempt', 'invalid_command_attempt']:
                                print(f"    >>> ALERT: Potential suspicious activity from {source_ip} ({predicted_behavior})")

                    except json.JSONDecodeError:
                        # อาจไม่ใช่ JSON ที่สมบูรณ์ หรือเป็น log บรรทัดอื่นที่ไม่ใช่ JSON
                        continue
                    except Exception as e:
                        print(f"เกิดข้อผิดพลาดในการประมวลผล log: {e}")
                        # print(f"Log ที่มีปัญหา: {line.strip()}")
        except Exception as e:
            print(f"ข้อผิดพลาดในการอ่านไฟล์ log: {e}")


if __name__ == "__main__":
    if not os.path.exists(COWRIE_LIVE_LOG_FILE):
        print(f"ไฟล์ log ไม่พบที่: {COWRIE_LIVE_LOG_FILE}")
        print("กรุณาตรวจสอบเส้นทางหรือรอให้ Cowrie สร้างไฟล์ log.")
        exit(1)

    path_to_watch = os.path.dirname(COWRIE_LIVE_LOG_FILE)
    if not path_to_watch: 
        path_to_watch = os.getcwd() # ถ้า path เป็นแค่ชื่อไฟล์ใน current directory

    event_handler = CowrieLogHandler(COWRIE_LIVE_LOG_FILE)
    observer = Observer()
    observer.schedule(event_handler, path_to_watch, recursive=False)
    observer.start()
    print(f"กำลังตรวจสอบไฟล์ Cowrie log ที่: {COWRIE_LIVE_LOG_FILE} เพื่อการวิเคราะห์...")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
    print("หยุดการตรวจสอบ log.")