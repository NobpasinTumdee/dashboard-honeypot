# เปิดใช้งาน AI
## เปิด AI Server
- เข้าไปที่โฟลเดอร์ llama.cpp ก่อน
```
cd /llama.cpp
```
- รันเซิร์ฟเวอร์
```
./build/bin/llama-server -m ./models/honeypot_llm_beta.gguf -c 2048 --host 0.0.0.0 --port 8080
```

## รัน AI โดยตรง
```
cd /llama.cpp
```
```
./build/bin/llama-cli -m ./models/honeypot_llm_beta.gguf --jinja
```

## ตำแหน่งไฟล์
- ตำแหน่งไฟล์โมเดล AI
```
/home/cpe27/llama.cpp/models/honeypot_llm_beta.gguf
```

- ตำแหน่งไฟล์ ai_local.py
```
/home/cowrie/cowrie/src/cowrie/commands/ai_local.py
```