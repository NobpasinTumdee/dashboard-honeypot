# Scan demo
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

# Brute force demo

```bash
sudo apt install hydra
```
```bash
hydra -l [username] -P /path/to/passwords.txt ssh://[ip address]
```