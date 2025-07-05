# Installation Required
```bash
sudo apt update
```
```bash
sudo apt install wireshark -y
```
```bash
sudo apt install sqlite3 -y
```
```bash
sudo apt install tshark -y
```

## Wireshark basic config
```bash
sudo dpkg-reconfigure wireshark-common
```
```bash
sudo usermod -aG wireshark $USER
```
```bash
sudo chmod +x /usr/bin/dumpcap
```

## Run Wireshark
```bash
wireshark
```

# Capture Pakets(Bash Mode) from interface enp0s3
```bash
dumpcap -i enp0s3 -b duration:300 -w ~/capture.pcap
```