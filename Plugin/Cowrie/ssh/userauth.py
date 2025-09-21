# Copyright (c) 2009-2014 Upi Tamminen <desaster@gmail.com>
# See the COPYRIGHT file for more information
# /home/cowrie/cowrie/src/cowrie/ssh

# Original import 
from __future__ import annotations
import struct
from typing import Any

from twisted.conch import error
from twisted.conch.interfaces import IConchUser
from twisted.conch.ssh import userauth
from twisted.conch.ssh.common import NS, getNS
from twisted.conch.ssh.transport import DISCONNECT_PROTOCOL_ERROR
from twisted.internet import reactor, defer
from twisted.python import log
from cowrie.core import credentials
from cowrie.core.config import CowrieConfig

# Develop import
import random
from twisted.cred import error
from twisted.python.failure import Failure
import ast
import os
import json
import datetime
import uuid
from pathlib import Path

import fcntl
import tempfile
from typing import Any, Optional

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

# เพิ่ม user ใหม่
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


# การเก็บ log
cowrie_json_path = Path("/home/cowrie/cowrie/var/log/cowrie/cowrie_custom.json")

def append_to_cowrie_json(payload: dict):

    # ตรวจสอบและสร้าง หากยังไม่มี
    directory = os.path.dirname(cowrie_json_path)
    if not os.path.exists(directory):
        os.makedirs(directory)

    # เขียนข้อมูลลงในไฟล์
    with open(cowrie_json_path, "a", encoding="utf-8") as f:
        f.write(json.dumps(payload, ensure_ascii=False) + "\n")


def create_payload(message: str, session_id: str = None, eventid: str = "cowrie.custom.event", transport=None):
    src_ip = src_port = dst_ip = dst_port = None

    if transport:
        try:
            peer = transport.transport.getPeer()  # attacker
            host = transport.transport.getHost()  # honeypot
            src_ip   = getattr(peer, "host", None)
            src_port = getattr(peer, "port", None)
            dst_ip   = getattr(host, "host", None)
            dst_port = getattr(host, "port", None)
        except Exception as e:
            print(f"[!] Could not extract connection info: {e}")

    payload = {
        "eventid": eventid,
        "timestamp": datetime.datetime.utcnow().replace(microsecond=0).isoformat() + "Z",
        "src_ip": src_ip,
        "src_port": src_port,
        "dst_ip": dst_ip,
        "dst_port": dst_port,
        "session": session_id,
        "protocol": "ssh",
        "message": message,
    }
    
    append_to_cowrie_json(payload)



class HoneyPotSSHUserAuthServer(userauth.SSHUserAuthServer):
    """
    This contains modifications to the authentication system to do:
    * Login banners (like /etc/issue.net)
    * Anonymous authentication
    * Keyboard-interactive authentication (PAM)
    * IP based authentication
    """

    bannerSent: bool = False                
    user: bytes
    _pamDeferred: defer.Deferred | None     
                                            
    
    # เพิ่มตัวแปรสำหรับเก็บสถานะการล็อกอินล้มเหลว
    _login_attempts: dict[tuple[bytes, str], dict[str, int]]

    # ฟังก์ชันนี้จะถูกเรียก เมื่อเริ่มต้นเซสชัน SSH (None = ไม่มีค่า return)
    def serviceStarted(self) -> None:
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

        # ตัวแปรสำหรับบังคับ login
        self._login_attempts = {}
        self._required_attempts = random.randint(5, 10)
        self._current_attempts = 0

        # การเก็บ log json
        message = f"จำนวนครั้งที่ต้อง login = {self._required_attempts}"

        src_ip = None
        if hasattr(self, 'transport') and self.transport is not None:
            src_ip = self.transport.transport.getPeer().host
        
        session_id = getattr(self, 'session', None)
        if session_id:
            session_id = str(session_id.id) 

        try:
            create_payload(
                message=f"จำนวนครั้งที่ต้อง login = {self._required_attempts}",
                session_id=str(getattr(self, 'session', None)),
                eventid="cowrie.custom.login",
                transport=self.transport
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
        c = credentials.Username(self.user)
        srcIp: str = self.transport.transport.getPeer().host  # type: ignore
        return self.portal.login(c, srcIp, IConchUser)


    def auth_password(self, packet: bytes) -> Any:
        password = getNS(packet[1:])[0]     # ดึง password
        
        # แปลง byte -> str
        password_str = password.decode() if isinstance(password, bytes) else str(password)
        username_str = self.user.decode() if isinstance(self.user, bytes) else str(self.user)

        # เก็บ username,password ล่าสุด
        self._last_username = username_str
        self._last_password = password_str

        
        users = load_users_txt(USERS_FILE)  # ดึง username,password tuple
        user_dict = dict(users)             # แปลงเป็น dict

        c = credentials.UsernamePasswordIP(self.user, password, None)
        d = self.portal.login(c, None, IConchUser)
        
        # ตรวจสอบแบบ asynchronous ที่จะไม่รอผลลัพธ์
        # d.addCallback(self._cb_login_success, username_str, password_str, user_dict)
        d.addCallback(self._cb_login_success, c, username_str, password_str, user_dict)
        # d.addErrback(lambda f: self._deny_access())
        d.addErrback(lambda f: self._deny_access(credentials=c))
        return d

    # ฟังก์ชันตรวจสอบการ login
    # def _cb_login_success(self, result, username_str, password_str, user_dict):
    def _cb_login_success(self, result, c, username_str, password_str, user_dict):  
        # หากเป็น user เก่า 
        if username_str in user_dict:
            # หากใช้ password ถูก
            if user_dict[username_str] == password_str:
                log.msg(f"Existing user {username_str} logged in with correct password.")
                
                # return self._grant_access(result)
                return self._grant_access(result, credentials=c)
            
            # หากใช้ password ผิด
            else:
                log.msg(f"Existing user {username_str} tried wrong password -> DENIED")
                
                # return self._deny_access()
                return self._deny_access(credentials=c)

        # หากใช้ password เดียวกับที่บันทึก
        if password_str in user_dict.values():
            log.msg(f"New user {username_str} logged in with known password '{password_str}'.")
            
            self._save_user(username_str, password_str)
            # return self._grant_access(result)
            return self._grant_access(result, credentials=c)

        # หากเป็น user ใหม่ให้บังคับ login
        self._current_attempts += 1
        if self._current_attempts >= self._required_attempts:
            log.msg(f"New user {username_str} logged in after {self._current_attempts} attempts.")
            self._save_user(username_str, password_str)
            # return self._grant_access(result)
            return self._grant_access(result, credentials=c)

        else:
            log.msg(f"New user {username_str} needs {self._required_attempts - self._current_attempts} more attempts.")
            
            # return self._deny_access()
            return self._deny_access(credentials=c)

        

    # บันทึก username,password
    def _save_user(self, username, password):
        users = load_users_txt(USERS_FILE)
        if (username, password) not in users:
            users.append((username, password))
            try:
                with open(USERS_FILE, "w") as f:
                    f.write(str(users))
                log.msg(f"Appended new credentials to users.txt: ({username}, {password})")
            except Exception as e:
                log.msg(f"Cannot append to users.txt: {e}")
    
    def _grant_access(self, result, credentials=None, pubkey=None):
        # delay แบบเดิม
        d = defer.Deferred()

        # log success
        log_kwargs = {
            "eventid": "cowrie.login.success",
            "format": "login attempt for [%(username)s] succeeded",
            "username": getattr(credentials, "username", b"?") if credentials else b"?",
        }

        # หากเป็น public key เพิ่มข้อมูล fingerprint/key/type
        if pubkey is not None:
            log_kwargs.update({
                "format": "public key login attempt for [%(username)s] succeeded",
                "fingerprint": pubkey.fingerprint(),
                "key": pubkey.toString("OPENSSH"),
                "type": pubkey.sshType(),
            })

        log.msg(**log_kwargs)

        # ทำ delay ก่อน callback result
        reactor.callLater(random.uniform(1.0, 1.5), d.callback, result)
        return d


    def _deny_access(self, credentials=None, pubkey=None):
        d = defer.Deferred()
        msg = "Authentication failed. Please try again."

        # เตรียม log
        log_kwargs = {
            "eventid": "cowrie.login.failed",
            "format": "login attempt for [%(username)s] failed",
            "username": getattr(credentials, "username", b"?") if credentials else b"?",
        }

        # หากเป็น public key เพิ่มข้อมูล fingerprint/key/type
        if pubkey is not None:
            log_kwargs.update({
                "format": "public key login attempt for [%(username)s] failed",
                "fingerprint": pubkey.fingerprint(),
                "key": pubkey.toString("OPENSSH"),
                "type": pubkey.sshType(),
            })

        log.msg(**log_kwargs)

        reactor.callLater(random.uniform(1, 1.5),d.errback,error.UnauthorizedLogin(msg),)
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
        assert self._pamDeferred is not None        # ตรวจสอบว่าเคยมีการเรียกใช้ _pamConv
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
