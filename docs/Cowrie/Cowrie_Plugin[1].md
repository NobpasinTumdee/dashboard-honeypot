# ปรับปรุงการ Login
### ฟังก์ชัน
- user ใหม่ต้อง login ในจำนวนครั้งที่สุ่ม
- user ใหม่หากใช้ password ใดก็ได้ทีมี่ใน users.txt จะผ่านได้เลย
- user ที่เคยมีชื่อใน users.txt ต้องใช้ password เดิมถึง login ผ่าน
- user ที่เคยมีชื่อใน users.txt หากใช้ password ไม่ตรงจะไม่มีทางผ่าน
- การหน่วงเวลาในการ login (ตอนแสดง Prompt)
- เพิ่มการบันทึก custom log

### Telnet
แก้ไขไฟล์
```
sudo su - cowrie
cd cowrie/src/cowrie/telnet/
nano userauth.py
```
* [userauth.py](/Plugin/Cowrie/telnet/userauth.py)

### SSH
แก้ไขไฟล์
```
sudo su - cowrie
cd cowrie/src/cowrie/ssh/
nano userauth.py
```
* [userauth.py](/Plugin/Cowrie/ssh/userauth.py)

ปรับปรุงการแสดงผลให้ตรงกับเงื่อนไขใหม่
```
cd /home/cowrie/cowrie/src/cowrie/core/
```
* [checkers.py](/Plugin/Cowrie/ssh/checkers.py)

## ผู้เขียนคู่มือ นาย รามณรงค์ พันธเดช