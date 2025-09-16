## คู่มือการใช้งานระบบตรวจสอบ IP / Nmap + Discord Bot + Google Sheets

### ระบบนี้ประกอบด้วย:
1. แปลง Log `src_ip` → Nmap scan → JSON / CSV  
2. Import CSV เข้า Google Sheets  
3. สร้าง Google Apps Script เพื่อเชื่อม Discord Webhook  
4. สร้าง Discord Bot เพื่อส่งข้อความไปยัง Apps Script  
5. รัน Discord Bot บน Raspberry Pi  

---

## 1. แปลง Log `src_ip` → Nmap → CSV


### ตัวอย่างสคริปต์ Python: `nmap_srcIPJson.py`
```python
# -*- coding: utf-8 -*-
import json
import subprocess
import csv
import os

def scan_ips_and_save(input_file, output_file):
    """
    Reads a JSON file, extracts unique 'src_ip' values,
    runs nmap on each IP, and saves the results to a new JSON file.
    Also writes the same results to a CSV file (same base name as output_file).

    Args:
        input_file (str): The path to the input JSON file (e.g., 'cowrie.json').
        output_file (str): The path to the output JSON file (e.g., 'ScanSrc.json').
    """

    unique_ips = set()
    scan_results = []

    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    data = json.loads(line)
                    if 'src_ip' in data:
                        unique_ips.add(data['src_ip'])
                except json.JSONDecodeError as e:
                    print(f"Error decoding JSON on line: {line.strip()}. Error: {e}")
        
        print(f"Found {len(unique_ips)} unique IPs to scan.")

    except FileNotFoundError:
        print(f"Error: The file '{input_file}' was not found. Please check the path.")
        return

    for ip in unique_ips:
        print(f"Scanning IP: {ip} with nmap...")
        try:
            nmap_command = ["nmap", "-p", "22", "--script", "vuln", ip]
            result = subprocess.run(
                nmap_command,
                capture_output=True,
                text=True,
                check=True,
                timeout=300
            )
            scan_results.append({
                "src_ip": ip,
                "nmap_scan": result.stdout
            })
            print(f"Scan for {ip} completed successfully.")
        except subprocess.CalledProcessError as e:
            error_message = f"Error running nmap: {e.stderr.strip()}"
            print(f"Scan for {ip} failed. Error: {error_message}")
            scan_results.append({
                "src_ip": ip,
                "nmap_scan": error_message
            })
        except subprocess.TimeoutExpired:
            timeout_message = "Error: Nmap scan timed out."
            print(f"Scan for {ip} timed out.")
            scan_results.append({
                "src_ip": ip,
                "nmap_scan": timeout_message
            })
        except Exception as e:
            generic_error_message = f"An unexpected error occurred: {e}"
            print(f"Scan for {ip} encountered an unexpected error: {e}")
            scan_results.append({
                "src_ip": ip,
                "nmap_scan": generic_error_message
            })

    # Write JSON as before
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(scan_results, f, ensure_ascii=False, indent=4)
        print(f"Results saved to '{output_file}' successfully.")
    except IOError as e:
        print(f"Error writing to file '{output_file}': {e}")
        # If JSON writing fails, still attempt CSV below (optional)

    # Also write CSV (same base name, .csv)
    try:
        base, ext = os.path.splitext(output_file)
        csv_file = f"{base}.csv"

        # Use newline='' to avoid extra blank lines on Windows
        with open(csv_file, 'w', newline='', encoding='utf-8') as csvf:
            writer = csv.writer(csvf, quoting=csv.QUOTE_MINIMAL)
            # header
            writer.writerow(["src_ip", "nmap_scan"])
            for row in scan_results:
                # Ensure nmap_scan remains as a single CSV cell (contains newlines)
                writer.writerow([row.get("src_ip", ""), row.get("nmap_scan", "")])

        print(f"CSV results saved to '{csv_file}' successfully.")
    except IOError as e:
        print(f"Error writing CSV file: {e}")


if __name__ == "__main__":
    input_file_name = '/home/cowrie/cowrie/var/log/cowrie/cowrie.json'
    output_file_name = 'ScanSrc.json'
    scan_ips_and_save(input_file_name, output_file_name)

```

-   รัน: `python3 nmap_srcIPJson.py`
-   Output → `ScanSrc.csv`

----------

## 2. Import CSV เข้า Google Sheets

1.  สร้าง Google Sheet ใหม่
  
2.  เลือก **File → Import → Upload CSV**
    
3.  เลือก Sheet ใหม่ → คลิก **Import Data**
    

-   Column A: `src_ip`
    
-   Column B: `nmap_scan`

----------

## 3. สร้าง Google Apps Script

1.  Google Sheets → **Extensions → Apps Script**
    
2.  วางโค้ดตัวอย่าง:

```javascript
function doPost(e) {
  try {
    // ข้อมูลจาก Discord (Content-Type: application/json)
    var data = JSON.parse(e.postData.contents);

    // ดึงข้อความที่ user พิมพ์มา
    var content = data.content ? data.content.trim() : "";
    var ipRegex = /(\d{1,3}\.){3}\d{1,3}/;
    var match = content.match(ipRegex);

    var replyMsg = "กรุณาส่ง IP ที่ถูกต้อง เช่น 192.168.1.10";

    if (match) {
      var src_ip = match[0];

      // เปิดชีต
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
      var values = sheet.getDataRange().getValues();

      replyMsg = "ไม่พบข้อมูลสำหรับ IP: " + src_ip;

      for (var i = 1; i < values.length; i++) {
        if (values[i][0] == src_ip) {
          replyMsg = "IP: " + values[i][0] + "\nScan: " + values[i][1];
          break;
        }
      }
    }

    // ส่งกลับไปที่ Discord webhook
    var discordWebhookUrl = "[discord web hooks url]";
    var payload = {
      content: replyMsg
    };

    UrlFetchApp.fetch(discordWebhookUrl, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload)
    });

    return ContentService.createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

```
3.  อยากทดสอบว่ารันได้หรือไม่ให้ใช้คำสั่งนี้:
```
curl -X POST -H "Content-Type: application/json" -d '{"content":"127.0.0.1"}' "[ Apps Script google sheets]"
```


3.  **Deploy → New Deployment → Web app**
    
    -   Execute as: **Me**
        
    -   Who has access: **Anyone**
        

-   Copy URL → ใช้ใน Python Bot

----------

## 4. สร้าง Discord Bot

1.  เข้า [Discord Developer Portal](https://discord.com/developers/applications)
    
2.  **New Application** → ตั้งชื่อ
    
3.  ไปที่ **Bot → Add Bot**
    
4.  เปิด **Privileged Gateway Intents → MESSAGE CONTENT INTENT**
    
5.  Copy **Bot Token**
    

----------

## 5. เชิญบอทเข้า Server

1.  Discord Developer Portal → OAuth2 → URL Generator
    
2.  Scopes → `bot`
    
3.  Permissions → `Read Messages/View Channels`, `Send Messages`
    
4.  Copy URL → เปิด browser → เชิญบอทเข้า server

----------

## 6. โค้ด Discord Bot (Python)
-   ติดตั้ง
```
sudo apt install python3-discord
```
-   สร้างโฟลเดอร์ใหม่
```
mkdir ~/discord-bot && cd ~/discord-bot
```
-   สร้างไฟล์ python
```
nano bot.py
```
```python
import discord
import requests
import os

# ===== CONFIG =====
TOKEN = "[Bot Token]"  # Bot Token
APP_SCRIPT_URL = "[Apps Script URL]"  # URL Apps Script
DISCORD_WEBHOOK_URL = "[Discord Webhook URL]"  # Webhook URL ที่ให้ไว้

intents = discord.Intents.default()
intents.messages = True
intents.message_content = True

client = discord.Client(intents=intents)

TARGET_CHANNEL_ID = 1417583313287385238 # <-- ใส่ ID ของ channel ที่ต้องการ

@client.event
async def on_ready():
    print(f"[+] Logged in as {client.user}")

@client.event
async def on_message(message):
    if message.author.bot:
        return  # ไม่ตอบกลับบอทด้วยกัน

    if message.channel.id != TARGET_CHANNEL_ID:
        return  # ข้าม channel อื่น

    content = message.content.strip()
    if content:
        try:
            # ส่งข้อความไป Apps Script
            payload = {"content": content}
            r = requests.post(APP_SCRIPT_URL, json=payload, timeout=10)

            # ส่งผลลัพธ์กลับ Discord (ผ่าน Webhook)
            reply = r.text if r.status_code == 200 else f"Error: {r.status_code}"
            requests.post(DISCORD_WEBHOOK_URL, json={"content": reply})

        except Exception as e:
            requests.post(DISCORD_WEBHOOK_URL, json={"content": f"Bot error: {e}"})

client.run(TOKEN)

```
- run python
```
python3 bot.py
```
----------