// User Types
export interface Users {
    UserID: string;
    UserName: string;
    Email: string;
    Password: string;
    Status: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}

// Cowrie Honeypot Types
export type CowrieLog = {
    id: number;
    timestamp: string;
    eventid: string;
    session: string;
    message: string;
    protocol: string;
    src_ip: string;
    src_port: number;
    dst_ip: string;
    dst_port: number;
    username: string;
    password: string;
    input: string;
    command: string;
    duration: number;
    ttylog: string;
    json_data: string;
};

// OpenCanary Types
export type CanaryLog = {
    id: number;
    dst_host: string;
    dst_port: number;
    local_time: string;
    local_time_adjusted: string;
    logdata_raw: string;
    logdata_msg_logdata: string;
    logtype: number;
    node_id: string;
    src_host: string;
    src_port: number;
    utc_time: string;
    full_json_line: string;
};

// Wireshark Types
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

// Navigation Types
export interface NavItem {
    id: string;
    label: string;
    path: string;
    icon: string;
}