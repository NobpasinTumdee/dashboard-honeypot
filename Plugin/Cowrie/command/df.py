# Copyright (c) 2025
# All rights reserved.

"""
Fake 'df' command output for Cowrie honeypot
"""

from __future__ import annotations
from cowrie.shell.command import HoneyPotCommand

commands = {}


class Command_df(HoneyPotCommand):
    """
    Simulate 'df -h'
    """

    def call(self) -> None:
        output = """Filesystem      Size  Used Avail Use% Mounted on
overlay          50G  1.5G   46G   4% /
tmpfs           995M     0  995M   0% /dev
tmpfs           995M     0  995M   0% /sys/fs/cgroup
/dev/sda1        50G  1.5G   46G   4% /etc/hosts
shm              64M     0   64M   0% /dev/shm
"""
        self.write(output)


commands["/bin/df"] = Command_df
commands["df"] = Command_df
