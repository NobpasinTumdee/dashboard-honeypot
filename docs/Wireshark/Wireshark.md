# Installation Required
```bash
sudo apt update
```
```bash
sudo apt install tshark -y
```

## Install in venv
```bash
pip install pyshark
```

## Optional
- รัน script python ที่ใช้ pyshark -> tshark แบบไม่ต้องใช้ sudo
```bash
sudo setcap 'CAP_NET_RAW+eip CAP_NET_ADMIN+eip' /usr/bin/tshark
```
- เช็คว่าทำงานถูกต้อง ถ้าถูกจะขึ้นประมาณ: usr/bin/tshark = cap_net_admin,cap_net_raw+eip
```bash
getcap /usr/bin/tshark
```

- wireshark GUI (เนื่องจากใช้ Ubuntu server เลยไม่ได้ใช้แล้ว)
```bash
sudo apt install wireshark -y
```
```bash
sudo dpkg-reconfigure wireshark-common
```
```bash
sudo usermod -aG wireshark $USER
```