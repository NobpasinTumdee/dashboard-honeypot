# ขั้นตอนการติดตั้ง Cowrie บน Ubuntu(24.04.2)

## Step 1: Install system dependencies
```bash
sudo apt update
```
```bash
sudo apt upgrade
```
```bash
sudo apt-get install git python3-pip python3-venv libssl-dev libffi-dev build-essential libpython3-dev python3-minimal authbind
```

## Step 2: Create a user account
```bash
sudo adduser --disabled-password cowrie
```
```bash
sudo su - cowrie
```

## Step 3: Checkout the code
```bash
git clone http://github.com/cowrie/cowrie
```
```bash
cd cowrie
```

## Step 4: Setup Virtual Environment
```bash
pwd --> /home/cowrie/cowrie
```
```bash
python3 -m venv cowrie-env
```

## Step 5: Install configuration file
```bash
source cowrie-env/bin/activate
```
```bash
python -m pip install --upgrade pip
```
```bash
python -m pip install --upgrade -r requirements.txt
```

## Step 5: Install configuration file
cowrie/etc/cowrie.cfg
[telnet]
enabled = true

## Step 6: Starting Cowrie
```bash
bin/cowrie start
```
```bash
bin/cowrie status
```
```bash
bin/cowrie stop
```

## Step 7: Listening on port 22 (OPTIONAL)
```bash
sudo iptables -t nat -A PREROUTING -p tcp --dport 22 -j REDIRECT --to-port 2222
```
```bash
sudo iptables -t nat -A PREROUTING -p tcp --dport 23 -j REDIRECT --to-port 2223
```

## ลองโจมตี
```bash
ssh -p 2222 127.0.0.1
```