#!/usr/bin/env python3
import os
import random
import datetime
import shutil
from faker import Faker   
import names              


fake = Faker()


BASE_DIR = "/home/cowrie/cowrie/honeyfs/"

HONEYFS_HOME = os.path.join(BASE_DIR, "home")
ETC_DIR = os.path.join(BASE_DIR, "etc")
PASSWD_FILE = os.path.join(ETC_DIR, "passwd")
GROUP_FILE = os.path.join(ETC_DIR, "group")

# จำนวน user และ UID/GID เริ่มต้น
NUM_USERS = 5
START_UID = 1002   # UID เริ่มต้น
START_GID = 1002   # GID เริ่มต้น

# directory มาตรฐาน
base_dirs = ["Desktop", "Documents", "Downloads", "Music", "Pictures", "Public", "Templates", "Videos"]

# directory/ไฟล์ซ่อน
hidden_dirs = [".cache", ".config", ".local/share"]
hidden_files = [".bash_history", ".viminfo", ".gitconfig"]


def create_file(path, content="", mode=0o644, uid=None, gid=None):
    """
    สร้างไฟล์ + เขียนเนื้อหา + owner/permission
    """
    os.makedirs(os.path.dirname(path), exist_ok=True)   
    with open(path, "w") as f:
        f.write(content)
    os.chmod(path, mode)                                
    if uid is not None and gid is not None:
        try:
            os.chown(path, uid, gid)                    
        except PermissionError:
            pass  # ถ้าไม่ได้ run เป็น root ให้ข้ามไป

def create_dir(path, mode=0o755, uid=None, gid=None):
    """
    สร้าง directory + owner/permission
    """
    os.makedirs(path, exist_ok=True)
    os.chmod(path, mode)
    if uid is not None and gid is not None:
        try:
            os.chown(path, uid, gid)
        except PermissionError:
            pass

def generate_filename(directory):
    """
    สุ่มชื่อไฟล์ตามประเภท directory
    """
    if directory in ["Documents", "Desktop", "Templates"]:
        return fake.file_name(category='document', extension='txt')
    elif directory == "Downloads":
        return fake.file_name(category='data', extension='zip')
    elif directory == "Pictures":
        return fake.file_name(category='image', extension='jpg')
    elif directory == "Music":
        return fake.file_name(category='audio', extension='mp3')
    elif directory == "Videos":
        return fake.file_name(category='video', extension='mp4')
    else:
        return fake.file_name(extension='txt')

# ❌ ฟังก์ชันนี้เคยใช้สำหรับใส่ timestamp → ตัดออกการเรียก os.utime
def create_and_age_file(path, content, mode, min_timestamp=None, max_timestamp=None, uid=None, gid=None):
    """
    สร้างไฟล์ (ตัดการ random timestamp ออก เหลือแค่สร้างไฟล์ปกติ)
    """
    create_file(path, content, mode=mode, uid=uid, gid=gid)
    # random_timestamp = random.uniform(min_timestamp, max_timestamp)
    # os.utime(path, (random_timestamp, random_timestamp))   # ❌ ตัดออก

def generate_users():
    """
    สร้าง list ของ user (username, uid, gid, home, shell)
    """
    users = []
    for i in range(NUM_USERS):
        username = names.get_first_name().lower()
        uid = START_UID + i
        gid = START_GID + i
        home = os.path.join(HONEYFS_HOME, username)
        shell = "/bin/bash"
        users.append({
            "username": username,
            "uid": uid,
            "gid": gid,
            "home": home,
            "shell": shell
        })
    return users

# def create_passwd(users):
#     """
#     สร้างไฟล์ /etc/passwd ปลอม
#     """
#     os.makedirs(ETC_DIR, exist_ok=True)
#     lines = []
#     for u in users:
#         lines.append(f"{u['username']}:x:{u['uid']}:{u['gid']}:{u['username']}:{u['home']}:{u['shell']}\n")
    
#     create_file(PASSWD_FILE, "".join(lines), 0o644)
#     print(f" สร้าง {PASSWD_FILE}")

def create_passwd(users):
    """
    สร้างไฟล์ /etc/passwd ปลอม
    """
    os.makedirs(ETC_DIR, exist_ok=True)
    
    if os.path.exists(PASSWD_FILE):
        with open(PASSWD_FILE, 'r') as f:
            lines = f.readlines()
        
        existing_users = {}
        for line in lines:
            parts = line.strip().split(':')
            if len(parts) >= 3:
                # ใช้ UID เป็น key เพื่อตรวจสอบว่ามีผู้ใช้คนอื่นใช้ UID นี้หรือไม่
                existing_users[parts[2]] = line  
    else:
        existing_users = {}

    new_lines = []
    processed_uids = set() # ใช้ set เพื่อติดตาม UID ที่ถูกประมวลผลแล้ว
    
    for u in users:
        uid = str(u['uid'])
        
        # ลบรายการเก่าที่มี UID เดียวกันออกไป
        if uid in existing_users:
            del existing_users[uid]
        
        # กำหนด home directory ที่สมจริง
        home_dir = f"/home/{u['username']}"
        if u['username'] == 'root':
            home_dir = '/root'
        
        new_lines.append(f"{u['username']}:x:{u['uid']}:{u['gid']}:{u['username']}:{home_dir}:{u['shell']}\n")
    
    # รวมรายการผู้ใช้เก่าที่เหลืออยู่และผู้ใช้ใหม่เข้าด้วยกัน
    final_lines = list(existing_users.values()) + new_lines
    
    create_file(PASSWD_FILE, "".join(final_lines), 0o644)
    print(f" สร้าง {PASSWD_FILE}")

def create_group(users):
    """
    สร้างไฟล์ /etc/group ปลอม
    """
    lines = []
    for u in users:
        lines.append(f"{u['username']}:x:{u['gid']}:{u['username']}\n")
    create_file(GROUP_FILE, "".join(lines), 0o644)
    print(f" สร้าง {GROUP_FILE}")

def create_home(users):
    """
    สร้าง home directory ของแต่ละ user พร้อมโครงสร้างไฟล์/dir ปลอม
    """
    if os.path.exists(HONEYFS_HOME):
        shutil.rmtree(HONEYFS_HOME)  
    os.makedirs(HONEYFS_HOME, exist_ok=True)

    for u in users:
        print(f"กำลังสร้าง home ของ {u['username']}...")
        user_home = u["home"]
        create_dir(user_home, uid=u["uid"], gid=u["gid"])

        # ❌ ส่วน random timestamp เดิม (ย้อนหลัง 1-2 ปี) → เอาออก
        # end_date = datetime.date.today() - datetime.timedelta(days=1)
        # start_date = end_date - datetime.timedelta(days=random.randint(365, 730))
        # min_ts = time.mktime(start_date.timetuple())
        # max_ts = time.mktime(end_date.timetuple())

        # directory หลัก
        dirs_for_user = random.sample(base_dirs, k=random.randint(4, len(base_dirs)))
        for d in dirs_for_user:
            dir_path = os.path.join(user_home, d)
            create_dir(dir_path, uid=u["uid"], gid=u["gid"])
            for _ in range(random.randint(3, 10)):
                fname = generate_filename(d)
                content = fake.paragraph(nb_sentences=random.randint(1, 5))
                create_and_age_file(os.path.join(dir_path, fname), content, 0o644, uid=u["uid"], gid=u["gid"])

        # hidden directories
        for hd in hidden_dirs:
            hd_path = os.path.join(user_home, hd)
            create_dir(hd_path, mode=0o700, uid=u["uid"], gid=u["gid"])

        # hidden files
        for hf in hidden_files:
            create_and_age_file(os.path.join(user_home, hf),
                                fake.paragraph(nb_sentences=3),
                                0o644, uid=u["uid"], gid=u["gid"])

        # .ssh + authorized_keys
        ssh_dir = os.path.join(user_home, ".ssh")
        create_dir(ssh_dir, mode=0o700, uid=u["uid"], gid=u["gid"])
        create_and_age_file(os.path.join(ssh_dir, "authorized_keys"), "", 0o600, uid=u["uid"], gid=u["gid"])

        # shell config
        bashrc = f"# .bashrc for {u['username']}\nexport PS1='{u['username']}@honeypot:\\w$ '\n"
        create_and_age_file(os.path.join(user_home, ".bashrc"), bashrc, 0o644, uid=u["uid"], gid=u["gid"])
        profile = f"# .profile for {u['username']}\n"
        create_and_age_file(os.path.join(user_home, ".profile"), profile, 0o644, uid=u["uid"], gid=u["gid"])


def main():
    users = generate_users()
    create_passwd(users)
    create_group(users)
    create_home(users)

    print("\n สร้าง user filesystem และ etc/passwd/group เรียบร้อยแล้ว")
    

if __name__ == "__main__":
    main()
