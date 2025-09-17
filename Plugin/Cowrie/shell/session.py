# /home/cowrie/cowrie/src/cowrie/ssh/session.py
# Copyright (c) 2009-2014 Upi Tamminen <desaster@gmail.com>
# See the COPYRIGHT file for more information

"""
This module contains ...
"""

from __future__ import annotations

from typing import Literal

from twisted.conch.ssh import session
from twisted.conch.ssh.common import getNS
from twisted.python import log

# เพิ่ม import
import os
import random
from datetime import datetime, timedelta
from cowrie.shell import pwd
from cowrie.shell import fs



class HoneyPotSSHSession(session.SSHSession):
    """
    This is an SSH channel that's used for SSH sessions
    """

    
    def __init__(self, *args, username=None, uid=1001, gid=1001, **kw):
        session.SSHSession.__init__(self, *args, **kw)
        if username:
            self.username = username
            self.uid = uid
            self.gid = gid
            self.home = f"/home/{username}"
            self.update_etc_passwd()

    
    

    def update_etc_passwd(self):
        """Adds or updates the user and group entries in honeyfs/etc"""
        etc_dir = "/home/cowrie/cowrie/honeyfs/etc"
        passwd_path = os.path.join(etc_dir, "passwd")
        group_path = os.path.join(etc_dir, "group")

        new_passwd_line = f"{self.username}:x:{self.uid}:{self.gid}:{self.username}:/home/{self.username}:/bin/bash\n"
        new_group_line = f"{self.username}:x:{self.gid}:\n"

        # --- Update passwd ---
        try:
            lines = []
            if os.path.exists(passwd_path):
                with open(passwd_path, "r") as f:
                    lines = f.readlines()

            updated = False
            new_lines = []
            for line in lines:
                parts = line.strip().split(":")
                if len(parts) > 2 and parts[2].isdigit() and int(parts[2]) == self.uid:
                    new_lines.append(new_passwd_line)
                    updated = True
                else:
                    new_lines.append(line)
            if not updated:
                new_lines.append(new_passwd_line)

            with open(passwd_path, "w") as f:
                f.writelines(new_lines)

            log.msg(f"[SSH] Updated {passwd_path} for uid={self.uid} ({self.username})")
        except Exception as e:
            log.msg(f"[SSH] Error updating passwd: {e}")

        # --- Update group ---
        try:
            lines = []
            if os.path.exists(group_path):
                with open(group_path, "r") as f:
                    lines = f.readlines()

            updated = False
            new_lines = []
            for line in lines:
                parts = line.strip().split(":")
                if len(parts) > 2 and parts[2].isdigit() and int(parts[2]) == self.gid:
                    new_lines.append(new_group_line)
                    updated = True
                else:
                    new_lines.append(line)
            if not updated:
                new_lines.append(new_group_line)

            with open(group_path, "w") as f:
                f.writelines(new_lines)

            log.msg(f"[SSH] Updated {group_path} for gid={self.gid} ({self.username})")
        except Exception as e:
            log.msg(f"[SSH] Error updating group: {e}")



    # def __init__(self, *args, **kw):
    #     session.SSHSession.__init__(self, *args, **kw)

    

    def request_env(self, data: bytes) -> Literal[0, 1]:
        name, rest = getNS(data)
        value, rest = getNS(rest)

        if rest:
            log.msg(f"Extra data in request_env: {rest!r}")
            return 1

        log.msg(
            eventid="cowrie.client.var",
            format="request_env: %(name)s=%(value)s",
            name=name.decode("utf-8"),
            value=value.decode("utf-8"),
        )
        # FIXME: This only works for shell, not for exec command
        if self.session:
            self.session.environ[name.decode("utf-8")] = value.decode("utf-8")
        return 0

    def request_agent(self, data: bytes) -> int:
        log.msg(f"request_agent: {data!r}")
        return 0

    def request_x11_req(self, data: bytes) -> int:
        log.msg(f"request_x11: {data!r}")
        return 0

    def closed(self) -> None:
        """
        This is reliably called on session close/disconnect and calls the avatar
        """
        session.SSHSession.closed(self)
        self.client = None

    def eofReceived(self) -> None:
        """
        Redirect EOF to emulated shell. If shell is gone, then disconnect
        """
        if self.session:
            self.session.eofReceived()
        else:
            self.loseConnection()

    def sendEOF(self) -> None:
        """
        Utility function to request to send EOF for this session
        """
        self.conn.sendEOF(self)

    def sendClose(self) -> None:
        """
        Utility function to request to send close for this session
        """
        self.conn.sendClose(self)

    def channelClosed(self) -> None:
        log.msg("Called channelClosed in SSHSession")
