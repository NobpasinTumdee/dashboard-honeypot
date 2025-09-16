from __future__ import annotations
from typing import List
from cowrie.shell.command import HoneyPotCommand

commands = {}

class Command_ip(HoneyPotCommand):
    """
    fake ip command (support short 'a' alias and addr/route/link)
    """

    def start(self) -> None:
        args: List[str] = self.args or []
        if len(args) == 0:
            # mimic ip help short
            self.write(
                "Usage: ip [ OPTIONS ] OBJECT { COMMAND | help }\n"
                "       ip [ -force ] -batch filename\n"
            )
            self.exit()
            return

        # handle short alias 'a' as 'addr'
        if args[0] == "a":
            args[0] = "addr"

        # join args again
        cmd = " ".join(args)

        # addr / addr show / addr list
        if args[0] == "addr":
            self.write(
                "1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default\n"
                "    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n"
                "    inet 127.0.0.1/8 scope host lo\n"
                "       valid_lft forever preferred_lft forever\n"
                "2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000\n"
                "    link/ether aa:bb:cc:dd:ee:ff brd ff:ff:ff:ff:ff:ff\n"
                "    inet 192.168.1.10/24 brd 192.168.1.255 scope global dynamic eth0\n"
                "       valid_lft 86398sec preferred_lft 86398sec\n"
            )
            self.exit()
            return

        if args[0] == "route":
            self.write(
                "default via 192.168.1.1 dev eth0 proto dhcp metric 100\n"
                "192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.10\n"
            )
            self.exit()
            return

        if args[0] == "link":
            self.write(
                "1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000\n"
                "    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n"
            )
            self.exit()
            return

        # default fallback
        self.write(f"ip: unknown command \"{args[0]}\"\n")
        self.exit()

commands["ip"] = Command_ip
commands["/sbin/ip"] = Command_ip
commands["/usr/sbin/ip"] = Command_ip
commands["/bin/ip"] = Command_ip
commands["/usr/bin/ip"] = Command_ip
