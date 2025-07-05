## Create folder for collect pcap file
```bash
mkdir -p ~/pcap_logs
```
## Create service file
```bash
sudo nano /etc/systemd/system/pcap-capture.service
```
## Service file
```
[Unit]
Description=Auto Packet Capture with dumpcap
After=network.target

[Service]
User=os
ExecStart=/usr/bin/dumpcap -i enp0s3 -b duration:86400 -w /home/os/pcap_logs/capture.pcap
Restart=always

[Install]
WantedBy=multi-user.target
```

## Systemd Run service 
```bash
sudo systemctl daemon-reexec
```
```bash
sudo systemctl enable pcap-capture.service
```
```bash
sudo systemctl start pcap-capture.service
```
## Check service status
```bash
systemctl status pcap-capture.service
```

## Check service logs
```bash
journalctl -u pcap-capture.service
```