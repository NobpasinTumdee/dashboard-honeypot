 # การตั้งค่าเริ่มต้น
ก่อนอื่นต้องสร้างไฟล์ service สำหรับแต่ละโปรแกรมก่อน โดยไฟล์เหล่านี้จะเก็บอยู่ใน `etc/systemd/system/` และลงท้ายด้วย `.service`


## 1. ไฟล์ service สำหรับ Cowrie
สร้างไฟล์ชื่อ `cowrie.service` ด้วยคำสั่ง
```bash
sudo nano /etc/systemd/system/cowrie.service
```
แล้วใส่เนื้อหาต่อไปนี้:

```bash
[Unit]
Description=Cowrie SSH/Telnet Honeypot
After=network.target

[Service]
User=cpe27
Group=cpe27
WorkingDirectory=/home/cowrie/cowrie
ExecStart=/home/cowrie/cowrie/bin/cowrie start -n
ExecStop=/home/cowrie/cowrie/bin/cowrie stop
ExecStartPre=-/home/cowrie/cowrie/bin/cowrie stop
Restart=always

[Install]
WantedBy=multi-user.target

```
>  -n (หรือ --nodaemon) = ให้ cowrie รัน foreground ไม่ fork

>  systemd จะ track process ได้ถูกต้อง
    
>   **WorkingDirectory** คือที่อยู่ของโปรเจกต์
    
>   **User** คือ user ที่จะใช้รัน service


## เปิดใช้งาน service

หลังจากสร้างไฟล์ service ทั้งหมดแล้ว ให้ใช้คำสั่งเหล่านี้เพื่อเปิดใช้งานและให้ service เริ่มต้นทำงานพร้อมกับการบูทเครื่อง:

1.  **อัปเดต systemd daemon**: 
    ```bash
    sudo systemctl daemon-reload
    ```
2.  **เปิดใช้งาน (enable) แต่ละ service**:
	```bash
	sudo systemctl enable cowrie.service
	```
4.  **เริ่มทำงาน (start) แต่ละ service ทันที**:
    ```bash
	sudo systemctl start cowrie.service
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
