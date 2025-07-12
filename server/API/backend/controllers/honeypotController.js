import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()


// GET /logs - ดึงข้อมูลทั้งหมดจาก honeypot_logs
export const cowrie = async (req, res, next) => {
    try {
        const logs = await prisma.honeypot_logs.findMany();
        res.json(logs);
    } catch (error) {
        console.error("❌ Error fetching logs:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


// GET /logs - ดึงข้อมูลแค่ 10 row จาก honeypot_logs
export const cowrie10 = async (req, res, next) => {
    try {
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
            // where: {
            //     protocol: {not: null}
            // }
        });
        res.json(logs);
    } catch (error) {
        console.error("❌ Error fetching logs:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// opencanary
export const opencanary = async (req, res, next) => {
    try {
        const logs = await prisma.opencanary_logs.findMany();
        res.json(logs);
    } catch (error) {
        console.error("❌ Error fetching logs:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


// GET /logs - ดึงข้อมูลแค่ 10 row จาก opencanary_logs
export const opencanary10 = async (req, res, next) => {
    try {
        const logs = await prisma.opencanary_logs.findMany({
            take: 10,
            orderBy: {
                id: 'desc'
            },
            select: {
                id: true,
                dst_host: true,
                dst_port: true,
                local_time: true,
                local_time_adjusted: true,
                logdata_raw: true,
                logdata_msg_logdata: true,
                logtype: true,
                node_id: true,
                src_host: true,
                src_port: true,
                utc_time: true,
            },
        });
        res.json(logs);
    } catch (error) {
        console.error("❌ Error fetching logs:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}