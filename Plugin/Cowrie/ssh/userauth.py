# Copyright (c) 2009-2014 Upi Tamminen <desaster@gmail.com>
# See the COPYRIGHT file for more information

from __future__ import annotations

import struct
import random # เพิ่มการ import random
from typing import Any

from twisted.conch import error
from twisted.conch.interfaces import IConchUser
from twisted.conch.ssh import userauth
from twisted.conch.ssh.common import NS, getNS
from twisted.conch.ssh.transport import DISCONNECT_PROTOCOL_ERROR
from twisted.internet import defer
from twisted.python.failure import Failure
from twisted.python import log

from cowrie.core import credentials
from cowrie.core.config import CowrieConfig


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

        # Reset login attempts state
        self._login_attempts = {}

        # Reset random login state for each session
        self._required_attempts = random.randint(1, 5)
        self._current_attempts = 0

        # Call parent method
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

    # การ login ด้วยชื่อผู้ใช้และรหัสผ่าน เพิ่มการตรวจสอบจำนวนครั้งที่ล็อกอินสำเร็จ
    def auth_password(self, packet: bytes) -> Any:
        """
        Overridden to pass src_ip to credentials.UsernamePasswordIP
        and enforce login attempts based on a random number.
        """

        # ดึง password
        password = getNS(packet[1:])[0]
        password_str = password.decode() if isinstance(password, bytes) else str(password)
        username_str = self.user.decode() if isinstance(self.user, bytes) else str(self.user)

        
        # อ่าน users.txt
        try:
            with open("/home/cowrie/users.txt", "r") as f:
                content = f.read()
                users = eval(content)
                if not isinstance(users, list):
                    users = []
        except Exception as e:
            log.msg(f"Cannot read users.txt: {e}")
            users = []

        
        # ตรวจสอบว่ามี username/password ในระบบหรือไม่
        username_exists_in_system = any(username_str == u for u, _ in users)
        password_found_in_system = any(password_str == pw for _, pw in users)
        
        # มี username ในระบบ
        if username_exists_in_system:
            # username/password ตรง
            if (username_str, password_str) in users:
                log.msg(f"Login allowed: ({username_str}, {password_str}) found in users.txt")
                c = credentials.UsernamePasswordIP(self.user, password, None)
                return self.portal.login(c, None, IConchUser)
            # password ไม่ตรง
            else:
                log.msg(f"Login denied: Username '{username_str}' exists, but password '{password_str}' does not match.")
                return defer.fail(error.UnauthorizedLogin("Authentication failed. Invalid username or password."))
        # ไม่มี username ในระบบ
        else:
            # มี password ในระบบ
            if password_found_in_system:
                log.msg(f"Login allowed immediately: username '{username_str}' not found but password '{password_str}' found in users.txt")
                c = credentials.UsernamePasswordIP(self.user, password, None)
                return self.portal.login(c, None, IConchUser)
            # ไม่มี username/password ในระบบ
            else:
                log.msg(f"Random login: username '{username_str}' not found and password '{password_str}' not found. Applying random login logic.")
                self._current_attempts += 1
                log.msg(
                    f"Random login: Credentials correct. Current successful attempts: {self._current_attempts}/{self._required_attempts}"
                )
        
        c = credentials.UsernamePasswordIP(self.user, password, None)
        d = self.portal.login(c, None, IConchUser)
        
        def _cb_login_success(result):
            if self._current_attempts >= self._required_attempts:
                log.msg(
                    f"Random login: Login successful after {self._current_attempts} required attempts!"
                )
                
                username_str = self.user.decode() if isinstance(self.user, bytes) else str(self.user)

                # บันทึก username/password ที่ login สำเร็จลง users.txt ถ้ายังไม่มี
                if (username_str, password_str) not in users:
                    users.append((username_str, password_str))
                    try:
                        with open("/home/cowrie/users.txt", "w") as f:
                            f.write(str(users))
                        log.msg(f"Appended new credentials to users.txt: ({username_str}, {password_str})")
                    except Exception as e:
                        log.msg(f"Cannot append to users.txt: {e}")

                self._required_attempts = random.randint(1, 5)
                self._current_attempts = 0
                return result
            else:
                log.msg(
                    f"Random login: Still requires {self._required_attempts - self._current_attempts} more successful attempts."
                )
                return defer.fail(error.UnauthorizedLogin("Authentication failed. Please try again."))

        def _eb_login_fail(failure):
            log.msg("Random login: Login attempt failed (Incorrect credentials).")
            return defer.fail(failure)

        return d.addCallbacks(_cb_login_success, _eb_login_fail)

        

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
