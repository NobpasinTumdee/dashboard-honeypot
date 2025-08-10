## Http/Https
### แก้ไขไฟล์ (1)
```bash
cd ~/Honeypot/Opencanary_env/lib/python3.12/site-packages/opencanary/modules/
code .
```
* [http.py](/Plugin/Opencannary/modules/http.py)
* [https.py](/Plugin/Opencannary/modules/https.py)
### แก้ไขไฟล์ (2)
ตำแหน่งไฟล์
```bash
sudo nano /etc/opencanaryd/opencanary.conf
```
```bash
"http.enabled": true,
"http.port": 80,
"http.skin": "test_skin",
```
```bash
"https.enabled": true,
"https.port": 443,
"https.skin": "test_skin",
```

### Run Honeypot
เข้าไปที่ path ที่ติดตั้ง opencanry
```bash
. Opencanary_env/bin/activate
```

เริ่มทำงาน
```bash
opencanaryd --start
```
หากมีปัญหา : Pidfile
```bash
rm /home/admin/Honeypot/Opencanary_env/bin/opencanaryd.pid
```

ตรวจสอบ
```bash
netstat -tulnp | grep -E '80|443'
```
หยุดการทำ
```bash
opencanaryd --stop
```

### เข้าหน้า Web ผ่าน Browser
หา ip เครื่อง (copyไว้)
```bash
ip a
```
เข้าหน้า web ผ่าน URL
```bash
http://[ip]:80
https://[ip]:443
```
### หน้า web
<img width="1808" height="923" alt="image" src="https://github.com/user-attachments/assets/b7133f08-7a13-4d8c-acbc-893a4d871302" />
หมายเหตุ: หน้า web มาจาก

```bash
ls ~/Honeypot/Opencanary_env/lib/python3.12/site-packages/opencanary/modules/data/http/skin/
```
## FTP

### Run Honeypot
เข้าไปที่ path ที่ติดตั้ง opencanry
```bash
. Opencanary_env/bin/activate
```
เริ่มทำงาน
```bash
opencanaryd --start
```
หากมีปัญหา : Pidfile
```bash
rm /home/admin/Honeypot/Opencanary_env/bin/opencanaryd.pid
```
### ทดสอบผ่าน terminal
```bash
ftp localhost
```
