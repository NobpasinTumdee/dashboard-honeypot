import { useEffect, useRef, useState } from "react";
import type { AlertItem } from "../Cowrie";
import { io, Socket } from "socket.io-client";

const SocketPage = () => {
    const [data, setData] = useState<AlertItem[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    const getToken = (): string | null => {
        return localStorage.getItem("token");
    };

    useEffect(() => {
        const token = getToken();

        if (!token) {
            console.error("No token found. Cannot connect to WebSocket.");
            return;
        }

        const socket = io("http://localhost:3000", {
            auth: { token },
        });

        socketRef.current = socket;

        // Update connection status
        socket.on("connect", () => {
            setIsConnected(true);
            socket.emit("requestHoneypotLogs");
        });

        socket.on("disconnect", () => {
            setIsConnected(false);
        });

        socket.on("honeypotLogsUpdate", (items: AlertItem[]) => {
            setData(items);
            // console.log("Initial data:", items);
            console.log(new Date().toString());
        });

        socket.on("initialMessage", (msg) => {
            console.log("Message:", msg);
        });

        socket.on("cowrie-push", (msg: AlertItem) => {
            setData((prev) => [...prev, msg]);
            console.log("New push:", msg);
        });

        return () => {
            socket.disconnect();
            socket.off();
        };
    }, []);

    return (
        <>
            <h2 style={{ fontWeight: "900", textAlign: "center" }}>
                WebSocket cowrie test
            </h2>
            <p style={{ fontWeight: "400", textAlign: "center" }}>
                WebSocket connection status:{" "}
                {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
            </p>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ backgroundColor: "#f2f2f2" }}>
                        <th style={thStyle}>#</th>
                        <th style={thStyle}>Timestamp</th>
                        <th style={thStyle}>Event</th>
                        <th style={thStyle}>Message</th>
                        <th style={thStyle}>Protocol</th>
                        <th style={thStyle}>Source IP</th>
                        <th style={thStyle}>Source Port</th>
                        <th style={thStyle}>Duration</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={item.id || index}>
                            <td style={tdStyle}>{index + 1}</td>
                            <td style={tdStyle}>{item.timestamp}</td>
                            <td style={tdStyle}>{item.eventid}</td>
                            <td style={tdStyle}>{item.message}</td>
                            <td style={tdStyle}>{item.protocol}</td>
                            <td style={tdStyle}>{item.src_ip}</td>
                            <td style={tdStyle}>{item.src_port}</td>
                            <td style={tdStyle}>{item.duration}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
};

// ✅ สไตล์ที่ใช้ซ้ำได้
const thStyle = {
    border: "1px solid #ddd",
    padding: "8px",
};

const tdStyle = {
    border: "1px solid #ddd",
    padding: "8px",
};

export default SocketPage;
