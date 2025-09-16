from __future__ import annotations

import re
from typing import List

from cowrie.shell.command import HoneyPotCommand

commands = {}


class Command_grep(HoneyPotCommand):
    """
    fake grep: minimal behavior for common patterns and a few files.
    If no files provided, simulate reading from stdin by searching
    a few common fake streams (ps output, /etc/passwd, auth.log).
    """

    def start(self) -> None:
        args: List[str] = self.args or []
        if len(args) == 0:
            self.write("Usage: grep [OPTION]... PATTERN [FILE]...\n")
            self.exit()
            return

        pattern = None
        files: List[str] = []
        for a in args:
            if pattern is None and not a.startswith("-"):
                pattern = a
            else:
                if not a.startswith("-"):
                    files.append(a)

        if pattern is None:
            self.write("grep: no pattern\n")
            self.exit()
            return

        # If no files provided, mimic reading from stdin by searching some
        # simulated content (so `ps aux | grep nginx` will return matches).
        if len(files) == 0:
            # Simulated "stdin" lines: a few ps-like lines and others
            simulated = [
                "root       1023  0.0  0.1  78912  5400 ?        Ss   09:00   0:00 nginx: master process /usr/sbin/nginx",
                "www-data   2048  0.0  0.0  12345  2344 ?        S    09:01   0:00 nginx: worker process",
                "root       1000  0.0  0.1  78912  5400 ?        Ss   08:00   0:00 sshd: /usr/sbin/sshd -D",
                "ubuntu     2345  0.0  0.0  11512  2284 pts/0    S+   11:12   0:00 grep --color=auto nginx",
                # some other streams
                "root:x:0:0:root:/root:/bin/bash",
                "daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin",
                "ubuntu:x:1000:1000:Ubuntu:/home/ubuntu:/bin/bash",
                "Sep 15 10:12:01 ubuntu sshd[1023]: Accepted publickey for ubuntu from 1.2.3.4 port 54321 ssh2",
            ]
            for L in simulated:
                if re.search(pattern, L):
                    self.write(L + "\n")
            self.exit()
            return

        # common files we can fake
        for f in files:
            if f in ("/etc/os-release", "etc/os-release"):
                lines = [
                    'NAME="Ubuntu"',
                    'VERSION="20.04.6 LTS (Focal Fossa)"',
                    'ID=ubuntu',
                    'ID_LIKE=debian',
                    'PRETTY_NAME="Ubuntu 20.04.6 LTS"',
                ]
                for L in lines:
                    if re.search(pattern, L, re.IGNORECASE):
                        self.write(L + "\n")
                continue

            if f == "/var/log/auth.log":
                loglines = [
                    "Sep 15 10:12:01 ubuntu sshd[1023]: Accepted publickey for ubuntu from 1.2.3.4 port 54321 ssh2",
                    "Sep 15 10:12:01 ubuntu sshd[1023]: pam_unix(sshd:session): session opened for user ubuntu by (uid=0)",
                    "Sep 15 11:00:00 ubuntu sudo:    alice : TTY=pts/0 ; PWD=/home/alice ; USER=root ; COMMAND=/bin/ls",
                ]
                for L in loglines:
                    if re.search(pattern, L):
                        self.write(L + "\n")
                continue

            if f == "/etc/passwd":
                lines = [
                    "root:x:0:0:root:/root:/bin/bash",
                    "daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin",
                    "ubuntu:x:1000:1000:Ubuntu:/home/ubuntu:/bin/bash",
                ]
                for L in lines:
                    if re.search(pattern, L):
                        self.write(L + "\n")
                continue

            # if file unknown, mimic grep file not found
            self.write(f"grep: {f}: No such file or directory\n")

        self.exit()


commands["grep"] = Command_grep
commands["/bin/grep"] = Command_grep
commands["/usr/bin/grep"] = Command_grep
