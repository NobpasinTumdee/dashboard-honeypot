import express from "express";
import { PrismaClient } from "@prisma/client";
// ไม่ต้อง import verifyToken ที่นี่ เพราะเราจะใช้มันใน index.js ก่อนเข้าถึง route นี้
// import { verifyToken, verifyTokenAndAdmin } from '../middlewares/verifyToken.js';

const prisma = new PrismaClient();
const router = express.Router();

// GET all honeypot logs (requires admin)
router.get("/honeypot", async (req, res) => {
  // middleware verifyTokenAndAdmin จะถูกเรียกใช้ก่อนมาถึงตรงนี้
  // ดังนั้นเรามั่นใจได้ว่า req.user.isAdmin เป็น true
  try {
    const logs = await prisma.honeypot_logs.findMany({
      take: 10,
      orderBy: { id: 'desc' },
      select: {
        id: true, timestamp: true, eventid: true, message: true,
        protocol: true, src_ip: true, src_port: true,
        username: true, password: true, input: true, command: true, duration: true
      }
    });
    res.status(200).json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error fetching honeypot logs.");
  }
});

// GET all opencanary logs (can be accessed by any logged-in user)
router.get("/opencanary", async (req, res) => {
  // middleware verifyToken จะถูกเรียกใช้ก่อนมาถึงตรงนี้
  // ดังนั้นเรามั่นใจได้ว่าผู้ใช้มีการ authenticate แล้ว
  try {
    const limit = parseInt(req.query.limit) || 20;
    const logs = await prisma.opencanary_logs.findMany({
      take: limit,
      orderBy: { id: 'desc' },
      select: {
        id: true, local_time: true, src_host: true, dst_host: true,
        logdata_msg_logdata: true, logtype: true, full_json_line: true
      }
    });
    res.status(200).json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error fetching opencanary logs.");
  }
});

// GET a specific honeypot log by ID (requires admin)
router.get("/honeypot/:id", async (req, res) => {
  // req.user.isAdmin ถูกตรวจสอบโดย verifyTokenAndAdmin ก่อนหน้านี้
  try {
    const log = await prisma.honeypot_logs.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!log) {
      return res.status(404).json("Log not found.");
    }
    res.status(200).json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error fetching honeypot log.");
  }
});


export default router;