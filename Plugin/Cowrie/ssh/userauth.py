# Copyright (c) 2009-2014 Upi Tamminen <desaster@gmail.com>
# See the COPYRIGHT file for more information

from __future__ import annotations

import struct
import random
from typing import Any
from twisted.conch import error
from twisted.conch.interfaces import IConchUser
from twisted.conch.ssh import userauth
from twisted.conch.ssh.common import NS, getNS
from twisted.conch.ssh.transport import DISCONNECT_PROTOCOL_ERROR
from twisted.internet import reactor, defer
from twisted.cred import error
from twisted.python.failure import Failure
from twisted.python import log
from cowrie.core import credentials
from cowrie.core.config import CowrieConfig
import ast
import os


USERS_FILE = "/home/cowrie/users.txt"

# โหลด users.txt
def load_users_txt(path=USERS_FILE):
    users = []
    try:
        with open(path, "r") as f:
            data = f.read().strip()
            if data:
                users = ast.literal_eval(data)  # แปลงจาก string → list
    except Exception as e:
        print(f"[!] Error loading users.txt: {e}")
    return users


def append_user_txt(username: str, password: str, path=USERS_FILE):
    users = load_users_txt(path)
    if (username, password) not in users:
        users.append((username, password))
        try:
            with open(path, "w") as f:
                f.write(str(users))
            log.msg(f"Appended new credentials to {path}: ({username}, {password})")
        except Exception as e:
            log.msg(f"Cannot append to {path}: {e}")

## การเก็บ log
import json
import datetime
import uuid
from pathlib import Path

cowrie_json_path = Path("/home/cowrie/cowrie/var/log/cowrie/cowrie.json")

def append_to_cowrie_json(payload: dict):
    with open(cowrie_json_path, "a", encoding="utf-8") as f:
        f.write(json.dumps(payload, ensure_ascii=False) + "\n")

def create_payload(message: str, src_ip: str = None, session_id: str = None, eventid: str = "cowrie.custom.event"):
    """
    สร้าง log payload แบบ custom
    """
    payload = {
        "eventid": eventid,
        "timestamp": datetime.datetime.utcnow().replace(microsecond=0).isoformat() + "Z",
        "src_ip": src_ip,
        "session": session_id,
        "message": message,
    }
    append_to_cowrie_json(payload)

## --------------------------------------------



class HoneyPotSSHUserAuthServer(userauth.SSHUserAuthServer):
    """
    This contains modifications to the authentication system to do:
    * Login banners (like /etc/issue.net)
    * Anonymous authentication
    * Keyboard-interactive authentication (PAM)
    * IP based authentication
    """

    bannerSent: bool = False                # ประกาศตัวแปรแบบ boolean โดยค่าเริ่มต้นเป็น False
    user: bytes
    _pamDeferred: defer.Deferred | None     # ประกาศตัวแปรแบบ Deferred ที่สามารถเป็น None ได้
                                            # Deferred ออบเจกต์ที่ทำหน้าที่เป็นตัวแทนของผลลัพธ์ที่จะเกิดขึ้นในอนาคต (T/F)
    
    # เพิ่มตัวแปรสำหรับเก็บสถานะการล็อกอินล้มเหลว
    _login_attempts: dict[tuple[bytes, str], dict[str, int]]

    # ฟังก์ชันนี้จะถูกเรียก เมื่อเริ่มต้นเซสชัน SSH (None = ไม่มีค่า return)
    def serviceStarted(self) -> None:
        """
        Called when the SSH session starts. Initializes authentication methods and resets login state.
        """
        self.interfaceToMethod[credentials.IUsername] = b"none"
        self.interfaceToMethod[credentials.IUsernamePasswordIP] = b"password"

        keyboard: bool = CowrieConfig.getboolean(
            "ssh", "auth_keyboard_interactive_enabled", fallback=False
        )
        if keyboard is True:
            self.interfaceToMethod[credentials.IPluggableAuthenticationModulesIP] = (
                b"keyboard-interactive"
            )
        self._pamDeferred: defer.Deferred | None = None

        
        self._login_attempts = {}

        
        self._required_attempts = random.randint(5, 10)
        self._current_attempts = 0

        message = f"จำนวนครั้งที่ต้อง login = {self._required_attempts}"

        src_ip = None
        if hasattr(self, 'transport') and self.transport is not None:
            src_ip = self.transport.transport.getPeer().host
        
        session_id = getattr(self, 'session', None)
        if session_id:
            session_id = str(session_id.id) 

        try:
            create_payload(
                message=message,
                src_ip=src_ip,
                session_id=getattr(self, 'session', None),  # ใช้ session จริงถ้ามี
                eventid="cowrie.custom.login"
            )
        except Exception as e:
            log.msg(f"Error logging attempt to cowrie.json: {e}")


        
        userauth.SSHUserAuthServer.serviceStarted(self)

    # แสดงข้อความต้อนรับ
    def sendBanner(self):
        """
        This is the pre-login banner. The post-login banner is the MOTD file
        Display contents of <honeyfs>/etc/issue.net
        """

        # ตรวจสอบว่ามีการส่งข้อความต้อนรับไปแล้วหรือไม่
        if self.bannerSent:
            return
        self.bannerSent = True
        try:
            issuefile = CowrieConfig.get("honeypot", "contents_path") + "/etc/issue.net"
            with open(issuefile, "rb") as issue:
                data = issue.read()
        except OSError:
            return
        if not data or not data.strip():
            return
        self.transport.sendPacket(userauth.MSG_USERAUTH_BANNER, NS(data) + NS(b"en"))

    def ssh_USERAUTH_REQUEST(self, packet: bytes) -> Any:
        """
        This is overriden to send the login banner.
        """
        self.sendBanner()
        return userauth.SSHUserAuthServer.ssh_USERAUTH_REQUEST(self, packet)



    # การ login แบบไม่มีรหัสผ่าน
    def auth_none(self, _packet: bytes) -> Any:
        """
        Allow every login
        """
        # สร้างออบเจกต์ที่เก็บชื่อผู้ใช้ + IP และส่งไปยัง portal เพื่อทำการ login
        # portal เป็นส่วนที่จัดการการรับรองตัวตนของผู้ใช้
        c = credentials.Username(self.user)
        srcIp: str = self.transport.transport.getPeer().host  # type: ignore
        return self.portal.login(c, srcIp, IConchUser)

    def auth_password(self, packet: bytes) -> Any:
        password = getNS(packet[1:])[0]
        password_str = password.decode() if isinstance(password, bytes) else str(password)
        username_str = self.user.decode() if isinstance(self.user, bytes) else str(self.user)

        self._last_username = username_str
        self._last_password = password_str

        users = load_users_txt(USERS_FILE)  # list of tuple
        user_dict = dict(users)

        c = credentials.UsernamePasswordIP(self.user, password, None)
        d = self.portal.login(c, None, IConchUser)
        d.addCallback(self._cb_login_success, username_str, password_str, user_dict)
        d.addErrback(lambda f: self._deny_access())
        return d


    def _cb_login_success(self, result, username_str, password_str, user_dict):
        # --- กรณี User เก่า ---
        if username_str in user_dict:
            if user_dict[username_str] == password_str:
                log.msg(f"Existing user {username_str} logged in with correct password.")
                return self._grant_access(result)
            else:
                log.msg(f"Existing user {username_str} tried wrong password -> DENIED")
                return self._deny_access()

        # --- กรณี User ใหม่ ---
        if password_str in user_dict.values():
            log.msg(f"New user {username_str} logged in with known password '{password_str}'.")
            self._save_user(username_str, password_str)
            return self._grant_access(result)

        # --- Random attempts ---
        self._current_attempts += 1
        if self._current_attempts >= self._required_attempts:
            log.msg(f"New user {username_str} logged in after {self._current_attempts} attempts.")
            self._save_user(username_str, password_str)
            return self._grant_access(result)
        else:
            log.msg(f"New user {username_str} needs {self._required_attempts - self._current_attempts} more attempts.")
            return self._deny_access()


    def _save_user(self, username, password):
        """บันทึก user ใหม่ลง users.txt (แบบ list of tuple)"""
        users = load_users_txt(USERS_FILE)
        if (username, password) not in users:
            users.append((username, password))
            try:
                with open(USERS_FILE, "w") as f:
                    f.write(str(users))
                log.msg(f"Appended new credentials to users.txt: ({username}, {password})")
            except Exception as e:
                log.msg(f"Cannot append to users.txt: {e}")


    def _grant_access(self, result):
        """อนุญาต login + delay"""
        self._required_attempts = random.randint(1, 5)
        self._current_attempts = 0
        d = defer.Deferred()
        reactor.callLater(random.uniform(1.0, 2.5), d.callback, result)
        return d


    def _deny_access(self):
        """ปฏิเสธ login + delay"""
        d = defer.Deferred()
        reactor.callLater(
            random.uniform(3, 4),
            d.errback,
            error.UnauthorizedLogin("Authentication failed. Please try again."),
        )
        return d


        

        

    # การ login ด้วยคีย์บอร์ดแบบโต้ตอบ (PAM)
    def auth_keyboard_interactive(self, _packet: bytes) -> Any:
        """
        Keyboard interactive authentication.  No payload.  We create a
        PluggableAuthenticationModules credential and authenticate with our
        portal.

        Overridden to pass src_ip to
          credentials.PluggableAuthenticationModulesIP
        """
        # หากมีการ login อื่นที่กำลังดำเนินการอยู่ จะไม่อนุญาตให้ทำการ login ใหม่
        if self._pamDeferred is not None:
            self.transport.sendDisconnect(  # type: ignore
                DISCONNECT_PROTOCOL_ERROR,
                "only one keyboard interactive attempt at a time",
            )
            return defer.fail(error.IgnoreAuthentication())
        src_ip = self.transport.transport.getPeer().host  # type: ignore + ดึง IP ของผู้ใช้ที่ทำการเชื่อมต่อ
        c = credentials.PluggableAuthenticationModulesIP(
            self.user, self._pamConv, src_ip
        )
        # ส่งออบเจกต์ไปยัง portal เพื่อทำการ login
        return self.portal.login(c, src_ip, IConchUser).addErrback(self._ebPassword)
    
    # แปลงคำถาม PAM ไปเป็นข้อความที่ SSH จะส่งให้ผู้โจมตี และ รอรับคำตอบ กลับมา
    def _pamConv(self, items: list[tuple[Any, int]]) -> defer.Deferred:
        """
        Convert a list of PAM authentication questions into a
        MSG_USERAUTH_INFO_REQUEST.  Returns a Deferred that will be called
        back when the user has responses to the questions.

        @param items: a list of 2-tuples (message, kind).  We only care about
            kinds 1 (password) and 2 (text).
        @type items: C{list}
        @rtype: L{defer.Deferred}
        """
        resp = []   #  ใช้เก็บคำถามที่เราจะส่งให้ผู้ใช้
        for message, kind in items:
            if kind == 1:  # Password
                resp.append((message, 0))
            elif kind == 2:  # Text
                resp.append((message, 1))
            elif kind in (3, 4):
                return defer.fail(error.ConchError("cannot handle PAM 3 or 4 messages"))
            else:
                return defer.fail(error.ConchError(f"bad PAM auth kind {kind}"))
        packet = NS(b"") + NS(b"") + NS(b"")
        packet += struct.pack(">L", len(resp))
        for prompt, echo in resp:
            packet += NS(prompt)
            packet += bytes((echo,))
        self.transport.sendPacket(userauth.MSG_USERAUTH_INFO_REQUEST, packet)  # type: ignore
        self._pamDeferred = defer.Deferred()
        return self._pamDeferred
    
    # รับคำตอบจากผู้ใช้
    def ssh_USERAUTH_INFO_RESPONSE(self, packet: bytes) -> None:
        """
        The user has responded with answers to PAMs authentication questions.
        Parse the packet into a PAM response and callback self._pamDeferred.
        Payload::
            uint32 numer of responses
            string response 1
            ...
            string response n
        """
        assert self._pamDeferred is not None        # ตรวจสแบว่าเคยมีการเรียกใช้ _pamConv
        d: defer.Deferred = self._pamDeferred       # สร้างตัวแปร d เพื่อใช้แทนที่ _pamDeferred
        self._pamDeferred = None                    # รีเซ็ต _pamDeferred เพื่อรอรับการตอบกลับใหม่ในอนาคต
        resp: list

        # จัดการกับ ข้อผิดพลาด (Error Handling)
        try:
            resp = []
            numResps = struct.unpack(">L", packet[:4])[0]
            packet = packet[4:]
            while len(resp) < numResps:
                response, packet = getNS(packet)
                resp.append((response, 0))
            if packet:
                log.msg(f"PAM Response: {len(packet):d} extra bytes: {packet!r}")
        except Exception as e:
            d.errback(Failure(e))
        else:
            d.callback(resp)
