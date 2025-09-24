# ขั้นตอนการติดตั้ง Cowrie

## Step 1: ติดตั้งเครื่องมือที่จำเป็น
```
sudo apt update
sudo apt upgrade
sudo apt-get install git python3-pip python3-venv libssl-dev libffi-dev build-essential libpython3-dev python3-minimal authbind
sudo apt install net-tools
sudo apt-get install authbind
```

## Step 2: สร้างผู้ใช้สำหรับ Cowrie
```
sudo adduser --disabled-password cowrie
sudo su - cowrie
```

## Step 3: ติดตั้ง Cowrie
```
git clone http://github.com/cowrie/cowrie
cd cowrie
```

## Step 4: Setup Virtual Environment สำหรับ Honeypot
```
pwd --> /home/cowrie/cowrie
python3 -m venv cowrie-env
source cowrie-env/bin/activate
```

## Step 5: ติดตั้ง package ที่ใช้ใน environment
```
python -m pip install --upgrade pip
python -m pip install --upgrade -r requirements.txt
```

## Step 6: Setting Cowrie
```
pwd --> /home/cowrie/cowrie/etc
cp cowrie.cfg.dist cowrie.cfg
cp userdb.example userdb.txt
```

## Step 7: เปิดใช้งาน Authbind
Authbind เป็นเครื่องมือที่ช่วยให้ user ที่ไม่ใช่ root สามารถเปิด Port ที่ต่ำกว่า 1024 ได้
```
sudo touch /etc/authbind/byport/22
sudo chown cowrie:cowrie /etc/authbind/byport/22
sudo chmod 770 /etc/authbind/byport/22
sudo touch /etc/authbind/byport/23
sudo chown cowrie:cowrie /etc/authbind/byport/23
sudo chmod 770 /etc/authbind/byport/23
```

## Step 8: เปิด Port และ Service
```
pwd --> /home/cowrie/cowrie/etc
nano cowrie.cfg
```  
  [telnet]     
  enabled = true      
  listen_endpoints = tcp:23:interface=0.0.0.0    
  [ssh]      
  enabled = true     
  listen_endpoints = tcp:22:interface=0.0.0.0      
  

## Step 9: Start Cowrie
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
```
netstat -tulpn | grep python
```
ไฟล์ถูกเก็บไว้ที่ /cowrie/var/log/cowrie


## การทดสอบ
- Telnet
```
telnet localhost 23
```
ลองพยายาม login  
(ออกจาก telnet ด้วย ctrl+] และ telnet> quit)

- SSH
```
ssh cowrie@localhost -p 22
```
ลองพยายาม login  
หมายเหตุ : username/password ที่ใช้ login ไม่ได้ สามารถดูใน etc/userdb.txt

- monitor log
```
tail -f /home/cowrie/cowrie/var/log/cowrie/cowrie.log
```


