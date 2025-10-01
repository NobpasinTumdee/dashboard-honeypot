import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";

import type {
    CanaryLog,
    CowrieLog,
    DstPortStats,
    HttpsPacket,
    ProtocolStats,
    SrcIpStats,
    TimeSeriesPackets,
    Users
} from "../types";

const getUrl = (): string => {
    const url = localStorage.getItem("apiUrl");
    return url ? url : 'http://localhost:3000';
};
const apiUrl = getUrl();


interface TokenPayload {
    UserID: number;
    UserName: string;
    Status: string;
    iat: number;
    exp: number;
}

const getToken = (): string | null => {
    return localStorage.getItem("token");
};



// cowrie
export const useCowrieSocket = (
    setData: (data: CowrieLog[]) => void,
    setDataCount: (count: number) => void,
    setIsConnected: (status: boolean) => void,
    setIsLogin: (status: boolean) => void,
    setIsError: (status: string) => void
) => {
    const socketRef = useRef<Socket | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const token = getToken();
        if (!token) {
            console.log("No token found. Cannot connect to WebSocket.");
            setIsLogin(false);
            setIsError(t('No_token'));
            return;
        }

        let decoded: TokenPayload;
        try {
            decoded = jwtDecode<TokenPayload>(token);
        } catch (err) {
            console.error("Invalid token:", err);
            setIsLogin(false);
            setIsError(t('Invalid_token'));
            return;
        }

        // ตรวจสอบ Status
        if (decoded.Status !== "Authenticated") {
            console.log("User is not authenticated. Cannot connect to WebSocket.");
            setIsLogin(false);
            setIsError(t('not_auth'));
            return;
        }

        // ตรวจสอบวันหมดอายุ
        const now = Math.floor(Date.now() / 1000); // วินาที
        if (decoded.exp && decoded.exp < now) {
            console.log("Token expired. Cannot connect to WebSocket.");
            setIsLogin(false);
            setIsError(t('Token_expired'));
            return;
        }

        // ถ้า token ถูกต้องทั้งหมด
        setIsLogin(true);
        setIsError(t('verified'));

        const socket = io(apiUrl, { auth: { token }, transports: ['websocket'], withCredentials: true });
        socketRef.current = socket;

        socket.on("connect", () => {
            setIsConnected(true);
            socket.emit("request-cowrie-logs");
        });

        socket.on("disconnect", () => {
            setIsConnected(false);
        });

        socket.on("Update-cowrie-logs", (items: CowrieLog[]) => {
            setData(items);
            console.log("Update cowrie logs:", new Date().toString());
        });

        socket.on("real-time-cowrie", (items: CowrieLog[]) => {
            setData(items);
            console.log("New data cowrie:", new Date().toString());
        });

        socket.on("Cowrie-logs-count", (count: number) => {
            setDataCount(count);
            console.log("Total Cowrie logs:", count);
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
    setData: (data: CanaryLog[]) => void,
    setDataCount: (count: number) => void,
    setIsConnected: (status: boolean) => void,
    setIsLogin: (status: boolean) => void,
    setIsError: (status: string) => void
) => {
    const socketRef = useRef<Socket | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const token = getToken();
        if (!token) {
            console.log("No token found. Cannot connect to WebSocket.");
            setIsLogin(false);
            setIsError(t('No_token'));
            return;
        }

        let decoded: TokenPayload;
        try {
            decoded = jwtDecode<TokenPayload>(token);
        } catch (err) {
            console.error("Invalid token:", err);
            setIsLogin(false);
            setIsError(t('Invalid_token'));
            return;
        }

        // ตรวจสอบ Status
        if (decoded.Status !== "Authenticated") {
            console.log("User is not authenticated. Cannot connect to WebSocket.");
            setIsLogin(false);
            setIsError(t('not_auth'));
            return;
        }

        // ตรวจสอบวันหมดอายุ
        const now = Math.floor(Date.now() / 1000); // วินาที
        if (decoded.exp && decoded.exp < now) {
            console.log("Token expired. Cannot connect to WebSocket.");
            setIsLogin(false);
            setIsError(t('Token_expired'));
            return;
        }

        // ถ้า token ถูกต้องทั้งหมด
        setIsLogin(true);
        setIsError(t('verified'));

        const socket = io(apiUrl, { auth: { token }, transports: ['websocket'], withCredentials: true });
        socketRef.current = socket;

        socket.on("connect", () => {
            setIsConnected(true);
            socket.emit("request-opencanary-logs");
        });

        socket.on("disconnect", () => {
            setIsConnected(false);
        });

        socket.on("Update-opencanary-logs", (items: CanaryLog[]) => {
            setData(items);
            console.log("Update opencanary logs:", new Date().toString());
        });

        socket.on("real-time-canary", (items: CanaryLog[]) => {
            setData(items);
            console.log("New data opencanary:", new Date().toString());
        });

        socket.on("OpenCanary-logs-count", (count: number) => {
            setDataCount(count);
            console.log("Total Canary logs:", count);
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
    setDataCount: (count: number) => void,
    setIsConnected: (status: boolean) => void,
    setIsLogin: (status: boolean) => void
) => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            console.log("No token found. Cannot connect to WebSocket.");
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

        socket.on("HttpsPackets-logs-count", (count: number) => {
            setDataCount(count);
            console.log("Total Packet logs:", count);
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



// packets stats
export const usePacketStatsSocket = (
    setData: (data: TimeSeriesPackets[]) => void,
    setProtocol: (protocol: ProtocolStats[]) => void,
    setSrcIp: (ip: SrcIpStats[]) => void,
    setDstPort: (port: DstPortStats[]) => void,
    setIsConnected: (status: boolean) => void,
    setIsLogin: (status: boolean) => void
) => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            console.log("No token found. Cannot connect to WebSocket.");
            return;
        } else {
            setIsLogin(true);
        }

        const socket = io(apiUrl, { auth: { token }, transports: ['websocket'], withCredentials: true });
        socketRef.current = socket;

        socket.on("connect", () => {
            setIsConnected(true);
            socket.emit("request-time-series-logs");
            socket.emit("request-protocol-logs");
            socket.emit("request-source-ip-logs");
            socket.emit("request-dest-port-logs");
        });

        socket.on("disconnect", () => {
            setIsConnected(false);
        });

        /* Update */
        socket.on("Update-packet-overtime", (newLogs: TimeSeriesPackets[]) => {
            setData(newLogs);
            console.log("Update logs:", new Date().toString());
        });
        socket.on("Update-protocol", (newLogs: ProtocolStats[]) => {
            setProtocol(newLogs);
            console.log("Update logs:", new Date().toString());
        });
        socket.on("Update-source-ip", (newLogs: SrcIpStats[]) => {
            setSrcIp(newLogs);
            console.log("Update logs:", new Date().toString());
        });
        socket.on("Update-dest-port", (newLogs: DstPortStats[]) => {
            setDstPort(newLogs);
            console.log("Update logs:", new Date().toString());
        });

        /* real-time */
        socket.on("real-time-packet-stats", (newLogs: TimeSeriesPackets[]) => {
            setData(newLogs);
            console.log("New data:", new Date().toString());
        });
        socket.on("real-time-protocol-stats", (newLogs: ProtocolStats[]) => {
            setProtocol(newLogs);
            console.log("New protocol data:", new Date().toString());
        });
        socket.on("real-time-ip-stats", (newLogs: SrcIpStats[]) => {
            setSrcIp(newLogs);
            console.log("New ip data:", new Date().toString());
        });
        socket.on("real-time-port-stats", (newLogs: DstPortStats[]) => {
            setDstPort(newLogs);
            console.log("New port data:", new Date().toString());
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



// user
export const UsersSocket = (
    setData: (data: Users[]) => void,
    setIsConnected: (status: boolean) => void,
    setIsLogin: (status: boolean) => void
) => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            console.log("No token found. Cannot connect to WebSocket.");
            return;
        } else {
            setIsLogin(true);
        }

        const socket = io(apiUrl, { auth: { token }, transports: ['websocket'], withCredentials: true });
        socketRef.current = socket;

        socket.on("connect", () => {
            setIsConnected(true);
            socket.emit("request-users");
        });

        socket.on("disconnect", () => {
            setIsConnected(false);
        });

        socket.on("Update-users", (items: Users[]) => {
            setData(items);
            console.log("Update users logs:", new Date().toString());
        });

        socket.on("real-time-users", (items: Users[]) => {
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