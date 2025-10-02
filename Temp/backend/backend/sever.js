import express from "express";
import cors from "cors";
import morgan from "morgan";
import { PrismaClient } from "@prisma/client";

import http from "http"; // web socket
import { Server } from "socket.io"; // web socket

const prisma = new PrismaClient();
const app = express();
const port = 3000;

// Middlewares
app.use(cors()); // Allows Cross Domains
app.use(morgan("dev")); // Show Logs
app.use(express.json()); // For read JSON

// Routing
import authRoute from "./routes/auth.js"
import honeypotRoute from './routes/honeypot.js'

app.use("/auth", authRoute);
app.use("/get", honeypotRoute);

// web socket ================================================================
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
io.on('connection', (socket) => {
  console.log('🟢 a client connected' , socket.id);

  socket.on('cowrie-get', async () => {
    const logs = await prisma.honeypot_logs.findMany({
      take: 10,
      orderBy: {
        id: 'desc'
      }, select: {
        id: true,
        timestamp: true,
        eventid: true,
        message: true,
        protocol: true,
        src_ip: true,
        src_port: true,
        duration: true,
      },
    });
    // console.log(logs);

    // 2. ส่งข้อความกลับไปยังทุก client
    socket.emit('cowrie-get-response', logs);
  });

  socket.on('disconnect', () => {
    console.log('🔴 client disconnected');
  });
});
// web socket ================================================================

server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`🚀 Server running at http://192.168.196.193:${port}`);
});
