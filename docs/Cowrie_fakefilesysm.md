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
### สร้าง fs.pickle ใหม่
```
rm -f src/cowrie/data/fs.pickle
./bin/createfs -l honeyfs -o src/cowrie/data/fs.pickle
```
### ผลลัพธ์
<img width="1174" height="827" alt="image" src="https://github.com/user-attachments/assets/88c8e192-2dda-4906-ae61-89f149adf59d" />
