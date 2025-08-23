## ติดตั้ง Raspberry Pi Imager
https://www.raspberrypi.com/software/

<img width="1165" height="592" alt="image" src="https://github.com/user-attachments/assets/4e8eb530-bcaa-4b16-9609-224b2cf2238f" />

## ติดตั้ง Ubuntu server (24.04.3 LTS)
<img width="690" height="489" alt="image" src="https://github.com/user-attachments/assets/9e0029a7-61f2-4177-8725-8e4b1bcb7495" />
<img width="403" height="393.5" alt="image" src="https://github.com/user-attachments/assets/388ad81c-18ec-48c8-a099-89b82b76aa14" />
<img width="366.5" height="390.5" alt="image" src="https://github.com/user-attachments/assets/0766f778-380d-4fb4-b479-e623283b344a" />

## เข้าผ่าน SSH 
ผ่าน cmd (10.35.68.99)
```
ssh <username>@<ip_address>
```

## Setup Ubuntu
```
sudo apt update
sudo apt upgrade
```
### ปรับแต่ง ssh
```
sudo nano /etc/ssh/sshd_config
```
เปลี่ยนจาก
#Port 22  -> Port 2222
```
sudo systemctl restart ssh
sudo reboot
```
เข้าใหม่ด้วย
```
ssh <username>@<ip_address> -p 2222
```

