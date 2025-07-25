import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import joblib
import json
import os

# --- กำหนดค่าที่คุณต้องแก้ไข ---
# กำหนดเส้นทางไปยังไฟล์ log ของ Cowrie
# หากมีหลายไฟล์ log ในไดเรกทอรี ให้ชี้ไปที่ไดเรกทอรีนั้น
# หรือใช้ r'' สำหรับ raw string เพื่อหลีกเลี่ยงปัญหา escape characters
COWRIE_LOG_PATH = r'C:\Users\ACER\Documents\GitHub\dashboard-honeypot\server\plugin\convertData\cowrie.json'

# กำหนดเส้นทางสำหรับบันทึกโมเดลและ vectorizer
MODEL_SAVE_PATH = 'cowrie_prediction_model_simple.pkl'
VECTORIZER_SAVE_PATH = 'tfidf_vectorizer_simple.pkl'
# -----------------------------

def load_cowrie_logs(log_path):
    """
    โหลด log จากไฟล์ cowrie.json หรือจากหลายไฟล์ json ในไดเรกทอรี
    """
    logs = []
    if os.path.isfile(log_path):
        print(f"กำลังอ่านไฟล์: {log_path}")
        with open(log_path, 'r', encoding='utf-8') as f: # เพิ่ม encoding='utf-8' เพื่อรองรับภาษาไทยหรืออักขระพิเศษ
            for line in f:
                try:
                    logs.append(json.loads(line))
                except json.JSONDecodeError as e:
                    # print(f"Skipping malformed JSON line: {line.strip()} (Error: {e})")
                    continue
    elif os.path.isdir(log_path):
        print(f"กำลังอ่าน log จากไดเรกทอรี: {log_path}")
        for filename in os.listdir(log_path):
            if filename.endswith('.json'):
                file_path = os.path.join(log_path, filename)
                with open(file_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        try:
                            logs.append(json.loads(line))
                        except json.JSONDecodeError as e:
                            # print(f"Skipping malformed JSON line in {filename}: {line.strip()} (Error: {e})")
                            continue
    else:
        print(f"เส้นทาง '{log_path}' ไม่ใช่ไฟล์หรือไดเรกทอรีที่ถูกต้อง.")
    return pd.DataFrame(logs)

def prepare_data_simple(df):
    """
    เตรียมข้อมูลจาก DataFrame ของ log โดยใช้ eventid และข้อความที่เกี่ยวข้อง
    """
    df_filtered = df.copy()

    # สร้าง 'text' สำหรับการวิเคราะห์
    df_filtered['text'] = df_filtered.apply(
        lambda row: f"{row['eventid']} " + \
                    (f"{row['message']} " if pd.notna(row.get('message')) else "") + \
                    (f"input:{row['input']} " if pd.notna(row.get('input')) else "") + \
                    (f"user:{row['username']} pass:{row['password']}" if pd.notna(row.get('username')) and pd.notna(row.get('password')) else (f"user:{row['username']}" if pd.notna(row.get('username')) else "")),
        axis=1
    )

    # สร้าง 'label' จาก eventid ที่คุณให้มา
    df_filtered['label'] = 'other_activity' # กำหนดค่าเริ่มต้นเป็นกิจกรรมอื่นๆ

    # การเข้าสู่ระบบ
    df_filtered.loc[df_filtered['eventid'] == 'cowrie.login.success', 'label'] = 'successful_login'
    df_filtered.loc[df_filtered['eventid'] == 'cowrie.login.failed', 'label'] = 'failed_login_attempt' # Brute-force จะเป็น failed_login ซ้ำๆ
    
    # การรันคำสั่ง
    df_filtered.loc[df_filtered['eventid'] == 'cowrie.command.input', 'label'] = 'command_execution'
    df_filtered.loc[df_filtered['eventid'] == 'cowrie.command.failed', 'label'] = 'invalid_command_attempt' # คำสั่งที่รันแล้วไม่สำเร็จ
    
    # การเชื่อมต่อและข้อมูลไคลเอนต์
    df_filtered.loc[df_filtered['eventid'] == 'cowrie.session.connect', 'label'] = 'session_connect'
    df_filtered.loc[df_filtered['eventid'] == 'cowrie.client.version', 'label'] = 'client_version_check'
    df_filtered.loc[df_filtered['eventid'] == 'cowrie.client.kex', 'label'] = 'client_kex_exchange'
    df_filtered.loc[df_filtered['eventid'] == 'cowrie.client.size', 'label'] = 'client_terminal_size'
    df_filtered.loc[df_filtered['eventid'] == 'cowrie.client.var', 'label'] = 'client_env_variable'
    df_filtered.loc[df_filtered['eventid'] == 'cowrie.session.params', 'label'] = 'session_parameters'
    df_filtered.loc[df_filtered['eventid'].str.contains('cowrie.log.', na=False), 'label'] = 'cowrie_internal_log' # จัดการ log ภายในของ cowrie

    # กรองข้อมูลที่ไม่มี text หรือ label ที่เราสนใจ
    df_final = df_filtered[df_filtered['text'].str.strip() != ''].copy()
    # เก็บเฉพาะ Label ที่เราสนใจจะสอนให้โมเดลเรียนรู้ (ไม่รวม 'other_activity' ในชุดข้อมูลฝึก)
    df_final = df_final[df_final['label'] != 'other_activity'].copy() 
    
    df_final.dropna(subset=['text', 'label'], inplace=True) # ลบแถวที่มีค่าว่าง

    print(f"จำนวนรายการ log ที่เตรียมไว้: {len(df_final)}")
    print("การกระจายของ Label:")
    print(df_final['label'].value_counts())

    return df_final[['text', 'label']]

def train_model(df_data):
    """
    ฝึกโมเดล Text Classification
    """
    X = df_data['text']
    y = df_data['label']

    if len(X) < 2 or len(y.unique()) < 2:
        print("ข้อผิดพลาด: ข้อมูลไม่เพียงพอสำหรับการฝึกโมเดล (ต้องมีอย่างน้อย 2 ตัวอย่างและ 2 คลาส).")
        print("กรุณาตรวจสอบไฟล์ log ของคุณว่ามีข้อมูลเพียงพอและหลากหลายหรือไม่.")
        return None, None

    # แบ่งข้อมูลเป็นชุดฝึกและชุดทดสอบ
    # เพิ่ม try-except สำหรับ train_test_split ในกรณีที่ y_train มีคลาสเดียว
    try:
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    except ValueError as e:
        print(f"ข้อผิดพลาดในการแบ่งชุดข้อมูล: {e}")
        print("อาจมีคลาสเดียวในชุดข้อมูลที่คุณพยายามฝึกโมเดล. ไม่สามารถแบ่งแบบ stratify ได้.")
        print("ลองลด test_size หรือใช้ข้อมูลที่มีคลาสหลากหลายกว่านี้.")
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42) # ลองแบบไม่มี stratify
        if len(y_train.unique()) < 2:
            print("ยังคงมีปัญหา: ชุดฝึกมีคลาสน้อยกว่า 2 คลาสหลังจากแบ่งข้อมูล.")
            return None, None


    # สร้าง Pipeline สำหรับ Vectorization และ Model
    model_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=1000, ngram_range=(1, 2))),
        ('clf', LogisticRegression(solver='liblinear', multi_class='auto', max_iter=1000))
    ])

    print("กำลังฝึกโมเดล...")
    model_pipeline.fit(X_train, y_train)
    print("ฝึกโมเดลเสร็จสิ้น!")

    # ประเมินผลโมเดลเบื้องต้น
    accuracy = model_pipeline.score(X_test, y_test)
    print(f"ความแม่นยำของโมเดลบนชุดทดสอบ: {accuracy:.2f}")

    tfidf_vectorizer = model_pipeline.named_steps['tfidf']
    classifier = model_pipeline.named_steps['clf']

    return tfidf_vectorizer, classifier

def save_model_and_vectorizer(vectorizer, model):
    """
    บันทึกโมเดลและ vectorizer ลงดิสก์
    """
    if vectorizer and model:
        # ตรวจสอบและสร้างไดเรกทอรีสำหรับบันทึกโมเดลหากยังไม่มี
        model_dir = os.path.dirname(MODEL_SAVE_PATH)
        if model_dir and not os.path.exists(model_dir):
            os.makedirs(model_dir)
        
        vectorizer_dir = os.path.dirname(VECTORIZER_SAVE_PATH)
        if vectorizer_dir and not os.path.exists(vectorizer_dir):
            os.makedirs(vectorizer_dir)

        joblib.dump(vectorizer, VECTORIZER_SAVE_PATH)
        joblib.dump(model, MODEL_SAVE_PATH)
        print(f"บันทึก Vectorizer ที่: {VECTORIZER_SAVE_PATH}")
        print(f"บันทึกโมเดลที่: {MODEL_SAVE_PATH}")
    else:
        print("ไม่สามารถบันทึกโมเดลหรือ vectorizer ได้ เนื่องจากไม่มีโมเดลที่ฝึกไว้")

if __name__ == "__main__":
    # ตรวจสอบว่าไฟล์ log ที่ระบุมีอยู่จริง
    if not os.path.exists(COWRIE_LOG_PATH):
        print(f"ข้อผิดพลาด: ไม่พบไฟล์ log ที่ '{COWRIE_LOG_PATH}'")
        print("กรุณาตรวจสอบเส้นทางไฟล์และชื่อไฟล์ให้ถูกต้อง.")
        exit(1)

    print(f"กำลังโหลด log จาก: {COWRIE_LOG_PATH}")
    df = load_cowrie_logs(COWRIE_LOG_PATH)

    if df.empty:
        print("ไม่พบข้อมูลในไฟล์ log หรือไฟล์ log ว่างเปล่า ไม่สามารถฝึกโมเดลได้")
    else:
        # ตรวจสอบว่าคอลัมน์ที่จำเป็นมีอยู่หรือไม่
        required_cols = ['eventid']
        for col in required_cols:
            if col not in df.columns:
                print(f"ข้อผิดพลาด: คอลัมน์ '{col}' ไม่พบในไฟล์ log ของคุณ โปรดตรวจสอบรูปแบบไฟล์.")
                exit(1)

        df_prepared = prepare_data_simple(df)
        if not df_prepared.empty and len(df_prepared['label'].unique()) > 1:
            vectorizer, model = train_model(df_prepared)
            save_model_and_vectorizer(vectorizer, model)
        else:
            print("ไม่มีข้อมูลที่เพียงพอหลังจากเตรียมข้อมูล (ต้องมีอย่างน้อย 2 คลาส) ไม่สามารถฝึกโมเดลได้")
            print("โปรดตรวจสอบว่าไฟล์ log ของคุณมีเหตุการณ์ที่หลากหลายเพียงพอสำหรับการสร้าง Label.")