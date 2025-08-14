import os
import random
import time
import datetime
from faker import Faker
import pwd
import names
import shutil

# สร้าง instance ของ Faker
fake = Faker()

# สุ่ม usernames
users = [names.get_first_name().lower() for _ in range(5)]
HONEYFS_HOME = "cowrie/honeyfs/home"

# directory มาตรฐาน
base_dirs = ["Desktop", "Documents", "Downloads", "Music", "Pictures", "Public", "Templates", "Videos"]

# directory และไฟล์ซ่อนมาตรฐาน (เพิ่มเพื่อความสมจริงของ home directory)
hidden_dirs = [".cache", ".config", ".local/share"]
hidden_files = [".bash_history", ".viminfo", ".gitconfig"]

# กำหนด UID และ GID สำหรับ user "root"
try:
    root_info = pwd.getpwnam("root")
    ROOT_UID = root_info.pw_uid
    ROOT_GID = root_info.pw_gid
except KeyError:
    # กรณีที่ไม่พบ user "root"
    ROOT_UID = 0
    ROOT_GID = 0

def create_file(path, content="", mode=0o644):
    """
    สร้างไฟล์ + เขียนเนื้อหา + permission
        path (str): ของไฟล์ที่จะสร้าง
        content (str): เนื้อหาที่จะเขียนลงในไฟล์
        mode (int): ฐานแปดสำหรับตั้งค่า permission
    """
    with open(path, "w") as f:
        f.write(content)
    os.chmod(path, mode)

def create_dir(path, mode=0o755):
    """
    สร้าง directory + permission
        path (str): directory ที่จะสร้าง
        mode (int): ฐานแปดสำหรับตั้งค่า permission
    """
    os.makedirs(path, exist_ok=True)
    os.chmod(path, mode)

def generate_filename(directory):
    """
    สร้างชื่อไฟล์ปลอมตามประเภทของ directory
    Returns (str): ชื่อไฟล์
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

def create_and_age_file(path, content, mode, uid, gid, min_timestamp, max_timestamp):
    """
    กำหนด meta data: ownership, timestamp
        path (str): ของไฟล์
        content (str): เนื้อหาไฟล์
        mode (int): Permission
        uid (int): User ID ของเจ้าของไฟล์
        gid (int): Group ID ของเจ้าของไฟล์
        min_timestamp (float)
        max_timestamp (float)
    """
    create_file(path, content, mode=mode)
    
    # ตั้งค่า ownership
    os.chown(path, uid, gid)
    
    # สุ่ม timestamp
    random_timestamp = random.uniform(min_timestamp, max_timestamp)
    
    # เวลาการเข้าถึงและแก้ไข ของไฟล์
    os.utime(path, (random_timestamp, random_timestamp))

# ลบ directory เดิมออก (ป้องกันชื่อซ้ำ)
if os.path.exists(HONEYFS_HOME):
    shutil.rmtree(HONEYFS_HOME)

for user in users:
    print(f"กำลังสร้าง user: {user}...")
    user_home = os.path.join(HONEYFS_HOME, user)

    # สร้าง Home directory
    create_dir(user_home)
    os.chown(user_home, ROOT_UID, ROOT_GID) # ตั้ง ownership เป็น root
    
    # กำหนดช่วงเวลา timestamp สำหรับ user นี้
    end_date = datetime.date.today() - datetime.timedelta(days=1)
    start_date = end_date - datetime.timedelta(days=random.randint(365, 730))
    
    min_timestamp = time.mktime(start_date.timetuple())
    max_timestamp = time.mktime(end_date.timetuple())
    
    # เลือก directory พื้นฐานแบบสุ่ม
    dirs_for_user = random.sample(base_dirs, k=random.randint(4, len(base_dirs)))
    
    # สร้าง directory และไฟล์ dummy
    for d in dirs_for_user:
        dir_path = os.path.join(user_home, d)
        create_dir(dir_path)
        os.chown(dir_path, ROOT_UID, ROOT_GID) # ตั้ง ownership เป็น root
        
        num_files = random.randint(3, 10)
        for _ in range(num_files):
            fname = generate_filename(d)
            content = fake.paragraph(nb_sentences=random.randint(1, 5))
            
            # สร้างและตั้งค่าไฟล์พร้อม metadata ที่สมจริง
            create_and_age_file(os.path.join(dir_path, fname), content, 0o644, ROOT_UID, ROOT_GID, min_timestamp, max_timestamp)

    # เพิ่ม directory และไฟล์ซ่อน (เพื่อความสมจริงของ home directory)
    for hd in hidden_dirs:
        hd_path = os.path.join(user_home, hd)
        create_dir(hd_path, mode=0o700)
        os.chown(hd_path, ROOT_UID, ROOT_GID)
    
    for hf in hidden_files:
        create_and_age_file(os.path.join(user_home, hf), fake.paragraph(nb_sentences=3), 0o644, ROOT_UID, ROOT_GID, min_timestamp, max_timestamp)

    # สร้าง .ssh และ authorized_keys
    ssh_dir = os.path.join(user_home, ".ssh")
    create_dir(ssh_dir, mode=0o700)
    os.chown(ssh_dir, ROOT_UID, ROOT_GID) # ตั้ง ownership เป็น root
    create_and_age_file(os.path.join(ssh_dir, "authorized_keys"), "", 0o600, ROOT_UID, ROOT_GID, min_timestamp, max_timestamp)

    # สร้าง .bashrc และ .profile
    bashrc_content = f"# .bashrc for {user}\nexport PS1='{user}@honeypot:\\w$ '\n"
    create_and_age_file(os.path.join(user_home, ".bashrc"), bashrc_content, 0o644, ROOT_UID, ROOT_GID, min_timestamp, max_timestamp)
    
    profile_content = f"# .profile for {user}\n"
    create_and_age_file(os.path.join(user_home, ".profile"), profile_content, 0o644, ROOT_UID, ROOT_GID, min_timestamp, max_timestamp)

print("\n✅ สร้าง user filesystem แบบ random และสมจริงสำเร็จ! ")
