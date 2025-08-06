# ทดสอบ Http/Https

## แก้ไขไฟล์
บน path sudo nano /etc/opencanaryd/opencanary.conf
```bash
"http.enabled": true,
"http.port": 8080,
"http.skin": "nasLogin",
```
```bash
"https.enabled": true,
"https.port": 443,
"https.skin": "nasLogin",
```

## Run Honeypot
เข้าไปที่ path ที่ติดตั้ง opencanry
```bash
. Opencanary_env/bin/activate
```

เริ่มทำงาน
```bash
opencanaryd --start --uid=nobody --gid=nogroup
```

ตรวจสอบ
```bash
netstat -tulnp | grep -E '8080|443'
```
หยุดการทำ
```bash
opencanaryd --stop
```

## ตรวจสอบ ip ที่ vm ได้รับมา
```bash
ip a
```

## เปิด Browser 
เปิดผ่าน PC หรือ VM ที่อยู่บน LAN เดียวกันกับ Honeypot
```bash
http://[ip]:8080/index.html
https://[ip]:8080/index.html
```
ผลลัพธ์
<img width="1808" height="923" alt="image" src="https://github.com/user-attachments/assets/b7133f08-7a13-4d8c-acbc-893a4d871302" />
หมายเหตุ: หน้า web มาจาก 
```bash
ls ~/Honeypot/Opencanary_env/lib/python3.12/site-packages/opencanary/modules/data/http/skin/
```
# ทดสอบ ftp

## Run Honeypot
เข้าไปที่ path ที่ติดตั้ง opencanry
```bash
. Opencanary_env/bin/activate
```
เริ่มทำงาน
```bash
opencanaryd --start --uid=nobody --gid=nogroup
```
ตรวจสอบ
```bash
netstat -tulnp | grep -E '8080|443'
```
หยุดการทำ
```bash
opencanaryd --stop
```

เปิด terminal
```bash
ftp localhost
```
