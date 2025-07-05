# Get Started



## set up dashboard
### ติดตั้งเครื่องมือที่ใช้
```
npm install
```

### เปิดใช้งานหน้า dashboard
```
npm run dev
```

### เสริม
#### ถ้าต้องการให้เครื่องที่รันเป็น host ทำให้อุปกรณ์อื่นในวง LAN สามารถเข้าถึงหน้าเว็ปและข้อมูลจาก back end ได้ให้ทำดังนี้

* [file config](/DashboardV2/src/serviceApi/index.tsx)
#### ให้เปลี่ยน apiUrl จาก localhost ให้เป็น ip ของอุปกรณ์ อาจใช้ คำสั่ง
```
ipconfig
```
หรือ
```
ip a
```
Wireless LAN adapter Wi-Fi --> IPv4 Address



## set up back end
### ติดตั้งเครื่องมือที่ใช้
```
npm install cors morgan nodemon sqlite3
```
### prisma
```
npm install prisma
```
```
npm install @prisma/client
```

# สำคัญ สร้าง ไฟล์ .env ในโฟล์เดอร์
* [.env file](/sever/API/CowrieAPI/)

### ข้างในไฟล์ .env ต้องใส่ path ของ Database เพื่อรักษาความลับของที่อยู่ของข้อมูล
#### วางบรรทัดนี้ (ตัวอย่าง)
```
DATABASE_URL="file:C:\Users\ACER\Documents\GitHub\dashboard-honeypot\sever\API\CowrieAPI\HeneyPot.db"
```

### ให้ prisma ดึงข้อมูลฐานข้อมูล
```
npx prisma db pull
```
```
npx prisma generate
```

### เปิดใช้งาน backend
```
npm run dev
```
เป็นคำสั่งสำหรับดูข้อมูลใน database โดยที่ไม่จำเป็นต้อง เปิดหน้า web
```
npx prisma studio
```

## set up ตัวแปลงไฟล์ log json --> db
* [Honeypot processor.py](/sever/Honeypot_Log_Processor.py)

### ควรย้ายไฟล์ โปแกรมนี้ไปไว้ในที่ปลอดภัยและตั้ง path ที่อยู่ log json --> db
#### จากนั้น run 
```
python3 .\Log_Processor.py
```
