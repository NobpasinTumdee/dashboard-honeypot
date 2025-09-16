import subprocess
import sys
import random
from datetime import datetime, timedelta


start_date = datetime(2023, 1, 1, 0, 0, 0)
end_date   = datetime(2024, 12, 31, 23, 59, 59)

rand_seconds = random.randint(0, int((end_date - start_date).total_seconds()))
rand_time = start_date + timedelta(seconds=rand_seconds)
timestamp = rand_time.strftime("%Y%m%d%H%M")


commands = [
    "sudo rm -rf /home/cowrie/cowrie/honeyfs",
    "sudo mkdir /home/cowrie/cowrie/honeyfs",
    "sudo chown cowrie:cowrie /home/cowrie/cowrie/honeyfs",
    "sudo debootstrap --arch=amd64 --variant=minbase focal /home/cowrie/cowrie/honeyfs http://archive.ubuntu.com/ubuntu/",
    "sudo cp /usr/bin/qemu-x86_64-static /home/cowrie/cowrie/honeyfs/usr/bin/",
    "sudo setfacl -R -m u:admin:rwx /home/cowrie/cowrie/honeyfs/",
    "sudo setfacl -R -d -m u:admin:rwx /home/cowrie/cowrie/honeyfs/",
    "bash -c \"echo 'Ubuntu 20.04.6 LTS' | sudo tee /home/cowrie/cowrie/honeyfs/etc/issue\"",
    "bash -c \"echo '' | sudo tee /home/cowrie/cowrie/honeyfs/etc/motd\"",
    "bash -c \"echo 'root:x:0:0:root:/root:/bin/bash' | sudo tee /home/cowrie/cowrie/honeyfs/etc/passwd\"",
    "bash -c \"echo 'root:*:19000:0:99999:7:::' | sudo tee /home/cowrie/cowrie/honeyfs/etc/shadow\"",
    f"sudo find /home/cowrie/cowrie/honeyfs -exec touch -t {timestamp} {{}} +"
    
]

for cmd in commands:
    print(f"Running: {cmd}")
    result = subprocess.run(cmd, shell=True)
    if result.returncode != 0:
        print(f"Command failed: {cmd}")
        sys.exit(1)

print("All commands completed successfully")
