# Copyright (c) 2025
# All rights reserved.

"""
Fake 'top' command output for Cowrie honeypot
"""

from __future__ import annotations
from cowrie.shell.command import HoneyPotCommand

commands = {}


class Command_top(HoneyPotCommand):
    """
    Simulate 'top' output (static snapshot)
    """

    def start(self) -> None:
        output = """top - 08:01:03 up  3 min,  1 user,  load average: 0.00, 0.01, 0.05
Tasks:  85 total,   1 running,  84 sleeping,   0 stopped,   0 zombie
%Cpu(s):  1.0 us,  0.2 sy,  0.0 ni, 98.5 id,  0.3 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   1995.0 total,   1400.0 free,    250.0 used,    345.0 buff/cache
MiB Swap:   1023.0 total,   1023.0 free,      0.0 used.   1650.0 avail Mem 

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
    1 root      20   0   169084   1024      0 S   0.0  0.1   0:01.23 init
  123 root      20   0   22208   848      0 S   0.0  0.0   0:00.12 systemd-logind
  456 www-data  20   0   50208  3500      0 S   0.0  0.2   0:00.45 apache2
"""
        self.write(output)
        self.exit()


commands["/usr/bin/top"] = Command_top
commands["top"] = Command_top
