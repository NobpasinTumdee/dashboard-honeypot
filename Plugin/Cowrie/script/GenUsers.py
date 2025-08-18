#!/usr/bin/env python3
import os
import random
import datetime
import shutil
from faker import Faker   
import names              

# สร้าง instance ของ Faker
fake = Faker()

# BASE_DIR คือ directory ที่ไฟล์นี้อยู่
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

HONEYFS_HOME = os.path.join(BASE_DIR, "cowrie/honeyfs/home")
ETC_DIR = os.path.join(BASE_DIR, "cowrie/honeyfs/etc")
PASSWD_FILE = os.path.join(ETC_DIR, "passwd")
GROUP_FILE = os.path.join(ETC_DIR, "group")

# จำนวน user และ UID/GID เริ่มต้น
NUM_USERS = 5
START_UID = 2000   # UID เริ่มต้น
START_GID = 2000   # GID เริ่มต้น

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


def create_and_age_file(path, content, mode, min_timestamp=None, max_timestamp=None, uid=None, gid=None):
    """
    สร้างไฟล์ 
    """
    create_file(path, content, mode=mode, uid=uid, gid=gid)
    

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

def create_passwd(users):
    """
    สร้างไฟล์ /etc/passwd ปลอม
    """
    os.makedirs(ETC_DIR, exist_ok=True)
    lines = []
    for u in users:
        lines.append(f"{u['username']}:x:{u['uid']}:{u['gid']}:{u['username']}:{u['home']}:{u['shell']}\n")
    create_file(PASSWD_FILE, "".join(lines), 0o644)
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
    print("\n✅ สร้าง user filesystem และ etc/passwd/group เรียบร้อยแล้ว")
    print("⚠️  โปรดรัน fsctl create ด้วยตัวเองเพื่อต่อเติม fs.pickle")

if __name__ == "__main__":
    main()
