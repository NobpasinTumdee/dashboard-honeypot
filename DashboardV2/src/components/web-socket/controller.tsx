import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type { AlertItem } from "../Cowrie";


const getToken = (): string | null => {
    return localStorage.getItem("token");
};

export const useCowrieSocket = (
    setData: (data: AlertItem[]) => void,
    setIsConnected: (status: boolean) => void,
    setIsLogin: (status: boolean) => void
) => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            console.error("No token found. Cannot connect to WebSocket.");
            return;
        } else {
            setIsLogin(true);
        }

        const socket = io("http://localhost:3000", { auth: { token } });
        socketRef.current = socket;

        socket.on("connect", () => {
            setIsConnected(true);
            socket.emit("request-cowrie-logs");
        });

        socket.on("disconnect", () => {
            setIsConnected(false);
        });

        socket.on("Update-cowrie-logs", (items: AlertItem[]) => {
            setData(items);
            console.log("Update cowrie logs:", new Date().toString());
        });

        socket.on("real-time-cowrie", (items: AlertItem[]) => {
            setData(items);
            console.log("New data:", new Date().toString());
        });

        socket.on("Welcome-Message", (msg) => {
            console.log("Message:", msg);
        });

        return () => {
            socket.disconnect();
            socket.off();
        };
    }, []);
};
