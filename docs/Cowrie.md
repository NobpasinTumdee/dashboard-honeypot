# ขั้นตอนการติดตั้ง Cowrie บน Ubuntu(24.04.2)

## Step 1: ติดตั้ง Python และเครื่องมือที่จำเป็น
```bash
sudo apt update
sudo apt upgrade
sudo apt-get install git python3-pip python3-venv libssl-dev libffi-dev build-essential libpython3-dev python3-minimal authbind
sudo apt install net-tools
sudo apt-get install authbind
```

## Step 2: สร้างผู้ใช้สำหรับ Cowrie
```bash
sudo adduser --disabled-password cowrie
sudo su - cowrie
```

## Step 3: ติดตั้ง Cowrie
```bash
git clone http://github.com/cowrie/cowrie
cd cowrie
```

## Step 4: Setup Virtual Environment สำหรับ Honeypot
ตรวจสอบให้แน่ใจว่า path ที่อยู่ถูกต้อง ../cowrie/cowrie
```bash
pwd --> /home/cowrie/cowrie
```
```bash
python3 -m venv cowrie-env
source cowrie-env/bin/activate
```

## Step 5: ติดตั้ง package ที่ใช้ใน environment
```
python -m pip install --upgrade pip
python -m pip install --upgrade -r requirements.txt
```
```
pwd --> /home/cowrie/cowrie/etc
cp cowrie.cfg.dist cowrie.cfg
cp userdb.example userdb.txt
```
## Step 6: เปิดการใช้งาน Cowrie
ตรวจสอบให้แน่ใจว่า Services ที่ต้องการดักจับนั้นเปิดอยู่ cowrie/etc/cowrie.cfg  
  [telnet] enabled = true    
  [ssh] enabled = true    
  (เปลี่ยน port ของทั้งคู่ 22->2222 , 23->2223)

## Step 7: Starting Cowrie
```bash
bin/cowrie start
```
```bash
bin/cowrie status
```
```bash
bin/cowrie stop
```
ตรวจสอบ service ที่เปิด
```bash
netstat -tulpn | grep python
```
ไฟล์ถูกเก็บไว้ที่ /cowrie/var/log/cowrie

# เพิ่มเติม
## การทดสอบ
- Telnet
```bash
telnet localhost 2223
```
ลองพยายาม login  
(ออกจาก telnet ด้วย ctrl+] และ telnet> quit)

- SSH
```bash
ssh cowrie@localhost -p 2222
```
ลองพยายาม login  
หมายเหตุ : username/password ที่ใช้ login ไม่ได้ สามารถดูใน etc/userdb.example

## เปิดใช้งาน Authbind 
Authbind เป็นเครื่องมือที่ช่วยให้ user ที่ไม่ใช่ root สามารถเปิด Port ที่ต่ำกว่า 1024 ได้
สร้างไฟล์ 22 สำหรับผู้ใช้ cowrie และกลุ่ม cowrie เป็นเจ้าของ
```bash
sudo apt-get install authbind
sudo touch /etc/authbind/byport/22
sudo chown cowrie:cowrie /etc/authbind/byport/22
sudo chmod 770 /etc/authbind/byport/22
```
- เปิดใช้งาน Authbind ของ Cowrie ผ่านการเข้าถึง bin/cowrie  
AUTHBIND_ENABLED = True  
หมายเหตุ : เวอร์ชันใหม่ๆ จะมีการตรวจสอบ directory /etc/authbind/byport/ ว่ามีไฟล์ตามชื่อ port ที่ต้องการเปิดไหม
หากมี จะเปิด AUTHBIND เอง  
  
- เปิด Port 22 สำหรับดักจับผ่านการแก้ไขไฟล์ cowrie.cfg  
[ssh]  
listen_endpoints = tcp:22:interface=0.0.0.0  
ทำแบบเดียวกับ Service หรือ Port อื่นๆ ที่ต้องการเช่น Port 23


## Listening on port 22 (OPTIONAL)
```bash
sudo iptables -t nat -A PREROUTING -p tcp --dport 22 -j REDIRECT --to-port 2222
```
```bash
sudo iptables -t nat -A PREROUTING -p tcp --dport 23 -j REDIRECT --to-port 2223
```

