# สร้างไฟล์ shell code
```bash
nano /home/cpe27/dashboard-honeypot/server/plugin/wireshark/start_all.sh
```

- ใส่โค้ดด้านล่าง
```bash
#!/bin/bash
# Activate venv
source /home/cpe27/env/bin/activate

# Run scripts inside venv
python /home/cpe27/dashboard-honeypot/server/plugin/wireshark/https.py &
python /home/cpe27/dashboard-honeypot/server/plugin/wireshark/stats.py &
python /home/cpe27/dashboard-honeypot/server/plugin/wireshark/scan.py &

# Wait for background jobs
wait
```

- ให้สิทธิ์ script
```bash
chmod +x /home/cpe27/dashboard-honeypot/server/plugin/wireshark/start_all.sh
```

# สร้าง service file
```bash
sudo nano /etc/systemd/system/wireshark-plugins.service
```

- ใส่โค้ดด้านล่าง
```bash
[Unit]
Description=Wireshark Honeypot Plugins
After=network.target

[Service]
Type=simple
User=cpe27
WorkingDirectory=/home/cpe27/dashboard-honeypot/server/plugin/wireshark
ExecStart=/home/cpe27/dashboard-honeypot/server/plugin/wireshark/start_all.sh
Restart=always

[Install]
WantedBy=multi-user.target
```

# รัน systemctl

```bash
sudo systemctl daemon-reload
```
```bash
sudo systemctl enable wireshark-plugins.service
```
```bash
sudo systemctl start wireshark-plugins.service
```

- check log
```bash
journalctl -u wireshark-plugins.service -f
```
- check status
```bash
systemctl status wireshark-plugins.service
```

## http folder sharing
- สร้าง service file
```bash
sudo nano /etc/systemd/system/adapt_http_server.service
```

- nano /etc/systemd/system/adapt_http_server.service
```bash
[Unit]
Description=HTTP Server(file sharing)
After=network.target

[Service]
Type=simple
User=cpe27
WorkingDirectory=/home/cpe27/dashboard-honeypot/server/plugin/wireshark
ExecStart=/home/cpe27/env/bin/python /home/cpe27/dashboard-honeypot/server/plugin/wireshark/http_server.py
Restart=always

[Install]
WantedBy=multi-user.target
```

- สร้าง timer
```bash
sudo nano /etc/systemd/system/adapt_http_server.timer
```

- /etc/systemd/system/adapt_http_server.timer
```bash
[Unit]
Description=Restart HTTP Honeypot Server daily

[Timer]
OnBootSec=5min
OnUnitActiveSec=1d
Persistent=true

[Install]
WantedBy=timers.target
```

- reload and enable
```bash
sudo systemctl daemon-reload
```
```bash
sudo systemctl enable adapt_http_server.service
```
```bash
sudo systemctl enable adapt_http_server.timer
```

- start
```bash
sudo systemctl start adapt_http_server.service
```
```bash
sudo systemctl start adapt_http_server.timer
```

-  check
```bash
systemctl status adapt_http_server.service
```
```bash
systemctl status adapt_http_server.timer
```