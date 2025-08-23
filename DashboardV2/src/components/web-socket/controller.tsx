import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type { AlertItem } from "../Cowrie";
import type { AlertItemCanary } from "../OpenCanary";
import type { HttpsPacket } from "./Socket";

const Url = localStorage.getItem("apiUrl");

const apiUrl = `${Url || 'http://localhost:3000'}`

const getToken = (): string | null => {
    return localStorage.getItem("token");
};

// cowrie
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

        const socket = io(apiUrl, { auth: { token }, transports: ['websocket'], withCredentials: true });
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
            console.log("New data cowrie:", new Date().toString());
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

// opencanary
export const useCanarySocket = (
    setData: (data: AlertItemCanary[]) => void,
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

        const socket = io(apiUrl, { auth: { token }, transports: ['websocket'], withCredentials: true });
        socketRef.current = socket;

        socket.on("connect", () => {
            setIsConnected(true);
            socket.emit("request-opencanary-logs");
        });

        socket.on("disconnect", () => {
            setIsConnected(false);
        });

        socket.on("Update-opencanary-logs", (items: AlertItemCanary[]) => {
            setData(items);
            console.log("Update opencanary logs:", new Date().toString());
        });

        socket.on("real-time-canary", (items: AlertItemCanary[]) => {
            setData(items);
            console.log("New data opencanary:", new Date().toString());
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


// packets
export const usePacketSocket = (
    setData: (data: HttpsPacket[]) => void,
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

        const socket = io(apiUrl, { auth: { token }, transports: ['websocket'], withCredentials: true });
        socketRef.current = socket;

        socket.on("connect", () => {
            setIsConnected(true);
            socket.emit("requestlogs");
        });

        socket.on("disconnect", () => {
            setIsConnected(false);
        });

        socket.on("Updatelogs", (newLogs: HttpsPacket[]) => {
            setData(newLogs);
            console.log("Update logs:", new Date().toString());
        });

        socket.on("real-time", (newLogs: HttpsPacket[]) => {
            setData(newLogs);
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
