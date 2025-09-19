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
let HttpsPacketsCount = 0;
let TimeSeriesPacketsCount = 0;
let ProtocolStatsCount = 0;
let SrcIpStatsCount = 0;
let DstPortStatsCount = 0;
try {
  const logs = await prisma.honeypot_logs.findMany({
    take: 1000,
  });
  CowrieCount = logs.length;
  console.log(`[Initial] Cowrie logs Total: ${CowrieCount} `);
} catch (error) {
  console.error('Error fetching Cowrie logs :', error);
}
try {
  const logs = await prisma.opencanary_logs.findMany({
    take: 1000,
  });
  OpenCanaryCount = logs.length;
  console.log(`[Initial] OpenCanary logs Total: ${OpenCanaryCount} `);
} catch (error) {
  console.error('Error fetching OpenCanary logs :', error);
}
try {
  const logs = await prisma.users.findMany();
  UserCount = logs.length;
  console.log(`[Initial] User logs Total: ${UserCount} `);
} catch (error) {
  console.error('Error fetching User logs :', error);
}
try {
  const logs = await prisma.HttpsPackets.findMany({
    take: 1000,
  });
  HttpsPacketsCount = logs.length;
  console.log(`[Initial] HttpsPackets logs Total: ${HttpsPacketsCount} `);
} catch (error) {
  console.error('Error fetching HttpsPackets logs :', error);
}
try {
  const logs = await prisma.TimeSeriesPackets.findMany({
    take: 1000,
  });
  TimeSeriesPacketsCount = logs.length;
  console.log(`[Initial] TimeSeriesPackets logs Total: ${TimeSeriesPacketsCount} `);
} catch (error) {
  console.error('Error fetching TimeSeriesPackets logs :', error);
}
try {
  const logs = await prisma.ProtocolStats.findMany({
    take: 1000,
  });
  ProtocolStatsCount = logs.length;
  console.log(`[Initial] ProtocolStats logs Total: ${ProtocolStatsCount} `);
} catch (error) {
  console.error('Error fetching ProtocolStats logs :', error);
}
try {
  const logs = await prisma.SrcIpStats.findMany({
    take: 1000,
  });
  SrcIpStatsCount = logs.length;
  console.log(`[Initial] SrcIpStats logs Total: ${SrcIpStatsCount} `);
} catch (error) {
  console.error('Error fetching SrcIpStats logs :', error);
}
try {
  const logs = await prisma.DstPortStats.findMany({
    take: 1000,
  });
  DstPortStatsCount = logs.length;
  console.log(`[Initial] DstPortStats logs Total: ${DstPortStatsCount} `);
} catch (error) {
  console.error('Error fetching DstPortStats logs :', error);
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




  // ===========================================
  // Event handler สำหรับการดึง logs https packets
  // ===========================================
  const sendInitialHttpsPacketsLogs = async () => {
    try {
      const logs = await prisma.HttpsPackets.findMany({
        orderBy: { id: 'desc' },
        take: 1000,
      });
      HttpsPacketsCount = logs.length;
      socket.emit('Updatelogs', logs);
      console.log(`Initial HttpsPackets logs sent to ${socket.user.UserName}. Total: ${logs.length}`);
    } catch (error) {
      console.error('Error fetching initial HttpsPackets logs via WebSocket:', error);
      socket.emit('error', 'Failed to fetch initial HttpsPackets logs.');
    }
  };
  socket.on('requestlogs', sendInitialHttpsPacketsLogs);




  // =========================================
  // Event handler สำหรับการดึง logs time-series
  // =========================================
  const sendInitialTimeSeriesPacketsLogs = async () => {
    try {
      const logs = await prisma.TimeSeriesPackets.findMany({
        orderBy: { id: 'desc' },
        take: 1000,
      });
      TimeSeriesPacketsCount = logs.length;
      socket.emit('Update-packet-overtime', logs);
      console.log(`Initial TimeSeriesPackets logs sent to ${socket.user.UserName}. Total: ${logs.length}`);
    } catch (error) {
      console.error('Error fetching initial TimeSeriesPackets logs via WebSocket:', error);
      socket.emit('error', 'Failed to fetch initial TimeSeriesPackets logs.');
    }
  };
  socket.on('request-time-series-logs', sendInitialTimeSeriesPacketsLogs);




  // ===========================================
  // Event handler สำหรับการดึง logs ProtocolStats
  // ===========================================
  const sendInitialProtocolStatsLogs = async () => {
    try {
      const logs = await prisma.ProtocolStats.findMany({
        orderBy: { id: 'desc' },
        take: 1000,
      });
      ProtocolStatsCount = logs.length;
      socket.emit('Update-protocol', logs);
      console.log(`Initial ProtocolStats logs sent to ${socket.user.UserName}. Total: ${logs.length}`);
    } catch (error) {
      console.error('Error fetching initial ProtocolStats logs via WebSocket:', error);
      socket.emit('error', 'Failed to fetch initial ProtocolStats logs.');
    }
  };
  socket.on('request-protocol-logs', sendInitialProtocolStatsLogs);




  // ===================================
  // Event handler สำหรับการดึง SrcIpStats
  // ===================================
  const sendInitialSrcIpStatsLogs = async () => {
    try {
      const logs = await prisma.SrcIpStats.findMany({
        orderBy: { id: 'desc' },
        take: 1000,
      });
      SrcIpStatsCount = logs.length;
      socket.emit('Update-source-ip', logs);
      console.log(`Initial SrcIpStats logs sent to ${socket.user.UserName}. Total: ${logs.length}`);
    } catch (error) {
      console.error('Error fetching initial SrcIpStats logs via WebSocket:', error);
      socket.emit('error', 'Failed to fetch initial SrcIpStats logs.');
    }
  };
  socket.on('request-source-ip-logs', sendInitialSrcIpStatsLogs);




  // =====================================
  // Event handler สำหรับการดึง DstPortStats
  // =====================================
  const sendInitialDstPortStatsLogs = async () => {
    try {
      const logs = await prisma.DstPortStats.findMany({
        orderBy: { id: 'desc' },
        take: 1000,
      });
      DstPortStatsCount = logs.length;
      socket.emit('Update-dest-port', logs);
      console.log(`Initial DstPortStats logs sent to ${socket.user.UserName}. Total: ${logs.length}`);
    } catch (error) {
      console.error('Error fetching initial DstPortStats logs via WebSocket:', error);
      socket.emit('error', 'Failed to fetch initial DstPortStats logs.');
    }
  };
  socket.on('request-dest-port-logs', sendInitialDstPortStatsLogs);

  socket.on('disconnect', () => {
    console.log('[-] A client disconnected [-]');
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
    console.error('Error fetching real-time users :', error);
  }

  try {
    const logs = await prisma.HttpsPackets.findMany({
      orderBy: { id: 'desc' },
      take: 1000,
    });
    if (logs.length !== HttpsPacketsCount) {
      HttpsPacketsCount = logs.length;
      io.emit('real-time', logs);
      console.log(`New HttpsPackets logs detected and sent. Total: ${logs.length}`);
    }
  } catch (error) {
    console.error('Error fetching real-time honeypot logs HttpsPackets:', error);
  }
}, 500);

setInterval(async () => {
  try {
    const logs = await prisma.TimeSeriesPackets.findMany({
      orderBy: { id: 'desc' },
      take: 1000,
    });
    if (logs.length !== TimeSeriesPacketsCount) {
      TimeSeriesPacketsCount = logs.length;
      io.emit('real-time-packet-stats', logs);
      console.log(`New TimeSeriesPackets logs detected and sent. Total: ${logs.length}`);
    }
  } catch (error) {
    console.error('Error fetching real-time honeypot logs TimeSeriesPackets:', error);
  }

  try {
    const logs = await prisma.ProtocolStats.findMany(
      {
        orderBy: { id: 'desc' },
        take: 1000,
      }
    );
    if (logs.length !== ProtocolStatsCount) {
      ProtocolStatsCount = logs.length;
      io.emit('real-time-protocol-stats', logs);
      console.log(`New ProtocolStats logs detected and sent. Total: ${logs.length}`);
    }
  } catch (error) {
    console.error('Error fetching real-time honeypot logs ProtocolStats:', error);
  }

  try {
    const logs = await prisma.SrcIpStats.findMany({
      orderBy: { id: 'desc' },
      take: 1000,
    });
    if (logs.length !== SrcIpStatsCount) {
      SrcIpStatsCount = logs.length;
      io.emit('real-time-ip-stats', logs);
      console.log(`New SrcIpStats logs detected and sent. Total: ${logs.length}`);
    }
  } catch (error) {
    console.error('Error fetching real-time honeypot logs SrcIpStats:', error);
  }

  try {
    const logs = await prisma.DstPortStats.findMany({
      orderBy: { id: 'desc' },
      take: 1000,
    });
    if (logs.length !== DstPortStatsCount) {
      DstPortStatsCount = logs.length;
      io.emit('real-time-port-stats', logs);
      console.log(`New DstPortStats logs detected and sent. Total: ${logs.length}`);
    }
  } catch (error) {
    console.error('Error fetching real-time honeypot logs DstPortStats:', error);
  }
}, 5000);


// web socket ================================================================

server.listen(port, () => {
  console.log(`🌐 Server running at http://localhost:${port}`);
  console.log(`🚀 Server zerotier running at http://172.29.169.27:${port}`);
});