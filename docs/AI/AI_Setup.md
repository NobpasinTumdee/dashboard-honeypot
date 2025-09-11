# ติดตั้ง Llama.cpp (เครื่องยนต์ AI)
llama.cpp คือโปรแกรมที่จะใช้รันโมเดล .gguf ของเราบน CPU ของ Raspberry Pi

## ติดตั้งเครื่องมือที่จำเป็น
```
sudo apt update
sudo apt install build-essential cmake libcurl4-openssl-dev curl 
```

## ดาวน์โหลดและคอมไพล์ Llama.cpp
```
git clone https://github.com/ggerganov/llama.cpp.git
cd llama.cpp
```
```
cmake -B build
```
```
cmake --build build --config Release
```