import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// กำหนด type ให้กับข้อมูลที่ได้รับมา
interface HttpsPacket {
    id: number;
    timestamp: string;
    src_ip: string;
    src_port: string;
    dst_ip: string;
    dst_port: string;
    method: string;
    request_uri: string;
    userAgent: string;
}

const SOCKET_SERVER_URL = 'http://localhost:3100'; // เปลี่ยน URL ให้ตรงกับ server ของคุณ

const LogDisplay = () => {
    const [logs, setLogs] = useState<HttpsPacket[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // สร้างการเชื่อมต่อ WebSocket
        const socket = io(SOCKET_SERVER_URL);

        // จัดการเหตุการณ์เมื่อเชื่อมต่อสำเร็จ
        socket.on('connect', () => {
            console.log('🟢 Connected to WebSocket server');
            setIsConnected(true);
            // ส่ง event 'requestlogs' เพื่อขอ logs ทั้งหมดในครั้งแรก
            socket.emit('requestlogs');
        });

        // จัดการเหตุการณ์เมื่อหลุดการเชื่อมต่อ
        socket.on('disconnect', () => {
            console.log('🔴 Disconnected from WebSocket server');
            setIsConnected(false);
        });

        // รับ logs ทั้งหมดเมื่อมีการเรียก 'Updatelogs'
        socket.on('Updatelogs', (newLogs: HttpsPacket[]) => {
            console.log('Received initial logs:', newLogs.length);
            setLogs(newLogs);
        });

        // รับ logs แบบ real-time เมื่อมีการเรียก 'real-time'
        socket.on('real-time', (newLogs: HttpsPacket[]) => {
            console.log('Received real-time logs:', newLogs.length);
            setLogs(newLogs); // อัปเดต state ด้วย logs ใหม่
        });

        // Cleanup function: ปิดการเชื่อมต่อเมื่อ component ถูก unmount
        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Packets Logs</h1>
            <p>Connection Status: <span style={{ color: isConnected ? 'green' : 'red', fontWeight: 'bold' }}>{isConnected ? 'Connected' : 'Disconnected'}</span></p>

            {/* แสดง logs ในรูปแบบตาราง */}
            {logs.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th style={tableHeaderStyle}>ID</th>
                            <th style={tableHeaderStyle}>Timestamp</th>
                            <th style={tableHeaderStyle}>Source IP</th>
                            <th style={tableHeaderStyle}>Source Port</th>
                            <th style={tableHeaderStyle}>Destination IP</th>
                            <th style={tableHeaderStyle}>Destination Port</th>
                            <th style={tableHeaderStyle}>Method</th>
                            <th style={tableHeaderStyle}>Request URI</th>
                            <th style={tableHeaderStyle}>User Agent</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id}>
                                <td style={tableCellStyle}>{log.id}</td>
                                <td style={tableCellStyle}>{new Date(log.timestamp).toLocaleString()}</td>
                                <td style={tableCellStyle}>{log.src_ip}</td>
                                <td style={tableCellStyle}>{log.src_port}</td>
                                <td style={tableCellStyle}>{log.dst_ip}</td>
                                <td style={tableCellStyle}>{log.dst_port}</td>
                                <td style={tableCellStyle}>{log.method}</td>
                                <td style={tableCellStyle}>{log.request_uri}</td>
                                <td style={tableCellStyle}>{log.userAgent}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Waiting for logs...</p>
            )}
        </div>
    );
};

// Style สำหรับตาราง
const tableHeaderStyle: React.CSSProperties = {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'left',
};

const tableCellStyle: React.CSSProperties = {
    border: '1px solid #ddd',
    padding: '8px',
};

export default LogDisplay;