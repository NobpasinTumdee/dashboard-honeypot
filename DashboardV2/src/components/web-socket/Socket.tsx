import React, { useState } from 'react';
import { usePacketSocket } from './controller';

export interface HttpsPacket {
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

const LogDisplay = () => {
    const [data, setData] = useState<HttpsPacket[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isLogin, setIsLogin] = useState(false);

    // Custom hook to manage WebSocket connection
    usePacketSocket(setData, setIsConnected, setIsLogin);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Packets Logs</h1>
            <p>Connection Status: <span style={{ color: isConnected ? 'green' : 'red', fontWeight: 'bold' }}>{isConnected ? 'Connected' : 'Disconnected'}</span></p>

            {!isLogin ? (
                <div style={{ textAlign: 'center', margin: '20px' }}>
                    <h1>please login for full data.</h1>
                </div>
            ) : (
                <>
                    {data.length > 0 ? (
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
                                {data.map((log) => (
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
                </>
            )}
        </div>
    );
};


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