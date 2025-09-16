from __future__ import annotations
from typing import List
from cowrie.shell.command import HoneyPotCommand
commands = {}

class Command_ss(HoneyPotCommand):
    """
    fake ss command: show listening sockets
    """
    
    def start(self) -> None:
        args: List[str] = self.args or []
        flags = " ".join(args)
        
        if "-tulpn" in flags or "-ltnp" in flags or "-tulnp" in flags or "-tulp" in flags:
            self.write(
                "Netid State Recv-Q Send-Q Local Address:Port Peer Address:Port\n"
                "tcp LISTEN 0 128 0.0.0.0:22 0.0.0.0:* users:((\"sshd\",pid=1023,fd=3))\n"
                "tcp LISTEN 0 128 127.0.0.53%lo:53 0.0.0.0:* users:((\"systemd-resolve\",pid=670,fd=13))\n"
                "tcp LISTEN 0 128 127.0.0.1:3306 0.0.0.0:* users:((\"mysqld\",pid=2234,fd=10))\n"
                "udp UNCONN 0 0 0.0.0.0:68 0.0.0.0:* users:((\"dhclient\",pid=811,fd=6))\n"
            )
            self.exit()
            return
    
        if len(args) == 0 or "-a" in flags:
            self.write(
                "Netid State Recv-Q Send-Q Local Address:Port Peer Address:Port\n"
                "tcp ESTAB 0 0 192.168.1.10:22 192.168.1.100:53422\n"
            )
            self.exit()
            return
        
        self.write("ss: unrecognized arguments\n")
        self.exit()
        
commands["ss"] = Command_ss
commands["/bin/ss"] = Command_ss
commands["/usr/bin/ss"] = Command_ss
commands["/sbin/ss"] = Command_ss
commands["/usr/sbin/ss"] = Command_ss    