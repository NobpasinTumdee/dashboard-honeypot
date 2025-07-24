# path /home/cowrie/cowrie/src/cowrie/telnet/userauth.py
"""
Telnet Transport and Authentication for the Honeypot

@author: Olivier Bilodeau <obilodeau@gosecure.ca>
"""

from __future__ import annotations

import ast
import struct
import random
import os

from twisted.conch.telnet import (
    ECHO,
    LINEMODE,
    NAWS,
    SGA,
    AuthenticatingTelnetProtocol,
    ITelnetProtocol,
)
from twisted.internet.protocol import connectionDone
from twisted.python import failure, log

from cowrie.core.config import CowrieConfig
from cowrie.core.credentials import UsernamePasswordIP

# ฟังก์ชันเสริม
def write_user(filename, username, password):
    def to_str(val):
        return val.decode() if isinstance(val, bytes) else str(val)
    try:
        with open(filename, 'r') as f:
            content = f.read().strip()
            if content:
                users = ast.literal_eval(content)
            else:
                users = []
    except (FileNotFoundError, SyntaxError, ValueError):
        users = []
    users.append((to_str(username), to_str(password)))
    with open(filename, 'w') as f:
        f.write(str(users))

# ฟังก์ชัน ตรวจสอบ password เก่า
def password_exists(filename, password):
    """
    ตรวจสอบว่ามี password นี้อยู่ในไฟล์ users.txt หรือไม่
    (ไฟล์เก็บเป็น list ของ tuple เช่น [('user1','pass1'),('user2','pass2')])
    """
    def to_str(val):
        return val.decode() if isinstance(val, bytes) else str(val)
    try:
        with open(filename, 'r') as f:
            content = f.read().strip()
            if content:
                users = ast.literal_eval(content)
                for entry in users:
                    if len(entry) > 1 and to_str(entry[1]) == to_str(password):
                        return True
    except (FileNotFoundError, SyntaxError, ValueError):
        return False
    return False


class HoneyPotTelnetAuthProtocol(AuthenticatingTelnetProtocol):
    """
    TelnetAuthProtocol that takes care of Authentication. Once authenticated this
    protocol is replaced with HoneyPotTelnetSession.
    """

    loginPrompt = b"login: "
    passwordPrompt = b"Password: "
    windowSize: list[int]

    def connectionMade(self):
        # self.transport.negotiationMap[NAWS] = self.telnet_NAWS
        # Initial option negotation. Want something at least for Mirai
        # for opt in (NAWS,):
        #    self.transport.doChain(opt).addErrback(log.err)

        # I need to doubly escape here since my underlying
        # CowrieTelnetTransport hack would remove it and leave just \n
        self.windowSize = [40, 80]
        self.transport.write(self.factory.banner.replace(b"\n", b"\r\r\n"))
        self.transport.write(self.loginPrompt)

        # เสริม ---------------------
        self.login_attempts_made = 0  # นับจำนวนครั้งที่พยายามล็อกอิน
        self.required_login_attempts = random.randint(1, 5) # สุ่มจำนวนครั้งที่ต้องพยายาม 1-5
        log.msg(f"[*] Telnet: การเชื่อมต่อใหม่ต้องการการล็อกอินที่สำเร็จ {self.required_login_attempts} ครั้ง.")
        # -------------------------

    def connectionLost(self, reason: failure.Failure = connectionDone) -> None:
        """
        Fires on pre-authentication disconnects
        """
        AuthenticatingTelnetProtocol.connectionLost(self, reason)

    def telnet_User(self, line):
        """
        Overridden to conditionally kill 'WILL ECHO' which confuses clients
        that don't implement a proper Telnet protocol (most malware)
        """
        self.username = line  # .decode()
        # only send ECHO option if we are chatting with a real Telnet client
        self.transport.willChain(ECHO)
        # FIXME: this should be configurable or provided via filesystem
        self.transport.write(self.passwordPrompt)
        return "Password"

    def telnet_Password(self, line):
        username, password = self.username, line  # .decode()
        
        # เก็บ username/password ไว้ที่ instance variable
        self._last_success_username = username
        self._last_success_password = password
        
        del self.username

        def login(ignored):
            self.src_ip = self.transport.getPeer().host
            creds = UsernamePasswordIP(username, password, self.src_ip)
            #d = self.portal.login(creds, self.src_ip, ITelnetProtocol)
            #d.addCallback(self._cbLogin)
            #d.addErrback(self._ebLogin)
            
            # อ่าน password เก่า
            userfile_path = "/home/cowrie/users.txt"
            if password_exists(userfile_path, password):
                log.msg("Telnet: password นี้เคยถูกใช้แล้ว ข้ามจำนวนครั้ง login")
                self.login_attempts_made = self.required_login_attempts


            # เสริม ---------------------
            
            self.login_attempts_made += 1  # นับ
            log.msg(f"Telnet: พยายามล็อกอินครั้งที่ {self.login_attempts_made}/{self.required_login_attempts}") 

            # ตรวจสอบจำนวนครั้งที่พยายามล็อกอิน
            if self.login_attempts_made < self.required_login_attempts:
                
                log.msg(f"Telnet: ยังต้องการการล็อกอินอีก {self.required_login_attempts - self.login_attempts_made} ครั้ง.") # เก็บความพยายามไว้ใน log
                self.transport.wontChain(ECHO)               # ปิด ECHO เพื่อไม่ให้แสดงข้อความล็อกอิน
                self.transport.write(b"\nLogin incorrect\n") # แจ้งผู้ใช้ว่าล็อกอินไม่ถูกต้อง
                self.transport.write(self.loginPrompt)       # แสดง prompt สำหรับล็อกอินใหม่
                self.state = "User"                          # กลับไปยังสถานะ User เพื่อ login ใหม่
            
            # ครบจำนวน
            else:
                log.msg(f"Telnet: ครบ {self.required_login_attempts} ครั้งแล้ว. กำลังตรวจสอบล็อกอินจริง.")
                d = self.portal.login(creds, self.src_ip, ITelnetProtocol)
                d.addCallback(self._cbLogin)
                d.addErrback(self._ebLogin)
            # -------------------------

        # are we dealing with a real Telnet client?
        if self.transport.options:
            # stop ECHO
            # even if ECHO negotiation fails we still want to attempt a login
            # this allows us to support dumb clients which is common in malware
            # thus the addBoth: on success and on exception (AlreadyNegotiating)
            self.transport.wontChain(ECHO).addBoth(login)
        else:
            # process login
            login("")

        return "Discard"

    def telnet_Command(self, command):
        self.transport.protocol.dataReceived(command + b"\r")
        return "Command"

    def _cbLogin(self, ial):
        """
        Fired on a successful login
        """
        interface, protocol, logout = ial
        protocol.windowSize = self.windowSize
        self.protocol = protocol
        self.logout = logout
        self.state = "Command"

        self.transport.write(b"\n")
        
        # ========== เสริม =================
        # เก็บ username + password ที่ login สำเร็จไว้ใน users.txt
        userfile_path = "/home/cowrie/users.txt"
        try:
            write_user(userfile_path, self._last_success_username, self._last_success_password)
        except Exception as e:
            log.msg(f"Error writing login: {e}")
        
        # ========== จบ =================

        # Remove the short timeout of the login prompt.
        self.transport.setTimeout(
            CowrieConfig.getint("honeypot", "idle_timeout", fallback=300)
        )

        # replace myself with avatar protocol
        protocol.makeConnection(self.transport)
        self.transport.protocol = protocol

    def _ebLogin(self, failure):
        # TODO: provide a way to have user configurable strings for wrong password
        self.transport.wontChain(ECHO)
        self.transport.write(b"\nLogin incorrect\n")
        self.transport.write(self.loginPrompt)
        self.state = "User"

    def telnet_NAWS(self, data):
        """
        From TelnetBootstrapProtocol in twisted/conch/telnet.py
        """
        if len(data) == 4:
            width, height = struct.unpack("!HH", b"".join(data))
            self.windowSize = [height, width]
        else:
            log.msg("Wrong number of NAWS bytes")

    def enableLocal(self, option: bytes) -> bool:  # type: ignore
        if option == ECHO:
            return True
        # TODO: check if twisted now supports SGA (see git commit c58056b0)
        elif option == SGA:
            return False
        else:
            return False

    def enableRemote(self, option: bytes) -> bool:  # type: ignore
        # TODO: check if twisted now supports LINEMODE (see git commit c58056b0)
        if option == LINEMODE:
            return False
        elif option == NAWS:
            return True
        elif option == SGA:
            return True
        else:
            return False
