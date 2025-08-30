export interface TimeSeriesPackets {
  id: number;
  timestamp: string;
  count: number;
}

export interface ProtocolStats {
    id: number;
    protocol: string;
    timestamp: string;
    count: number;
}

export interface SrcIpStats {
    id: number;
    src_ip: string;
    timestamp: string;
    count: number;
}

export interface DstPortStats {
    id: number;
    dst_port: string;
    timestamp: string;
    count: number;
}