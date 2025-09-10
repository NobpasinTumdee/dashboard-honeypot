 # การตั้งค่าเริ่มต้น
ก่อนอื่นต้องสร้างไฟล์ service สำหรับแต่ละโปรแกรมก่อน โดยไฟล์เหล่านี้จะเก็บอยู่ใน `etc/systemd/system/` และลงท้ายด้วย `.service`

## 1. ไฟล์ service สำหรับ Node.js
สร้างไฟล์ชื่อ `backend.service` ด้วยคำสั่ง
```bash
sudo nano /etc/systemd/system/backend.service
```
แล้วใส่เนื้อหาต่อไปนี้:

```bash
[Unit]
Description=My Node.js Backend Server
After=network.target

[Service]
ExecStart=/usr/bin/node /home/[user name]/dashboard-honeypot/server/API/socket/server.js
WorkingDirectory=/home/[user name]/dashboard-honeypot/server/API/socket/
Restart=always
User=YourUser

[Install]
WantedBy=multi-user.target
```
>  **ExecStart** คือคำสั่งที่ใช้รันโปรแกรม. **ตรวจสอบให้แน่ใจว่า path ของ `node` ถูกต้อง โดยใช้คำสั่ง `which node`**
    
>   **WorkingDirectory** คือที่อยู่ของโปรเจกต์
    
>   **User** คือ user ที่จะใช้รัน service

## 2. ไฟล์ service สำหรับ Python
สร้างไฟล์ชื่อ `python_script.service` ด้วยคำสั่ง
```bash
sudo nano /etc/systemd/system/python_script.service
```
แล้วใส่เนื้อหาต่อไปนี้:
```bash
[Unit]
Description=Python Script to Convert Data
After=backend.service

[Service]
ExecStart=/usr/bin/python3 /home/[user name]/dashboard-honeypot/server/plugin/convertData/Honeypot_Log_Processor.py
WorkingDirectory=/home/[user name]/dashboard-honeypot/server/plugin/convertData/
Restart=always
User=YourUser

[Install]
WantedBy=multi-user.target
```
>  **ExecStart** คือคำสั่งที่ใช้รัน Python. **ตรวจสอบให้แน่ใจว่า path ของ `python3` ถูกต้อง โดยใช้คำสั่ง `which python3`**
    
>  **After=backend.service** คือการระบุว่า service นี้จะเริ่มรันหลังจาก `backend.service` เริ่มทำงานแล้ว

### 3. ไฟล์ service สำหรับ Ngrok

Ngrok มีวิธีการตั้งค่าที่แตกต่างกันเล็กน้อย เพราะต้องการใช้ token ด้วย สามารถตั้งค่าให้ Ngrok เชื่อมต่ออัตโนมัติได้โดยใช้ **systemd** เช่นกัน สร้างไฟล์ชื่อ `ngrok.service` ด้วยคำสั่ง 
```bash
sudo nano /etc/systemd/system/ngrok.service
```
แล้วใส่เนื้อหาต่อไปนี้:
```
[Unit]
Description=Ngrok Tunnel
After=network.target

[Service]
ExecStart=/snap/bin/ngrok http 3000 --config /home/[user name]/snap/ngrok/[your number]/.config/ngrok/ngrok.yml
Restart=always
User=YourUser

[Install]
WantedBy=multi-user.target
```
> **xecStart** คือคำสั่งที่ใช้รัน Ngrok. **ตรวจสอบให้แน่ใจว่า path ของ `ngrok` ถูกต้อง**


## เปิดใช้งาน service

หลังจากสร้างไฟล์ service ทั้งหมดแล้ว ให้ใช้คำสั่งเหล่านี้เพื่อเปิดใช้งานและให้ service เริ่มต้นทำงานพร้อมกับการบูทเครื่อง:

1.  **อัปเดต systemd daemon**: 
    ```bash
    sudo systemctl daemon-reload
    ```
2.  **เปิดใช้งาน (enable) แต่ละ service**:
	```bash
	sudo systemctl enable backend.service
	```
	```bash
	sudo systemctl enable python_script.service
	```
	```bash
	sudo systemctl enable ngrok.service
	```
4.  **เริ่มทำงาน (start) แต่ละ service ทันที**:
    ```bash
	sudo systemctl start backend.service
	```
	```bash
	sudo systemctl start python_script.service
	```
	```bash
	sudo systemctl start ngrok.service
	```

## คำสั่งสำหรับจัดการ service
-   ดูสถานะของ service:
```
sudo systemctl status <ชื่อ service>
```
-   หยุด service: 
```
sudo systemctl stop <ชื่อ service>
```
    
-   เริ่มใหม่:
```
sudo systemctl restart <ชื่อ service>
```
    
-   ปิดไม่ให้เริ่มอัตโนมัติ: 
```
sudo systemctl disable <ชื่อ service>
```