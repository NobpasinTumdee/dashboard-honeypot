# home/cowrie/etcFile.py

import os

BASE_PATH = "/home/cowrie/cowrie/honeyfs/etc"


# ตรวจสอบ + สร้าง + อัปเดตไฟล์ /etc/passwd
def ensure_passwd():
    # สร้าง path
    passwd_file = os.path.join(BASE_PATH, "passwd")
    
    # กำหนดรายการ user มาตรฐานที่ควรมีในระบบ
    # ชื่อผู้ใช้:รหัสผ่าน (x หมายถึงถูกเก็บในไฟล์ shadow):UID:GID:คำอธิบาย:home directory:shell
    default_entries = [
        "root:x:0:0:root:/root:/bin/bash",
        "daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin",
        "bin:x:2:2:bin:/bin:/usr/sbin/nologin",
        "sys:x:3:3:sys:/dev:/usr/sbin/nologin",
        "sync:x:4:65534:sync:/bin:/bin/sync",
        "games:x:5:60:games:/usr/games:/usr/sbin/nologin",
        "man:x:6:12:man:/var/cache/man:/usr/sbin/nologin",
        "lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin",
        "mail:x:8:8:mail:/var/mail:/usr/sbin/nologin",
        "www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin",
        "ubuntu:x:1000:1000:Ubuntu:/home/ubuntu:/bin/bash"
    ]

    # หากไม่มีไฟล์ passwd 
    if not os.path.exists(passwd_file):
        # สร้าง dir passwd
        with open(passwd_file, "w") as f:
            # เขียนรายการ default_entries ลงในไฟล์
            f.write("\n".join(default_entries) + "\n")
        return

    # หากมี
    with open(passwd_file, "r+") as f:
        lines = f.read().splitlines()       # อ่านเนื้อหาเก่า + save ไว้
        
        for entry in default_entries:
            user = entry.split(":")[0]      # เก็บ username
            
            # ตรวจสอบว่า user นั้นมีอยู่ในไฟล์แล้วหรือไม่ ถ้าไม่ ให้เพิ่มบรรทัดลงใน lines
            if not any(line.startswith(user + ":") for line in lines):
                lines.append(entry)
        
        f.seek(0)   # จุดเริ่มต้นของไฟล์
        f.write("\n".join(lines) + "\n")    # เขียนเนื้อหาใหม่



# ตรวจสอบ + สร้าง + อัปเดตไฟล์ /etc/shadow (คล้ายกับ passwd)
def ensure_shadow():
    shadow_file = os.path.join(BASE_PATH, "shadow")
    default_entries = [
        "root:*:19000:0:99999:7:::",
        "daemon:*:19000:0:99999:7:::",
        "bin:*:19000:0:99999:7:::",
        "sys:*:19000:0:99999:7:::",
        "sync:*:19000:0:99999:7:::",
        "games:*:19000:0:99999:7:::",
        "man:*:19000:0:99999:7:::",
        "lp:*:19000:0:99999:7:::",
        "mail:*:19000:0:99999:7:::",
        "www-data:*:19000:0:99999:7:::",
        "ubuntu:*:19000:0:99999:7:::"
    ]

    if not os.path.exists(shadow_file):
        with open(shadow_file, "w") as f:
            f.write("\n".join(default_entries) + "\n")
        return

    with open(shadow_file, "r+") as f:
        lines = f.read().splitlines()
        for entry in default_entries:
            user = entry.split(":")[0]
            if not any(line.startswith(user + ":") for line in lines):
                lines.append(entry)
        f.seek(0)
        f.write("\n".join(lines) + "\n")



# ตรวจสอบ + สร้าง + อัปเดตไฟล์ /etc/group (คล้ายกับ passwd)
def ensure_group():
    group_file = os.path.join(BASE_PATH, "group")
    default_entries = [
        "root:x:0:",
        "daemon:x:1:",
        "bin:x:2:",
        "sys:x:3:",
        "adm:x:4:syslog,ubuntu",
        "tty:x:5:",
        "games:x:60:",
        "www-data:x:33:",
        "users:x:100:",
        "ubuntu:x:1000:"
    ]

    if not os.path.exists(group_file):
        with open(group_file, "w") as f:
            f.write("\n".join(default_entries) + "\n")
        return

    with open(group_file, "r+") as f:
        lines = f.read().splitlines()
        for entry in default_entries:
            group = entry.split(":")[0]
            if not any(line.startswith(group + ":") for line in lines):
                lines.append(entry)
        f.seek(0)
        f.write("\n".join(lines) + "\n")


# ตรวจสอบ + สร้างไฟล์ /etc/hosts
def ensure_hosts():
    hosts_file = os.path.join(BASE_PATH, "hosts")
    
    default_content = """::1     localhost ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
ff02::3 ip6-allhosts
"""

    # หากยังไม่มี ไฟล์ hosts
    if not os.path.exists(hosts_file):
        with open(hosts_file, "w") as f:
            f.write(default_content)



# ตรวจสอบ + สร้างไฟล์ /etc/hostname
def ensure_hostname():
    hostname_file = os.path.join(BASE_PATH, "hostname")
    
    # Check if the hostname file does not exist.
    if not os.path.exists(hostname_file):
        # If it doesn't exist, create it and write the fixed hostname "root".
        with open(hostname_file, "w") as f:
            f.write("root\n")


# ตรวจสอบ + สร้างไฟล์ /etc/issue
def ensure_issue():
    issue_file = os.path.join(BASE_PATH, "issue")
    # กำหนดเนื้อหา issue ที่จะแสดงตอน login
    default_content = "Ubuntu 20.04.6 LTS \\n \\l\n"

    #  ถ้าไม่มี issue
    if not os.path.exists(issue_file):
        with open(issue_file, "w") as f:
            f.write(default_content)



if __name__ == "__main__":
    ensure_passwd()
    ensure_shadow()
    ensure_group()
    ensure_hosts()
    ensure_hostname()
    ensure_issue()
    print("สร้างไฟล์ระบบพื้นฐานใน /etc เรียบร้อยแล้ว")
