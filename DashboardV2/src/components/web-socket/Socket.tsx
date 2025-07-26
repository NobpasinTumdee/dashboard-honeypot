import { useEffect, useState } from "react";
import type { AlertItem } from "../Cowrie";
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('http://localhost:3000');

const SocketPage = () => {
    const [data, setData] = useState<AlertItem[]>([]);
    useEffect(() => {
        reload();
        socket.on('connect', () => {
            socket.emit('cowrie-get'); // ขอข้อมูล
        });

        socket.on('cowrie-get-response', (items: AlertItem[]) => {
            setData(items); // เซ็ต array ทีเดียว
            console.log('Initial data:', items);
        });

        socket.on('cowrie-push', (msg: AlertItem) => {
            setData(prev => [...prev, msg]); // รับ push ทีละรายการ
            console.log('New push:', msg);
        });

        return () => {
            socket.off('cowrie-get-response');
            socket.off('cowrie-push');
        };
    }, []);

    const reload = () => {
        socket.emit('cowrie-get');
    };

    return (
        <>
            <h2 style={{ fontWeight: '900', textAlign: 'center' }}>WebSocket cowrie test</h2>
            <p style={{ fontWeight: '400', textAlign: 'center' }}>WebSocket connection status: {socket.connected ? '🟢 Connected' : '🔴 Disconnected'}</p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>#</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Timestamp</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Event</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Message</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Protocol</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Source IP</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Source Port</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Duration</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={item.id || index}>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{index + 1}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.timestamp}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.eventid}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.message}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.protocol}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.src_ip}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.src_port}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.duration}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p style={{ fontWeight: '400', textAlign: 'center', cursor: 'pointer', color: 'blue' }} onClick={reload}>reload page to reconnect</p>

        </>
    )
}

export default SocketPage
