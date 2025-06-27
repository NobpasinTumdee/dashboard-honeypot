// จริงมันต้องใช้ const express = require('express'); แต่ว่าอยากให้มัน import หน้าตาเหมือนฝั่ง frontend เลยไปปรับ "type": "module", ในไฟล์ package.json
import express from "express";
import cors from "cors";
import morgan from "morgan";
import sqlite from "sqlite3"
const sqlite3 = sqlite.verbose(); // verbose ทำเพื่อให้มันแจ้ง log ไว้ดูบัค

const app = express();
const port = 3000; 

// Path ไปยังฐานข้อมูล SQLite ที่ Cowrie log importer สร้างไว้
const DB_PATH = '/home/cowrie/cowrie/var/log/cowrie/cowrie.db';


app.use(cors());
app.use(morgan("dev")); // Show Logs
// Middleware สำหรับการจัดการ JSON request body
app.use(express.json());

// เชื่อมต่อฐานข้อมูล SQLite
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error(`Could not connect to database: ${err.message}`);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Endpoint: ดึงข้อมูล Log ทั้งหมด
app.get('/api/logs', (req, res) => {
    const sql = 'SELECT * FROM honeypot_logs ORDER BY timestamp DESC LIMIT 100'; // ดึง 100 รายการล่าสุด
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: 'Success',
            data: rows
        });
    });
});

// Endpoint: ดึงข้อมูล Log ตาม ID
app.get('/api/logs/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM honeypot_logs WHERE id = ?';
    db.get(sql, [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ message: 'Log not found' });
            return;
        }
        res.json({
            message: 'Success',
            data: row
        });
    });
});

// Endpoint: ดึงข้อมูล Log ตาม Source IP
app.get('/api/logs/src_ip/:ip', (req, res) => {
    const { ip } = req.params;
    const sql = 'SELECT * FROM honeypot_logs WHERE src_ip = ? ORDER BY timestamp DESC';
    db.all(sql, [ip], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: 'Success',
            data: rows
        });
    });
});

// Endpoint: ค้นหา Log (ตัวอย่าง: ค้นหาคำใน message หรือ input)
app.get('/api/logs/search', (req, res) => {
    const { q } = req.query; // รับ query parameter 'q'
    if (!q) {
        return res.status(400).json({ message: 'Missing search query parameter "q"' });
    }
    const searchTerm = `%${q}%`;
    const sql = `
        SELECT * FROM honeypot_logs
        WHERE message LIKE ? OR input LIKE ? OR command LIKE ? OR username LIKE ? OR password LIKE ?
        ORDER BY timestamp DESC
        LIMIT 100
    `;
    db.all(sql, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: 'Success',
            data: rows
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`API Endpoints:`);
    console.log(`  - All logs (last 100): http://localhost:${port}/api/logs`);
    console.log(`  - Log by ID: http://localhost:${port}/api/logs/:id`);
    console.log(`  - Logs by Source IP: http://localhost:${port}/api/logs/src_ip/:ip`);
    console.log(`  - Search logs: http://localhost:${port}/api/logs/search?q=keyword`);
});

// ปิดฐานข้อมูลเมื่อแอปพลิเคชันปิด
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(`Error closing database: ${err.message}`);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});
