from __future__ import annotations
from cowrie.shell.command import HoneyPotCommand
commands = {}

class Command_nano(HoneyPotCommand):
    """
    fake nano: always respond as permission denied (per request)
    """


    def start(self) -> None:
        # Present a generic permission denied message similar to bash
        self.write("bash: /usr/bin/nano: Permission denied\n")
        self.exit()


commands["nano"] = Command_nano
commands["/bin/nano"] = Command_nano
commands["/usr/bin/nano"] = Command_nano