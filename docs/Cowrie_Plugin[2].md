# การสร้างสภาพแวดล้อมจำลอง 
(Ubuntu 20.04.6 LTS)
### ไลบารี่ที่จำเป็น
```
sudo apt install debootstrap fakeroot
```
### Setup
```
sudo su - cowrie
cd cowrie/cowrie
```
```
rm -rf honeyfs
mkdir honeyfs
```
```
fakeroot debootstrap --variant=minbase focal honeyfs http://archive.ubuntu.com/ubuntu/
```

### ปรับ banner ให้สมจริง
แก้ข้อความก่อน login (/etc/issue) และข้อความหลัง login (/etc/motd)
```
echo "Ubuntu 20.04.6 LTS" > honeyfs/etc/issue
echo "" > honeyfs/etc/motd
```

### ปรับไม่ให้ Cowrieใช้ /etc/passwd 
```
echo "root:x:0:0:root:/root:/bin/bash" > honeyfs/etc/passwd
echo "root:*:19000:0:99999:7:::" > honeyfs/etc/shadow
```

### สร้าง users ให้ระบบหลอก
เข้ามาที่ path >> /home/cowrie
```
nano GenUser.py
```
* [GenUser.py](/Plugin/Cowrie/script/GenUsers.py)

ติดตั้งไลบารี่ที่จำเป็น + Run script (sudo user) 
```
python3 -m venv venv
source venv/bin/activate
pip install Faker names
sudo ./venv/bin/python3 GenUsers.py
deactivate
```
<img width="1043" height="634" alt="image" src="https://github.com/user-attachments/assets/9c762698-332e-4ae3-b6fe-6685e009ef69" />

### ปรับเวลา Timestamp
เข้ามาที่ path >> /home/cowrie
```
nano NewTimeStamp.py
```
* [NewTimeStamp.py](/Plugin/Cowrie/script/NewTimeStamp.py)
```
sudo NewTimeStamp.py
```
<img width="1040" height="640" alt="image" src="https://github.com/user-attachments/assets/8fc08c8d-708e-4a34-8db7-416173cc0426" />

### สร้าง fs.pickle ใหม่
```
rm -f src/cowrie/data/fs.pickle
./bin/createfs -l honeyfs -o src/cowrie/data/fs.pickle
```
### ผลลัพธ์
<img width="1047" height="756" alt="image" src="https://github.com/user-attachments/assets/cdadff52-3bd2-4378-85f2-3fbcb1ce4c09" />

### ปรับชื่อให้สอดคล้อง
```
pwd -> /home/cowrie/cowrie/etc
nano cowrie.cfg
```
svr04 -> ubuntu_svr

### เพิ่ม /etc
```
pwd -> /home/cowri
nano etcFile.py
sudo ./venv/bin/python3 GenUsers.py
```
* [etcFile.py](/Plugin/Cowrie/script/etcFile.py)


