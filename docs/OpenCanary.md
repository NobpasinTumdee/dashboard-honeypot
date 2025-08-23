# ขั้นตอนการติดตั้ง OpenCanary บน Ubuntu(24.04.2)
## อัพเดท และ ติดตั้งไลบารีที่จำเป็น
```
sudo apt update
sudo apt upgrade
sudo apt-get install python3-dev python3-pip python3-virtualenv python3-venv python3-scapy libssl-dev libpcap-dev
```
## สร้าง Python Virtual Environment
```
pwd -> /home/cpe27
virtualenv env/
source env/bin/activate
```
## ติดตั้ง OpenCanary
```
pip install opencanary
```
## ติดตั้งโมดูลเสริม
ถ้าต้องการให้ OpenCanary รองรับ SMB (Windows File Share) และ SNMP
```
sudo apt install samba              # สำหรับ SMB (Windows File Share)
pip install scapy pcapy-ng          # สำหรับ SNMP
```
## สร้างไฟล์คอนฟิก 
(/etc/opencanaryd/opencanary.conf)
```
opencanaryd --copyconfig
```

## แก้ไข config
"http.enabled": true,    
"https.enabled": true,    
"ftp.enabled": true,    
```
sudo nano /etc/opencanaryd/opencanary.conf
```
# รัน OpenCanary
```
. env/bin/activate
opencanaryd --start --uid=nobody --gid=nogroup
```
## เปิดไฟล์ log
```
cd /var/tmp
nano opencanary.log
```

## ปิด Honeypot
(1)
```
opencanaryd --stop
```
(2)
```
ps aux | grep opencanaryd
sudo kill #ตามด้วย pid มักเป็นบรรทัดแรก
```



