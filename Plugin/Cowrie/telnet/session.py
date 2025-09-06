# Copyright (C) 2015, 2016 GoSecure Inc.
"""
Telnet User Session management for the Honeypot

@author: Olivier Bilodeau <obilodeau@gosecure.ca>
"""

from __future__ import annotations

import traceback

from zope.interface import implementer

from twisted.conch.ssh import session
from twisted.conch.telnet import ECHO, SGA, TelnetBootstrapProtocol
from twisted.internet import interfaces, protocol
from twisted.internet.protocol import connectionDone
from twisted.python import failure, log

from cowrie.insults import insults
from cowrie.shell import protocol as cproto
from cowrie.shell import pwd

from cowrie.shell import fs
from twisted.python import log

# create_login_user
import os
import shutil
import pickle
import random
from datetime import datetime, timedelta
from twisted.python import log
from cowrie.core.config import CowrieConfig
from cowrie.shell.fs import HoneyPotFilesystem

from cowrie.shell.fs import (
    A_NAME,
    A_TYPE,
    A_UID,
    A_GID,
    A_SIZE,
    A_MODE,
    A_CTIME,
    A_CONTENTS,
    A_TARGET,
    A_REALFILE,
)

class HoneyPotTelnetSession(TelnetBootstrapProtocol):
    id = 0  # telnet can only have 1 simultaneous session, unlike SSH


    def create_login_user(self, username):
        """
        Dynamically adds a new user's home directory and /etc/passwd entry.
        """
        # ถอดรหัส username จาก bytes เป็น string
        if isinstance(username, bytes):
            username = username.decode('utf-8')
        
        if isinstance(self.username, bytes):
            username = self.username.decode('utf-8')
        else:
            username = self.username

        home_dir_path = self.home
        
        # ใช้เมธอด exists() เพื่อตรวจสอบ Home Directory
        if self.server.fs.exists(home_dir_path):
            log.msg(f"Directory '{home_dir_path}' already exists. No action needed.")
            # เพิ่มโค้ดที่นี่เพื่อแก้ไข etc/passwd สำหรับผู้ใช้เก่า
            
            self.update_etc_passwd(username)

            start_date = datetime(2023, 1, 1, 0, 0, 0)
            end_date = datetime(2024, 12, 31, 23, 59, 59)
            time_between_dates = end_date - start_date
            total_seconds = time_between_dates.total_seconds()
            random_seconds = random.randrange(int(total_seconds))
            random_date = start_date + timedelta(seconds=random_seconds)
            random_time = random_date.timestamp()
            
            # แก้ไข: ใช้ chown และ update_mtime/atime
            self.server.fs.chown(home_dir_path, uid=1001, gid=1001)
            self.server.fs.utime(home_dir_path, random_time, random_time)


        
            log.msg(f"Updated timestamp for '{home_dir_path}' to a random time.")

            return

        # ใช้เมธอด mkdir() ของ HoneyPotFilesystem เพื่อสร้าง directory
        try:
            self.server.fs.mkdir(
                home_dir_path,
                uid=1001,
                gid=1001,
                size=4096,
                mode=16877
            )
            log.msg(f"Successfully created new directory '{home_dir_path}'.")
            
            
            self.update_etc_passwd(username)
            
            start_date = datetime(2023, 1, 1, 0, 0, 0)
            end_date = datetime(2024, 12, 31, 23, 59, 59)
            time_between_dates = end_date - start_date
            total_seconds = time_between_dates.total_seconds()
            random_seconds = random.randrange(int(total_seconds))
            random_date = start_date + timedelta(seconds=random_seconds)
            random_time = random_date.timestamp()
            
            # แก้ไข: ใช้ chown และ update_mtime/atime
            self.server.fs.chown(home_dir_path, uid=1001, gid=1001)
            self.server.fs.utime(home_dir_path, random_time, random_time)


            
            log.msg(f"Updated timestamp for '{home_dir_path}' to a random time.")
            
        except Exception as e:
            log.msg(f"Error creating directory for user: {e}")

    def update_etc_passwd(self, username):
        """
        Adds or updates a user and group entry in the /etc/passwd and /etc/group files.
        """
        user_id = 1001
        etc_dir = "/home/cowrie/cowrie/honeyfs/etc"

        # Update /etc/passwd file
        try:
            passwd_path = os.path.join(etc_dir, "passwd")
            
            # Read all lines from the file
            lines = []
            if os.path.exists(passwd_path):
                with open(passwd_path, "r") as f:
                    lines = f.readlines()
            
            # Remove any line that contains the user_id (1001)
            lines = [line for line in lines if f":{user_id}:" not in line]

            # Write the filtered lines back to the file
            with open(passwd_path, "w") as f:
                f.writelines(lines)
            
            # Append the new user line
            with open(passwd_path, "a") as f:
                f.write(f"{username}:x:{user_id}:{user_id}:{username}:/home/{username}:/bin/bash\n")

            log.msg(f"Updated {passwd_path} for uid={user_id}")
        except Exception as e:
            log.msg(f"Error updating passwd: {e}")

        # Update /etc/group file
        try:
            group_path = os.path.join(etc_dir, "group")

            # Read all lines from the file
            lines = []
            if os.path.exists(group_path):
                with open(group_path, "r") as f:
                    lines = f.readlines()

            # Remove any line that contains the group_id (1001)
            lines = [line for line in lines if f":{user_id}:" not in line]

            # Write the filtered lines back to the file
            with open(group_path, "w") as f:
                f.writelines(lines)

            # Append the new group line
            with open(group_path, "a") as f:
                f.write(f"{username}:x:{user_id}:\n")
            
            log.msg(f"Updated {group_path} for gid={user_id}")
        except Exception as e:
            log.msg(f"Error updating group file: {e}")

    # def update_etc_passwd(self, username):
    #     """
    #     Adds or updates a user entry in the /etc/passwd file.
    #     """
    #     user_id = 1001
    #     etc_dir = "/home/cowrie/cowrie/honeyfs/etc"
    #     try:
    #         passwd_path = os.path.join(etc_dir, "passwd")
    #         if os.path.exists(passwd_path):
    #             with open(passwd_path, "r") as f:
    #                 lines = f.readlines()
    #             lines = [line for line in lines if f":{user_id}:" not in line]
    #             with open(passwd_path, "w") as f:
    #                 f.writelines(lines)

    #         with open(passwd_path, "a") as f:
    #             f.write(f"{username}:x:{user_id}:{user_id}:{username}:/home/{username}:/bin/bash\n")

    #         log.msg(f"Updated {passwd_path} for uid={user_id}")
    #     except Exception as e:
    #         log.msg(f"Error updating passwd: {e}")


    #     # อัปเดตไฟล์ /etc/group
    #     try:
    #         group_path = os.path.join(etc_dir, "group")
            
    #         if os.path.exists(group_path):
    #             with open(group_path, "r") as f:
    #                 lines = f.readlines()
    #             lines = [line for line in lines if not line.startswith(f"{username}:")]
    #             with open(group_path, "w") as f:
    #                 f.writelines(lines)

    #         with open(group_path, "a") as f:
    #             f.write(f"{username}:x:{user_id}:\n")
    #         log.msg(f"Updated {group_path} for gid={user_id}")
    #     except Exception as e:
    #         log.msg(f"Error updating group file: {e}")


    def __init__(self, username, server):
        # to be populated by HoneyPotTelnetAuthProtocol after auth
        self.transportId = None
        self.windowSize = [40, 80]
        self.username = username.decode()
        self.server = server

        
        try:
            pwentry = pwd.Passwd().getpwnam(self.username)
            self.uid = pwentry["pw_uid"]
            self.gid = pwentry["pw_gid"]
            self.home = pwentry["pw_dir"]
            
        except KeyError:
            self.uid = 1001
            self.gid = 1001
            # self.home = "/home"
            self.home = f"/home/{self.username}"
            # self.create_login_user_in_init()

        self.environ = {
            "LOGNAME": self.username,
            "USER": self.username,
            "SHELL": "/bin/bash",
            "HOME": self.home,
            "TMOUT": "1800",
        }

        if self.uid == 0:
            self.environ["PATH"] = (
                "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
            )
        else:
            self.environ["PATH"] = (
                "/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games"
            )

        # required because HoneyPotBaseProtocol relies on avatar.avatar.home
        self.avatar = self

        # Do the delayed file system initialization
        self.server.initFileSystem(self.home)

    def connectionMade(self):
        processprotocol = TelnetSessionProcessProtocol(self)

        # If we are dealing with a proper Telnet client: enable server echo
        if self.transport.options:
            self.transport.willChain(SGA)
            self.transport.willChain(ECHO)

        self.protocol = insults.LoggingTelnetServerProtocol(
            cproto.HoneyPotInteractiveTelnetProtocol, self
        )
        self.create_login_user(self.username)

        # somewhere in Twisted this exception gets lost. Log explicitly here
        try:
            self.protocol.makeConnection(processprotocol)
            processprotocol.makeConnection(session.wrapProtocol(self.protocol))
        except Exception:
            log.msg(traceback.format_exc())

    def connectionLost(self, reason: failure.Failure = connectionDone) -> None:
        TelnetBootstrapProtocol.connectionLost(self, reason)
        self.server = None
        self.avatar = None
        self.protocol = None

    def logout(self) -> None:
        log.msg(f"avatar {self.username} logging out")


# Taken and adapted from
# https://github.com/twisted/twisted/blob/26ad16ab41db5f0f6d2526a891e81bbd3e260247/twisted/conch/ssh/session.py#L186
@implementer(interfaces.ITransport)
class TelnetSessionProcessProtocol(protocol.ProcessProtocol):
    """
    I am both an L{IProcessProtocol} and an L{ITransport}.
    I am a transport to the remote endpoint and a process protocol to the
    local subsystem.
    """

    def __init__(self, sess):
        self.session = sess
        self.lostOutOrErrFlag = False

        self.avatar = self
        # โหลด filesystem ของ user จาก session
        self.fs = fs.HoneyPotFilesystem("/home/cowrie/cowrie/honeyfs", self.session.home)
        log.msg("Loaded fresh filesystem for Telnet session of user %s" % self.session.username)

    def outReceived(self, data: bytes) -> None:
        self.session.write(data)

    def errReceived(self, data: bytes) -> None:
        log.msg(f"Error received: {data.decode()}")
        # EXTENDED_DATA_STDERR is from ssh, no equivalent in telnet?
        # self.session.writeExtended(connection.EXTENDED_DATA_STDERR, err)

    def outConnectionLost(self) -> None:
        """
        EOF should only be sent when both STDOUT and STDERR have been closed.
        """
        if self.lostOutOrErrFlag:
            self.session.conn.sendEOF(self.session)
        else:
            self.lostOutOrErrFlag = True

    def errConnectionLost(self) -> None:
        """
        See outConnectionLost().
        """
        self.outConnectionLost()

    def connectionLost(self, reason=None):
        self.session.loseConnection()
        self.session = None

    def processEnded(self, reason=None):
        """
        here SSH is doing signal handling, I don't think telnet supports that so
        I'm simply going to bail out
        """
        log.msg(f"Process ended. Telnet Session disconnected: {reason}")
        self.session.loseConnection()

    def getHost(self):
        """
        Return the host from my session's transport.
        """
        return self.session.transport.getHost()

    def getPeer(self):
        """
        Return the peer from my session's transport.
        """
        return self.session.transport.getPeer()

    def write(self, data):
        self.session.write(data)

    def writeSequence(self, seq):
        self.session.write(b"".join(seq))

    def loseConnection(self):
        self.session.loseConnection()
