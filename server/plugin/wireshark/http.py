import pyshark
import sqlite3
import re
import urllib.parse
import base64
from datetime import datetime

# -----------------------------
# Config
# -----------------------------
interface = 'ztcfw2abid'
db_file = '/home/cpe27/HeneyPot.db'

# -----------------------------
# Create/connect SQLite DB
# -----------------------------
conn = sqlite3.connect(db_file)
c = conn.cursor()
c.execute('''
CREATE TABLE IF NOT EXISTS HttpsPackets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    src_ip TEXT,
    src_port TEXT,
    dst_ip TEXT,
    dst_port TEXT,
    method TEXT,
    request_uri TEXT,
    userAgent TEXT,
    info TEXT,
    risk_score INTEGER,
    reference_url TEXT
)
''')
conn.commit()

# -----------------------------
# Compile improved regex patterns
# -----------------------------
patterns = {
    "SQLi": re.compile(
        r"(?:')|(?:--)|(?:#)|(?:/\*)|union\s+(?:all\s+)?select|\b(?:or|and)\b\s+\d+=\d+",
        re.IGNORECASE
    ),
    "XSS": re.compile(
        r"(<script>|<img\s*[^>]*on\w+=|javascript:|<svg\s*on\w+=|%3Cscript%3E)",
        re.IGNORECASE
    ),
    "LFI": re.compile(
        r"(\.\./|\.\.\\|php://|input=|data:text/plain|%2e%2e/|%2e%2e\\)",
        re.IGNORECASE
    ),
    "RFI": re.compile(
        r"https?://|ftp://|gopher://|php://input",
        re.IGNORECASE
    ),
    "Command Injection": re.compile(
        r"[;|&`]|(\$\()|(\|\|)|\b(exec|system|passthru|shell_exec|popen)\b",
        re.IGNORECASE
    ),
    "Directory Traversal": re.compile(
        r"(\.\./|%2e%2e/|%2e%2e\\|/etc/passwd|/proc/self/|/windows/system32/)",
        re.IGNORECASE
    ),
    "Web Shell Upload": re.compile(
        r"\.(php[345]?|phtml|jsp|asp|aspx|cgi)$",
        re.IGNORECASE
    ),
}

# -----------------------------
# Pattern weights for risk score
# -----------------------------
pattern_weights = {
    "SQLi": 5,
    "Command Injection": 5,
    "Web Shell Upload": 5,
    "XSS": 3,
    "RFI": 3,
    "LFI": 3,
    "Directory Traversal": 3,
}

# -----------------------------
# Reference links mapping
# -----------------------------
attack_references = {
    "SQLi": "https://owasp.org/Top10/A03_2021-Injection/",
    "XSS": "https://owasp.org/www-community/attacks/xss/",
    "LFI": "https://owasp.org/www-community/attacks/Path_Traversal",
    "RFI": "https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/07-Input_Validation_Testing/11.2-Testing_for_Remote_File_Inclusion",
    "Command Injection": "https://owasp.org/www-community/attacks/Command_Injection",
    "Directory Traversal": "https://owasp.org/www-community/attacks/Path_Traversal",
    "Web Shell Upload": "https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/10-Business_Logic_Testing/09-Test_Upload_of_Malicious_Files"
}

# -----------------------------
# Function: detect attacks
# -----------------------------
def detect_attack(payload: str):
    info_list = []
    references = set()
    if not payload:
        return "", 0, ""

    # Debug original payload
    print("DEBUG ORIGINAL PAYLOAD:", payload)

    # Decode URL multiple times
    for _ in range(2):
        payload = urllib.parse.unquote(payload)
        payload = urllib.parse.unquote_plus(payload)

    # Decode Base64 if possible
    try:
        decoded = base64.b64decode(payload).decode('utf-8')
        payload += " " + decoded
    except Exception:
        pass

    # Debug final payload
    print("DEBUG DECODED PAYLOAD:", payload)

    # Check each attack pattern
    for attack, pattern in patterns.items():
        matches = pattern.findall(payload)
        if matches:
            for match in matches:
                matched_text = match if isinstance(match, str) else " ".join([m for m in match if m])
                info_list.append(f"{attack}: {matched_text}")
                if attack in attack_references:
                    references.add(attack_references[attack])

    score = compute_risk_score(info_list)
    reference_url = ", ".join(references)  # join multiple links if needed
    return "; ".join(info_list), score, reference_url

# -----------------------------
# Function: compute normalized risk score
# -----------------------------
def compute_risk_score(info_list):
    if not info_list:
        return 0
    scores = [pattern_weights.get(item.split(":")[0], 1) for item in info_list]
    total = sum(scores)
    normalized = min(total, 10)  # normalize to max 10
    return normalized

# -----------------------------
# Start LiveCapture
# -----------------------------
capture = pyshark.LiveCapture(
    interface=interface, 
    display_filter='http',
    custom_parameters=[ 
        "-o", "tls.keys_list:172.29.169.27,443,http,/etc/ssl/opencanary/opencanary.key"
    ]
    )
print("Starting LiveCapture on interface:", interface)

for pkt in capture.sniff_continuously():
    try:
        if 'HTTP' in pkt:
            src_ip = pkt.ip.src if hasattr(pkt, 'ip') else 'N/A'
            dst_ip = pkt.ip.dst if hasattr(pkt, 'ip') else 'N/A'
            if hasattr(pkt, 'tcp'):
                src_port = pkt.tcp.srcport
                dst_port = pkt.tcp.dstport
            else:
                src_port = dst_port = 'N/A'

            http_layer = pkt.http
            if hasattr(http_layer, 'request_method'):
                method = http_layer.request_method
                request_uri = getattr(http_layer, 'request_uri', '')
                userAgent = getattr(http_layer, 'user_agent', '')

                # combine payload
                payload_parts = [request_uri]
                if hasattr(http_layer, 'file_data'):
                    payload_parts.append(http_layer.file_data)
                for header_field in ['cookie', 'authorization', 'referer']:
                    val = getattr(http_layer, header_field, None)
                    if val:
                        payload_parts.append(val)
                full_payload = " ".join(payload_parts)

                # detect attacks
                info, risk_score, reference_url = detect_attack(full_payload)

                timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                print(f"[{timestamp}] {src_ip}:{src_port} -> {dst_ip}:{dst_port} {method} {request_uri} User-Agent: {userAgent} Info: {info} Risk: {risk_score} Reference: {reference_url}")

                # threshold alert example
                if risk_score >= 7:
                    print(f"HIGH RISK ALERT: {risk_score} - {info}")

                # insert into DB
                c.execute('''
                    INSERT INTO HttpsPackets (timestamp, src_ip, src_port, dst_ip, dst_port, method, request_uri, userAgent, info, risk_score, reference_url)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (timestamp, src_ip, src_port, dst_ip, dst_port, method, request_uri, userAgent, info, risk_score, reference_url))
                conn.commit()

    except Exception as e:
        print(f"Packet error: {e}")