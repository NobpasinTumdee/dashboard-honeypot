import express from "express";
import cors from "cors";
import morgan from "morgan";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken"; // สำหรับตรวจสอบ token ใน WebSocket middleware
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const app = express();
const port = 3000;

// Middlewares
app.use(cors()); // Allows Cross Domains
app.use(morgan("dev")); // Show Logs
app.use(express.json()); // For read JSON

// Import Routes
import authRoute from "./routes/auth.js";
import dataRoute from './routes/data.js'; // จะสร้างในขั้นตอนถัดไป
import {verifyToken} from './middlewares/verifyToken.js';

// API Routes
app.use("/auth", authRoute);
// ต้องมีการ verifyToken สำหรับทุก API route ที่ต้องการการป้องกัน
app.use("/data", verifyToken, dataRoute); // ตัวอย่าง: ต้องมี token เพื่อเข้าถึง /api/data

// Default route
app.get('/', (req, res) => {
    res.send('API Server is running!');
});

// web socket ================================================================

const server = http.createServer(app); // ใช้ app ของ Express ในการสร้าง HTTP server
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});


io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    console.log('🚫 No token provided for WebSocket connection.');
    return next(new Error('Authentication error: No token provided'));
  }

  jwt.verify(token, process.env.JWT_SEC, (err, user) => {
    if (err) {
      console.log('🚫 WebSocket Token verification failed:', err.message);
      return next(new Error('Authentication error: Invalid token'));
    }
    // เรายังคงเก็บข้อมูล user ไว้ใน socket object แม้ว่าจะไม่ใช้ isAdmin ในการตรวจสอบสิทธิ์การเข้าถึงข้อมูล
    socket.user = user;
    console.log(`✅ User ${user.UserID} authenticated for WebSocket.`);
    next();
  });
});

io.on('connection', (socket) => {
  // บรรทัดนี้ยังคงแสดง Role ได้ แต่ Role จะไม่มีผลต่อการเข้าถึงข้อมูล
  console.log(`🟢 A client connected: ${socket.id} (User ID: ${socket.user.UserID}, Role: ${socket.user.isAdmin ? 'Admin' : 'User'})`);

  // ส่งข้อความต้อนรับเมื่อเชื่อมต่อสำเร็จ
  socket.emit('initialMessage', `Welcome, User ID ${socket.user.UserID}!`);

  // Event handler สำหรับการดึง logs honeypot
  socket.on('requestHoneypotLogs', async (limit = 10) => {
    // *** ลบเงื่อนไข if (!socket.user.isAdmin) ออกไปแล้ว ***
    try {
      const logs = await prisma.honeypot_logs.findMany({
        take: parseInt(limit),
        orderBy: { id: 'desc' },
        select: {
          id: true, timestamp: true, eventid: true, message: true,
          protocol: true, src_ip: true, src_port: true,
          username: true, password: true, command: true
        }
      });
      socket.emit('honeypotLogsUpdate', logs);
    } catch (error) {
      console.error('Error fetching honeypot logs via WebSocket:', error);
      socket.emit('error', 'Failed to fetch honeypot logs.');
    }
  });

  // Event handler สำหรับการดึง logs opencanary
  socket.on('requestOpencanaryLogs', async (limit = 10) => {
    // *** ไม่มีเงื่อนไข isAdmin อยู่แล้วในส่วนนี้ ***
    try {
      const logs = await prisma.opencanary_logs.findMany({
        take: parseInt(limit),
        orderBy: { id: 'desc' },
        select: {
          id: true, local_time: true, src_host: true, dst_host: true,
          logdata_msg_logdata: true, logtype: true, full_json_line: true
        }
      });
      socket.emit('opencanaryLogsUpdate', logs);
    } catch (error) {
      console.error('Error fetching opencanary logs via WebSocket:', error);
      socket.emit('error', 'Failed to fetch opencanary logs.');
    }
  });

  // ส่งข้อมูล Real-time ทุกๆ X วินาที (ตัวอย่างสำหรับ Honeypot logs)
  const interval = setInterval(async () => {
    // *** ลบเงื่อนไข if (socket.user.isAdmin) ออกไปแล้ว ***
    try {
      const logs = await prisma.honeypot_logs.findMany({
        take: 5, // ดึง 5 ล่าสุด
        orderBy: { id: 'desc' },
        select: {
          id: true, timestamp: true, eventid: true, message: true,
          src_ip: true, username: true, password: true
        }
      });
      socket.emit('honeypotLogsUpdate', logs);
    } catch (error) {
      console.error('Error fetching real-time honeypot logs:', error);
    }
  }, 10000);

  socket.on('disconnect', () => {
    console.log('🔴 A client disconnected');
    clearInterval(interval);
  });
});
// web socket ================================================================

server.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});