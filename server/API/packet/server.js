const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
const port = 3100;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/api/logs', async (req, res) => {
    try {
        const logs = await prisma.HttpsPackets.findMany({
            orderBy: { id: 'desc' },
        });
        res.status(200).json(logs);
    } catch (error) {
        console.error('Error fetching logs via API:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// Socket.IO
io.on('connection', (socket) => {
    console.log('🟢 a client connected', socket.id);

    socket.on('requestlogs', async () => {
        try {
            const logs = await prisma.HttpsPackets.findMany({
                orderBy: { id: 'desc' },
            });
            socket.emit('Updatelogs', logs);
        } catch (error) {
            console.error('Error fetching honeypot logs via WebSocket:', error);
        }
    });

    const interval = setInterval(async () => {
        try {
            const logs = await prisma.HttpsPackets.findMany({
                orderBy: { id: 'desc' },
            });
            socket.emit('real-time', logs);
        } catch (error) {
            console.error('Error fetching real-time honeypot logs cowrie:', error);
        }
    }, 5000);

    socket.on('disconnect', () => {
        console.log('🔴 client disconnected');
        clearInterval(interval);
    });
});

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});