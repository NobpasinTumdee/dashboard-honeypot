import express from "express";
import cors from "cors";
import morgan from "morgan";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
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
import dataRoute from './routes/data.js';
import userRoute from './routes/user.js';
import { verifyToken } from './middlewares/verifyToken.js';

// API Routes
app.use("/auth", authRoute);
app.use("/user", verifyToken, userRoute);
app.use("/get", dataRoute);
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

// ==================
// ตัวเก็บขนาดของ array
// ==================
let CowrieCount = 0;
let OpenCanaryCount = 0;
let UserCount = 0;
try {
  const logs = await prisma.honeypot_logs.findMany({
    take: 1000,
  });
  CowrieCount = logs.length;
  console.log(`[+] Initial Cowrie logs Total: ${CowrieCount} [+]`);
} catch (error) {
  console.error('Error fetching Cowrie logs :', error);
}
try {
  const logs = await prisma.opencanary_logs.findMany({
    take: 1000,
  });
  OpenCanaryCount = logs.length;
  console.log(`[+] Initial OpenCanary logs Total: ${OpenCanaryCount} [+]`);
} catch (error) {
  console.error('Error fetching OpenCanary logs :', error);
}
try {
  const logs = await prisma.users.findMany();
  UserCount = logs.length;
  console.log(`[+] Initial User logs Total: ${UserCount} [+]`);
} catch (error) {
  console.error('Error fetching User logs :', error);
}



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
    if (user.Status !== 'Authenticated') {
      console.log('🚫 User is not admin for WebSocket connection.');
      return next(new Error('Authentication error: User is not admin'));
    }
    socket.user = user;
    console.log(`[Verified] User ${user.UserID} authenticated for WebSocket. [Verified]`);
    next();
  });
});

io.on('connection', (socket) => {
  console.log(`[+] A client connected [+] : ${socket.id} (User Name: ${socket.user.UserName}, Role: ${socket.user.Status})`);

  // ส่งข้อความต้อนรับเมื่อเชื่อมต่อสำเร็จ
  socket.emit('Welcome-Message', `Welcome, User ${socket.user.UserName}!`);




  // ====================================
  // Event handler สำหรับการดึง cowrie logs
  // ====================================
  const sendInitialCowrieLogs = async () => {
    try {
      const logs = await prisma.honeypot_logs.findMany({
        orderBy: { id: 'desc' },
        take: 1000,
      });
      // Update the CowrieCount with the initial number of logs
      CowrieCount = logs.length;
      socket.emit('Update-cowrie-logs', logs);
      console.log(`Initial Cowrie logs sent to ${socket.user.UserName}. Total: ${logs.length}`);
    } catch (error) {
      console.error('Error fetching initial Cowrie logs via WebSocket:', error);
      socket.emit('error', 'Failed to fetch initial Cowrie logs.');
    }
  };
  socket.on('request-cowrie-logs', sendInitialCowrieLogs);




  // ========================================
  // Event handler สำหรับการดึง logs opencanary
  // ========================================
  const sendInitialOpenCanaryLogs = async () => {
    try {
      const logs = await prisma.opencanary_logs.findMany({
        orderBy: { id: 'desc' },
        take: 1000,
      });
      // Update the OpenCanaryCount with the initial number of logs
      OpenCanaryCount = logs.length;
      socket.emit('Update-opencanary-logs', logs);
      console.log(`Initial OpenCanary logs sent to ${socket.user.UserName}. Total: ${logs.length}`);
    } catch (error) {
      console.error('Error fetching initial OpenCanary logs via WebSocket:', error);
      socket.emit('error', 'Failed to fetch initial OpenCanary logs.');
    }
  };
  socket.on('request-opencanary-logs', sendInitialOpenCanaryLogs);




  // ================================
  // Event handler สำหรับการดึงข้อมูลผู้ใช้
  // ================================
  const sendInitialUserLogs = async () => {
    try {
      const logs = await prisma.users.findMany();
      // Update the UserCount with the initial number of logs
      UserCount = logs.length;
      socket.emit('Update-users', logs);
      console.log(`Initial users logs sent to ${socket.user.UserName}. Total: ${logs.length}`);
    } catch (error) {
      console.error('Error fetching initial users logs via WebSocket:', error);
      socket.emit('error', 'Failed to fetch initial users logs.');
    }
  };
  socket.on('request-users', sendInitialUserLogs);









  // ================================================================================
  // Event handler สำหรับการดึง logs https packets
  socket.on('requestlogs', async () => {
    try {
      const logs = await prisma.HttpsPackets.findMany({
        orderBy: { id: 'desc' },
        take: 1000,
      });
      socket.emit('Updatelogs', logs);
    } catch (error) {
      console.error('Error fetching honeypot logs via WebSocket:', error);
    }
  });

  socket.on('request-time-series-logs', async () => {
    try {
      const logs = await prisma.TimeSeriesPackets.findMany({
        orderBy: { id: 'desc' },
        take: 1000,
      });
      socket.emit('Update-packet-overtime', logs);
    } catch (error) {
      console.error('Error fetching honeypot logs via WebSocket:', error);
    }
  });

  socket.on('request-protocol-logs', async () => {
    try {
      const logs = await prisma.ProtocolStats.findMany({
        orderBy: { id: 'desc' },
        take: 1000,
      });
      socket.emit('Update-protocol', logs);
    } catch (error) {
      console.error('Error fetching honeypot logs via WebSocket:', error);
    }
  });

  socket.on('request-source-ip-logs', async () => {
    try {
      const logs = await prisma.SrcIpStats.findMany({
        orderBy: { id: 'desc' },
        take: 1000,
      });
      socket.emit('Update-source-ip', logs);
    } catch (error) {
      console.error('Error fetching honeypot logs via WebSocket:', error);
    }
  });

  socket.on('request-dest-port-logs', async () => {
    try {
      const logs = await prisma.DstPortStats.findMany({
        orderBy: { id: 'desc' },
        take: 1000,
      });
      socket.emit('Update-dest-port', logs);
    } catch (error) {
      console.error('Error fetching honeypot logs via WebSocket:', error);
    }
  });
  // ================================================================================








  // ส่งข้อมูล Real-time
  const interval = setInterval(async () => {

    // real-time logs https packets
    try {
      const logs = await prisma.HttpsPackets.findMany({
        orderBy: { id: 'desc' },
        take: 1000,
      });
      socket.emit('real-time', logs);
    } catch (error) {
      console.error('Error fetching real-time honeypot logs http packets:', error);
    }

    try {
      const logs = await prisma.TimeSeriesPackets.findMany({
        orderBy: { id: 'desc' },
        take: 1000,
      });
      socket.emit('real-time-packet-stats', logs);
    } catch (error) {
      console.error('Error fetching real-time honeypot logs time series packets:', error);
    }

    try {
      const logs = await prisma.ProtocolStats.findMany({
        orderBy: { id: 'desc' },
        take: 1000,
      });
      socket.emit('real-time-protocol-stats', logs);
    } catch (error) {
      console.error('Error fetching real-time honeypot logs protocol stats:', error);
    }

    try {
      const logs = await prisma.SrcIpStats.findMany({
        orderBy: { id: 'desc' },
        take: 1000,
      });
      socket.emit('real-time-ip-stats', logs);
    } catch (error) {
      console.error('Error fetching real-time honeypot logs source ip stats:', error);
    }

    try {
      const logs = await prisma.DstPortStats.findMany({
        orderBy: { id: 'desc' },
        take: 1000,
      });
      socket.emit('real-time-port-stats', logs);
    } catch (error) {
      console.error('Error fetching real-time honeypot logs dest port stats:', error);
    }

  }, 5000);

  socket.on('disconnect', () => {
    console.log('[-] A client disconnected [-]');
    clearInterval(interval);
  });
});


setInterval(async () => {
  try {
    const logs = await prisma.honeypot_logs.findMany({
      orderBy: { id: 'desc' },
      take: 1000,
    });
    // Check if the number of logs has changed
    if (logs.length !== CowrieCount) {
      CowrieCount = logs.length;
      io.emit('real-time-cowrie', logs);
      console.log(`New Cowrie logs detected and sent. Total: ${logs.length}`);
    }
  } catch (error) {
    console.error('Error fetching real-time honeypot logs cowrie:', error);
  }

  try {
    const logs = await prisma.opencanary_logs.findMany({
      orderBy: { id: 'desc' },
      take: 1000,
    });
    // Check if the number of logs has changed
    if (logs.length !== OpenCanaryCount) {
      OpenCanaryCount = logs.length;
      io.emit('real-time-canary', logs);
      console.log(`New OpenCanary logs detected and sent. Total: ${logs.length}`);
    }
  } catch (error) {
    console.error('Error fetching real-time honeypot logs opencanary:', error);
  }

  try {
    const logs = await prisma.users.findMany();
    // Check if the number of logs has changed
    if (logs.length !== UserCount) {
      UserCount = logs.length;
      io.emit('real-time-users', logs);
      console.log(`New users logs detected and sent. Total: ${logs.length}`);
    }
  } catch (error) {
    console.error('Error fetching real-time users logs opencanary:', error);
  }
}, 500);


// web socket ================================================================

server.listen(port, () => {
  console.log(`🌐 Server running at http://localhost:${port}`);
  console.log(`🚀 Server zerotier running at http://172.29.169.27:${port}`);
});