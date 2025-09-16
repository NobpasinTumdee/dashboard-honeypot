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
    print(f"✅ Logged in as {client.user}")

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
