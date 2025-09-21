# Copyright (c) 2025
# All rights reserved.

"""
Fake 'systemctl' command output for Cowrie honeypot
"""

from __future__ import annotations
from cowrie.shell.command import HoneyPotCommand

commands = {}


class Command_systemctl(HoneyPotCommand):
    """
    Simulate 'systemctl status'
    """

    def call(self) -> None:
        if not self.args:
            self.general_status()
        elif self.args[0] == "status":
            if len(self.args) > 1:
                self.service_status(self.args[1])
            else:
                self.general_status()
        else:
            self.general_status()

    def general_status(self) -> None:
        output = """systemd 245 (245.4-4ubuntu3.21) running in system mode.
   Loaded: loaded (/lib/systemd/systemd; enabled; vendor preset: enabled)
   Active: active (running) since Mon 2025-09-08 07:57:00 UTC; 3min ago
"""
        self.write(output)

    def service_status(self, service: str) -> None:
        mock_services = {
            "ssh": """● ssh.service - OpenBSD Secure Shell server
     Loaded: loaded (/lib/systemd/system/ssh.service; enabled)
     Active: active (running) since Mon 2025-09-08 07:57:02 UTC; 3min ago
   Main PID: 789 (sshd)
      Tasks: 1 (limit: 4700)
""",
            "apache2": """● apache2.service - The Apache HTTP Server
     Loaded: loaded (/lib/systemd/system/apache2.service; enabled)
     Active: active (running) since Mon 2025-09-08 07:57:03 UTC; 3min ago
   Main PID: 890 (apache2)
      Tasks: 6 (limit: 4700)
"""
        }
        output = mock_services.get(service, f"Unit {service}.service could not be found.\n")
        self.write(output)


commands["/bin/systemctl"] = Command_systemctl
commands["systemctl"] = Command_systemctl
