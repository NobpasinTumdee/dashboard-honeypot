// const express = require('express')
// const app = express()
// const port = 3000

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })


const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // กำหนดจำนวนข้อมูลที่ต้องการเพิ่ม
    const numberOfPackets = 10;
    
    // เริ่มต้นการวนลูปเพื่อสร้างและเพิ่มข้อมูล
    for (let i = 0; i < numberOfPackets; i++) {
      const newPacket = await prisma.httpsPackets.create({
        data: {
          timestamp: new Date().toISOString(),
          src_ip: `192.168.1.10${i}`, // เปลี่ยน IP เล็กน้อยในแต่ละลูป
          src_port: '54321',
          dst_ip: '104.20.25.105',
          dst_port: '443',
          method: 'GET',
          request_uri: `/homepage/${i}`, // เปลี่ยน URI เล็กน้อยในแต่ละลูป
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });

      console.log(`Successfully inserted packet #${i + 1}:`);
      console.log(newPacket);
    }
    
    console.log(`\nAll ${numberOfPackets} packets have been inserted.`);

  } catch (e) {
    console.error('An error occurred while inserting data:', e);
  } finally {
    // ปิดการเชื่อมต่อเมื่อการทำงานเสร็จสิ้น
    await prisma.$disconnect();
  }
}

main();
