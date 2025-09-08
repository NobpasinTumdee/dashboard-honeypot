# การสร้างสภาพแวดล้อมจำลอง 
(Ubuntu 20.04.6 LTS)
### ไลบารี่ที่จำเป็น
```
sudo apt install debootstrap fakeroot
sudo apt-get install qemu-user-static binfmt-support debootstrap
sudo apt-get install acl
```
### Setup
```
sudo su - cowrie
cd cowrie/cowrie
```
```
pwd -> /home/cowrie/cowrie
rm -rf honeyfs
mkdir honeyfs
fakeroot debootstrap --variant=minbase focal honeyfs http://archive.ubuntu.com/ubuntu/
```
หรือ
```
sudo debootstrap --arch=amd64 --variant=minbase focal honeyfs http://archive.ubuntu.com/ubuntu/
sudo cp /usr/bin/qemu-x86_64-static honeyfs/usr/bin/
```
### ปรับ banner ให้สมจริง
```
sudo setfacl -m u:cpe27:rwx /home/cowrie/cowrie/honeyfs/etc/
sudo setfacl -m u:cpe27:rwx /home/cowrie/cowrie/honeyfs/etc/issue
sudo setfacl -m u:cpe27:rwx /home/cowrie/cowrie/honeyfs/etc/passwd
sudo setfacl -m u:cpe27:rwx /home/cowrie/cowrie/honeyfs/etc/shadow
```
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

### เพิ่มความแนบเนียน
- เพิ่ม user ใน directory home
- สร้าง etc พื้นฐาน
- ปรับเปลี่ยนเวลา timestamp
```
pwd -> /home/cowrie/
mkdir script
GenUsers.py
nano etcFile.py
nano NewTimeStamp.py
```
* [GenUsers.py](/Plugin/Cowrie/script/GenUsers.py)
* [NewTimeStamp.py](/Plugin/Cowrie/script/NewTimeStamp.py)
* [etcFile.py](/Plugin/Cowrie/script/etcFile.py)
```
nano run.py
```
* [run.py](/Plugin/Cowrie/script/run.py)

ติดตั้งไลบารี่ที่จำเป็น + Run script (sudo user) 
```
python3 -m venv venv
source venv/bin/activate
pip install Faker names
sudo ./venv/bin/python3 run.py
deactivate
```

### ปรับชื่อให้สอดคล้อง
```
pwd -> /home/cowrie/cowrie/etc
nano cowrie.cfg
```
svr04 -> ubuntu_svr

### สร้าง fs.pickle ใหม่
```
rm -f src/cowrie/data/fs.pickle
./bin/createfs -l honeyfs -o src/cowrie/data/fs.pickle
```

