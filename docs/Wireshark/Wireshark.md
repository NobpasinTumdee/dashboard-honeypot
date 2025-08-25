# Installation Required
```bash
sudo apt update
```
```bash
sudo apt install wireshark -y
```

## Install in venv
```bash
pip install pyshark
```

## Wireshark basic config
```bash
sudo dpkg-reconfigure wireshark-common -y
```
```bash
sudo usermod -aG wireshark $USER
```