# path /home/cowrie/cowrie/src/cowrie/telnet/userauth.py
"""
Telnet Transport and Authentication for the Honeypot

@author: Olivier Bilodeau <obilodeau@gosecure.ca>
"""

# Original import 
from __future__ import annotations
import struct
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


# Develop import
import ast
import random
import os
import time
import datetime
import subprocess
import shutil
import json
import uuid
from pathlib import Path
import pickle

from twisted.internet import reactor
from cowrie.shell import fs
from cowrie.shell import server


# การเก็บ log json แบบ manual
cowrie_json_path = Path("/home/cowrie/cowrie/var/log/cowrie/cowrie_custom.json")


def append_to_cowrie_json(payload: dict):

    # ตรวจสอบและสร้าง หากยังไม่มี
    directory = os.path.dirname(cowrie_json_path)
    if not os.path.exists(directory):
        os.makedirs(directory)

    # เขียนข้อมูลลงในไฟล์
    with open(cowrie_json_path, "a", encoding="utf-8") as f:
        f.write(json.dumps(payload, ensure_ascii=False) + "\n")

# def create_payload(message: str, src_ip: str = None, session_id: str = None, eventid: str = "cowrie.custom.event"):
#     """
#     สร้าง log payload แบบ custom
#     """
#     payload = {
#         "eventid": eventid,
#         "timestamp": datetime.datetime.utcnow().replace(microsecond=0).isoformat() + "Z",
#         "src_ip": src_ip,
#         "session": session_id,
#         "message": message,
#     }
#     append_to_cowrie_json(payload)

def create_payload(message: str, transport=None, session_id: str = None, eventid: str = "cowrie.custom.event"):
    """
    สร้าง log payload แบบ custom สำหรับ Telnet และ SSH
    """
    src_ip = src_port = dst_ip = dst_port = None

    try:
        if transport:
            peer = transport.getPeer()
            host = transport.getHost()
            src_ip, src_port = getattr(peer, "host", None), getattr(peer, "port", None)
            dst_ip, dst_port = getattr(host, "host", None), getattr(host, "port", None)
    except Exception as e:
        log.msg(f"Error getting transport info: {e}")

    payload = {
        "eventid": eventid,
        "timestamp": datetime.datetime.utcnow().replace(microsecond=0).isoformat() + "Z",
        "src_ip": src_ip,
        "src_port": src_port,
        "dst_ip": dst_ip,
        "dst_port": dst_port,
        "session": session_id,
        "protocol": "telnet",
        "message": message,
    }
    append_to_cowrie_json(payload)

# ฟังก์ชันการหน่วงเวลาตอบสนอง
def random_delay(min_delay, max_delay):
    delay_time = random.uniform(min_delay, max_delay)
    reactor.callLater(delay_time, lambda: None)
    
def random_delay_and_call(min_delay, max_delay, callable_function, *args):
    delay_time = random.uniform(min_delay, max_delay)
    reactor.callLater(delay_time, callable_function, *args)

# ฟังก์ชันแปลง str ให้อยู่ในรูปทั่วไป
def normalize(val):
    if isinstance(val, bytes):
        return val.decode(errors="ignore").strip()
    return str(val).strip()

# ฟังก์ชันบันทึก username,password
def write_user(filename, username, password):
    def to_str(val):
        return val.decode() if isinstance(val, bytes) else str(val)

    u, p = to_str(username), to_str(password)

    try:
        with open(filename, 'r') as f:
            content = f.read().strip()
            if content:
                users = ast.literal_eval(content)
                # เผื่อกรณีไฟล์ไม่ใช่ list
                if not isinstance(users, list):
                    users = []
            else:
                users = []
    except (FileNotFoundError, SyntaxError, ValueError):
        users = []

    # ป้องกันการซ้ำ 
    if (u, p) not in users:
        users.append((u, p))
        with open(filename, 'w') as f:
            f.write(str(users))


# ฟังก์ชัน ตรวจสอบ password เก่า
def password_old(filename, password):
    
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

# ค้นหา (username,password) ใน users.txt ที่มีชื่อตรงกับที่ login
def get_user_entry(filename, username):
        def to_str(val):
            return val.decode() if isinstance(val, bytes) else str(val)
        try:
            with open(filename, 'r') as f:
                content = f.read().strip()
                if content:
                    users = ast.literal_eval(content)
                    for entry in users:
                        if len(entry) > 1 and to_str(entry[0]) == to_str(username):
                            return entry
        except (FileNotFoundError, SyntaxError, ValueError):
            return None
        return None
    

class HoneyPotTelnetAuthProtocol(AuthenticatingTelnetProtocol):
    """
    TelnetAuthProtocol that takes care of Authentication. Once authenticated this
    protocol is replaced with HoneyPotTelnetSession.
    """

    loginPrompt = b"login: "
    passwordPrompt = b"Password: "
    windowSize: list[int]

    def connectionMade(self):
        
        self.windowSize = [40, 80]
        self.transport.write(self.factory.banner.replace(b"\n", b"\r\r\n"))
        self.transport.write(self.loginPrompt)
        
        # เพิ่มการบังคับ login ตามจำนวนครั้ง
        self.login_attempts_made = 0                        
        self.required_login_attempts = random.randint(5, 10) 

        message = "จำนวนครั้งที่ต้อง login = " + str(self.required_login_attempts)
        # try: 
        #     create_payload(message, self.transport.getPeer().host, session_id="", eventid="cowrie.custom.login")
        # except Exception as e:
        #     log.msg(f"Error logging attempt to cowrie.json: {e}")
        try:
            create_payload(
                message,
                transport=self.transport,
                session_id=getattr(self, 'session', None),
                eventid="cowrie.custom.login"
            )
        except Exception as e:
            log.msg(f"Error logging attempt to cowrie.json: {e}")
        

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
        # self.transport.write(self.passwordPrompt)
        
        # เพิ่มการหน่วงเวลาแสดงการกรอก password
        random_delay_and_call(0.3, 1.0, self.transport.write, self.passwordPrompt)
        
        return "Password"

    def telnet_Password(self, line):
        username, password = self.username, line  # .decode()
        
        # username,password ที่คาดว่าจะเก็บ
        self._last_success_username = username      
        self._last_success_password = password
        
        del self.username

        def login(ignored):
            self.src_ip = self.transport.getPeer().host
            creds = UsernamePasswordIP(username, password, self.src_ip)
            
            userfile_path = "/home/cowrie/users.txt"
                
            username_data = get_user_entry(userfile_path, username)         # username เก่า
            password_status = password_old(userfile_path, password)         # password เก่า
            
            # หากเป็น login ด้วย username เก่า
            if username_data:
                
                # หาก login ด้วย password ที่ถูกต้อง
                if normalize(username_data[1]) == normalize(password):
                    self.login_attempts_made = self.required_login_attempts
                    log.msg("Telnet: username/password ตรงกับที่เคยใช้แล้ว")
                    
                # หากไม่ = ไม่ให้ผ่าน    
                else:
                    self.login_attempts_made = 0
                    log.msg("Telnet: username นี้มีอยู่แล้ว แต่ password ไม่ตรง รีเซ็ตจำนวนครั้ง login")
                    self.transport.wontChain(ECHO)
                                
                    # เพิ่มการหน่วงเวลา ล็อกอินไม่ผ่าน
                    random_delay_and_call(0.3, 0.5, self.transport.write, b"\nLogin incorrect\n")
                    random_delay_and_call(0.3, 0.5, self.transport.write, self.loginPrompt)
                    
                    self.state = "User"
                    return
                
            # หาก login ด้วย password ที่มี
            elif password_status:
                self.login_attempts_made = self.required_login_attempts
                log.msg("Telnet: password นี้เคยถูกใช้แล้ว แต่ username ไม่เคยใช้")
                
                
            # หาก login ด้วย username,password ใหม่  
            else:
                self.login_attempts_made += 1
                log.msg(f"Telnet: พยายามล็อกอินครั้งที่ {self.login_attempts_made}/{self.required_login_attempts}")

            
            # ตรวจสอบจำนวนครั้งที่พยายามล็อกอิน
            if self.login_attempts_made < self.required_login_attempts:
                
                log.msg(f"Telnet: ยังต้องการการล็อกอินอีก {self.required_login_attempts - self.login_attempts_made} ครั้ง.") 
                self.transport.wontChain(ECHO)               # ปิด ECHO เพื่อไม่ให้แสดงข้อความล็อกอิน
                random_delay(0.3,0.5)
                self.transport.write(b"\nLogin incorrect\n") # แจ้งผู้ใช้ว่าล็อกอินไม่ถูกต้อง
                random_delay(0.3,0.5)
                self.transport.write(self.loginPrompt)       # แสดง prompt สำหรับล็อกอินใหม่
                self.state = "User"                          # กลับไปยังสถานะ User เพื่อ login ใหม่
            else:
                log.msg(f"Telnet: ครบ {self.required_login_attempts} ครั้งแล้ว")

                def do_real_login():
                    d = self.portal.login(creds, self.src_ip, ITelnetProtocol)
                    d.addCallback(self._cbLogin)
                    d.addErrback(self._ebLogin)
                
                random_delay_and_call(0.3, 0.5, do_real_login)
            

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
        
        
        # เก็บ username,password ที่ login สำเร็จ
        userfile_path = "/home/cowrie/users.txt"
        try:
            write_user(userfile_path, self._last_success_username, self._last_success_password)
        except Exception as e:
            log.msg(f"Error writing login: {e}")

        
        # เพิ่มการหน่วงเวลา
        def continue_after_delay():
            self.transport.write(b"$ ")  # แสดง prompt ถัดไป

            # Remove the short timeout of the login prompt.
            self.transport.setTimeout(
                CowrieConfig.getint("honeypot", "idle_timeout", fallback=300)
            )

            # replace myself with avatar protocol
            protocol.makeConnection(self.transport)
            self.transport.protocol = protocol

        
        random_delay_and_call(1.0, 1.5, continue_after_delay)

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
