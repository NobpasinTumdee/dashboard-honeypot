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
        self.interfaceToMethod[credentials.IUsername] = b"none"                 # กำหนดวิธีการสำหรับการรับรองตัวตนแบบไม่มีข้อมูลประจำตัว
        self.interfaceToMethod[credentials.IUsernamePasswordIP] = b"password"   # กำหนดวิธีการสำหรับการรับรองตัวตนด้วยชื่อผู้ใช้และรหัสผ่าน
        
        # ตรวจสอบสถานะการเปิดใช้งานการตอบโต้กับผู้ใช้ด้วยคีย์บอร์ด
        keyboard: bool = CowrieConfig.getboolean(
            "ssh", "auth_keyboard_interactive_enabled", fallback=False
        )

        # ถ้าเปิดใช้งาน 
        if keyboard is True:
            self.interfaceToMethod[credentials.IPluggableAuthenticationModulesIP] = (
                b"keyboard-interactive"
            )
        self._pamDeferred: defer.Deferred | None = None

        # เพิ่ม ตัวแปรสำหรับเก็บสถานะการล็อกอินล้มเหลว
        self._login_attempts = {} 

        # เรียกใช้เมธอดของคลาสแม่เพื่อเริ่มต้นการให้บริการ
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

    # def auth_publickey(self, packet):
    #     """
    #     We subclass to intercept non-dsa/rsa keys,
    #     or Conch will crash on ecdsa..
    #     UPDATE: conch no longer crashes. comment this out
    #     """
    #     algName, blob, rest = getNS(packet[1:], 2)
    #     if algName not in (b'ssh-rsa', b'ssh-dsa'):
    #         log.msg("Attempted public key authentication\
    #                           with {} algorithm".format(algName))
    #         return defer.fail(error.ConchError("Incorrect signature"))
    #     return userauth.SSHUserAuthServer.auth_publickey(self, packet)

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

        # ดึง password + ip จาก packet ที่ส่งมา
        password = getNS(packet[1:])[0]
        srcIp: str = self.transport.transport.getPeer().host  # type: ignore

        # ใช้ user และ IP เป็น key สำหรับเก็บสถานะ
        user_key = (self.user, srcIp)

        # หากเป็นการพยายามล็อกอินครั้งแรกสำหรับ user/IP นี้
        if user_key not in self._login_attempts:
            # สุ่มจำนวนครั้งที่ต้องล็อกอินสำเร็จ 1-5 ครั้ง (Corwie limit การ login ที่ 3 ครั้ง)
            required_attempts = random.randint(1, 5)
            self._login_attempts[user_key] = {
                "required_attempts": required_attempts,
                "current_attempts": 0
            }
            log.msg(
                f"User {self.user.decode()} from {srcIp}: "
                f"New session, required {required_attempts} successful attempts to pass."
            )

        current_state = self._login_attempts[user_key]

        c = credentials.UsernamePasswordIP(self.user, password, srcIp)

        # เรียก portal.login เพื่อตรวจสอบ Username/Password จริงๆ
        d = self.portal.login(c, srcIp, IConchUser)

        def _cb_login_success(result):
            """
            Callback when credentials are correct.
            """
            current_state["current_attempts"] += 1
            log.msg(
                f"User {self.user.decode()} from {srcIp}: "
                f"Credentials correct. Current successful attempts: {current_state['current_attempts']}/"
                f"{current_state['required_attempts']}"
            )

            if current_state["current_attempts"] >= current_state["required_attempts"]:
                log.msg(
                    f"User {self.user.decode()} from {srcIp}: "
                    f"Login successful after {current_state['current_attempts']} required attempts!"
                )
                # ลบสถานะหลังจากล็อกอินสำเร็จ เพื่อให้การล็อกอินครั้งถัดไปเริ่มต้นใหม่
                del self._login_attempts[user_key]
                return result  # ส่งผลลัพธ์การล็อกอินที่สำเร็จจริงๆ

            else:
                # รหัสผ่านถูกต้อง แต่ยังไม่ถึงจำนวนครั้งที่กำหนด
                log.msg(
                    f"User {self.user.decode()} from {srcIp}: "
                    f"Still requires {current_state['required_attempts'] - current_state['current_attempts']} "
                    f"more successful attempts."
                )
                # ส่งข้อผิดพลาดเพื่อให้ผู้ใช้ต้องลองใหม่
                return defer.fail(error.UnauthorizedLogin("Authentication failed. Please try again."))

        def _eb_login_fail(failure: Failure):
            """
            Errback when credentials are incorrect.
            """
            log.msg(
                f"User {self.user.decode()} from {srcIp}: "
                f"Login attempt failed (Incorrect credentials)."
            )
            # ไม่เพิ่ม current_attempts เพราะรหัสผ่านไม่ถูกต้อง
            return defer.fail(failure)

        # ส่งออบเจกต์ไปยัง portal เพื่อทำการ login
        # return self.portal.login(c, srcIp, IConchUser).addErrback(self._ebPassword)

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