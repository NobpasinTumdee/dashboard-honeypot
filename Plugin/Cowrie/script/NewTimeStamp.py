#!/usr/bin/env python3
import os
import random
import datetime

HONEYFS_PATH = "/home/cowrie/cowrie/honeyfs/home"

# --------------------------
# helper: random timestamp ในช่วง start–end
# --------------------------
def rand_ts(start: datetime.datetime, end: datetime.datetime):
    return random.randint(int(start.timestamp()), int(end.timestamp()))

def apply_timestamp(path, ts):
    try:
        os.utime(path, (ts, ts))
    except Exception as e:
        print(f"skip {path}: {e}")

# --------------------------
# core logic
# --------------------------
def adjust_user(user_path):
    """
    จำลองการเกิดไฟล์ของ user:
    - root folder = วัน join
    - subdir ค่อย ๆ เพิ่มหลังจาก join (± 7 วัน)
    - ไฟล์ในโฟลเดอร์: ค่อย ๆ กระจายเป็นวัน ๆ ไป (ไม่ใช่แค่ ± 1 ชม.)
    - hidden config (.bashrc, .profile, .ssh) = ใกล้วัน join มากที่สุด
    """
    # สุ่มช่วงชีวิตของ user (ระหว่างปี 2022–2024)
    start = datetime.datetime(2022, 1, 1)
    end   = datetime.datetime(2024, 12, 31)

    # วัน join ของ user
    join_ts = rand_ts(start, end)
    apply_timestamp(user_path, join_ts)

    for root, dirs, files in os.walk(user_path):
        # subdir → ถูกสร้างภายใน 7 วันหลัง join
        for d in dirs:
            dpath = os.path.join(root, d)
            d_ts = join_ts + random.randint(0, 7*86400)
            apply_timestamp(dpath, d_ts)

        # ไฟล์
        for f in files:
            fpath = os.path.join(root, f)
            lower_f = f.lower()

            # config/hidden → วัน join หรือ ± 1 วัน
            if lower_f.startswith(".bash") or lower_f.startswith(".profile") or ".ssh" in root:
                f_ts = join_ts + random.randint(-86400, 86400)
            else:
                # ไฟล์ธรรมดา → ค่อย ๆ เกิดใน 3 เดือนแรก
                base_file_ts = join_ts + random.randint(0, 90*86400)
                # แต่ละไฟล์ในโฟลเดอร์เดียวกันต่างกันไม่เกิน 3 วัน
                f_ts = base_file_ts + random.randint(-3*86400, 3*86400)

            apply_timestamp(fpath, f_ts)

def main():
    for username in os.listdir(HONEYFS_PATH):
        user_path = os.path.join(HONEYFS_PATH, username)
        if os.path.isdir(user_path):
            adjust_user(user_path)
            print(f"✅ Adjusted {username}")

if __name__ == "__main__":
    main()
