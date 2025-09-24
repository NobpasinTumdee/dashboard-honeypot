# การสร้าง user home directory
### Setup 
ต้องทำหลังจาก setup honeyfs เรียบร้อยแล้วเท่านั้น
```
sudo setfacl -m u:cowrie:rwx /home/cowrie/cowrie/honeyfs
sudo setfacl -m u:cowrie:rwx /home/cowrie/cowrie/honeyfs/etc/passwd
sudo setfacl -m u:cowrie:rwx /home/cowrie/cowrie/honeyfs/etc/group
sudo setfacl -m u:cowrie:rwx /home/cowrie/cowrie/honeyfs/home
```
### ปรับปรุง Telnet

```
pwd -> /home/cowrie/cowrie/src/cowrie/telnet/
nano session.py
```
* [session.py](/Plugin/Cowrie/telnet/session.py)

### ปรับปรุง SSH

```
nano /home/cowrie/cowrie/src/cowrie/shell/avatar.py
nano /home/cowrie/cowrie/src/cowrie/shell/pwd.py
nano /home/cowrie/cowrie/src/cowrie/ssh/session.py
```
ปรับปรุงการ return สำหรับสร้าง etc
* [avatar.py](/Plugin/Cowrie/shell/avatar.py)
    
fix uid/gid
* [pwd.py](/Plugin/Cowrie/shell/pwd.py)
     
update etc
* [session.py](/Plugin/Cowrie/shell/session.py)    

### เพิ่มความเนียน

1. ปรับชื่อให้สอดคล้อง
```
pwd -> /home/cowrie/cowrie/etc
nano cowrie.cfg
```
svr04 -> ubuntu_svr

2. เจ้าของ
```
cd /home/cowrie/cowrie/honeyfs/
```
ตรวจสอบว่า owner ของไฟล์ในนั้นเป็นของ root ไหม(หากไม่)
```
sudo chown -R root:root /home/cowrie/cowrie/honeyfs/*
sudo setfacl -m u:cowrie:rw /home/cowrie/cowrie/honeyfs
sudo setfacl -m u:cowrie:rw /home/cowrie/cowrie/honeyfs/etc/passwd
sudo setfacl -m u:cowrie:rw /home/cowrie/cowrie/honeyfs/etc/group
sudo setfacl -m u:cowrie:rw /home/cowrie/cowrie/honeyfs/home
```
3. การ ping (google.com)
```
cd /home/cowrie/cowrie/src/cowrie/commands
nano ping.py
```
* [ping.py](/Plugin/Cowrie/command/ping.py)
4. การตอบกลับของ (uname -a)
  ```
  nano /home/cowrie/cowrie/etc/cowrie.cfg
  kernel_build_string = #43~20.04.1-Ubuntu SMP Fri May 5 18:23:44 UTC 2023 x86_64 GNU/Linux
  nano /home/cowrie/cowrie/src/cowrie/commands/uname.py
  ```
  * [uname.py](/Plugin/Cowrie/command/uname.py)
5. เพิ่มกรตอบกลับของคำสั่ง
- top
- systemctl status
- df -h
  ```
  pwd -> /home/cowrie/cowrie/src/cowrie/commands
  nano top.py
  nano systemctl.py
  nano df.py
  nano __init__.py
  ```
* [__init__.py](/Plugin/Cowrie/command/__init__.py)
  * [top.py](/Plugin/Cowrie/command/top.py)
  * [systemctl.py](/Plugin/Cowrie/command/systemctl.py)
  * [df.py](/Plugin/Cowrie/command/df.py)
  * [grep.py](/Plugin/Cowrie/command/grep.py)
  * [ip.py](/Plugin/Cowrie/command/ip.py)
  * [nano.py](/Plugin/Cowrie/command/nano.py)
  * [ss.py](/Plugin/Cowrie/command/ss.py)


## ผู้เขียนคู่มือ นาย รามณรงค์ พันธเดช