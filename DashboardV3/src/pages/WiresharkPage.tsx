import { useNavigate } from "react-router-dom";
import React, { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Select, Button } from "antd";

import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';

import type { DstPortStats, HttpsPacket, ProtocolStats, SrcIpStats, TimeSeriesPackets } from "../types";
import { usePacketSocket, usePacketStatsSocket } from "../service/websocket";
import CombinedPieChart from "../components/ChartWireShark";

type Range = "day" | "week" | "month";

const WiresharkPage: React.FC = () => {
  const [dataPacket, setDataPacket] = useState<HttpsPacket[]>([]);
  const [data, setData] = useState<TimeSeriesPackets[]>([]);
  const [protocol, setProtocol] = useState<ProtocolStats[]>([]);
  const [ip, setSrcIp] = useState<SrcIpStats[]>([]);
  const [port, setDstPort] = useState<DstPortStats[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [timeRange, setTimeRange] = useState<Range>("day");

  const navigate = useNavigate();
  usePacketStatsSocket(setData, setProtocol, setSrcIp, setDstPort, setIsConnected, setIsLogin);

  // Custom hook to manage WebSocket connection
  usePacketSocket(setDataPacket, setIsConnected, setIsLogin);

  // Filter by eventid
  const [protocolFilter, setProtocolFilter] = useState("");
  const handleSelectChange = (event: any) => {
    setProtocolFilter(event.target.value);
  };
  const filteredData = dataPacket.filter((item) =>
    protocolFilter
      ? (item.method && item.method.toLowerCase() === protocolFilter.toLowerCase())
      : true
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Calculate the current items to display based on pagination
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  // Calculate counts for each method
  const getCount = dataPacket.filter(item => item.method?.toUpperCase() === 'GET').length;
  const postCount = dataPacket.filter(item => item.method?.toUpperCase() === 'POST').length;
  const putCount = dataPacket.filter(item => item.method?.toUpperCase() === 'PUT').length;
  const deleteCount = dataPacket.filter(item => item.method?.toUpperCase() === 'DELETE').length;

  // Aggregate data ตาม range
  const aggregatedData = useMemo(() => {
    const map = new Map<string, number>();

    data.forEach((p) => {
      const d = new Date(p.timestamp);
      let key = "";

      switch (timeRange) {
        case "day":
          key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:00`;
          break;
        case "week":
        case "month":
          // สรุปตามวัน
          key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
          break;
      }

      map.set(key, (map.get(key) || 0) + p.count);
    });

    // แปลงเป็น array และเรียงตามเวลา
    return Array.from(map, ([time, count]) => ({ time, count })).sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );
  }, [data, timeRange]);

  const formatXAxis = (time: string) => {
    const d = new Date(time);
    switch (timeRange) {
      case "day":
        return `${d.getHours()}:00`;
      case "week":
      case "month":
        return `${d.getDate()}/${d.getMonth() + 1}`;
      default:
        return time;
    }
  };

  if (!isLogin) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "80vh",
        textAlign: "center"
      }}>
        <h2>You are not logged in. Please log in to view the Wireshark overview.</h2>
        <Button type="primary" onClick={() => navigate("/login")}>Login</Button>
      </div>
    );
  }
















  const wiresharkColumns = [
    { key: 'timestamp', header: 'Timestamp', render: (value: string) => new Date(value).toLocaleString() },
    { key: 'src_ip', header: 'Source IP' },
    { key: 'src_port', header: 'Source Port' },
    { key: 'dst_ip', header: 'Destination IP' },
    { key: 'dst_port', header: 'Destination Port' },
    { key: 'method', header: 'Method' },
    { key: 'request_uri', header: 'URI' },
    {
      key: 'userAgent',
      header: 'User Agent',
      render: (value: string) => value.length > 50 ? value.substring(0, 50) + '...' : value
    }
  ];

  // Calculate stats
  const uniqueSourceIPs = new Set(dataPacket.map(packet => packet.src_ip)).size;
  const methodDistribution = dataPacket.reduce((acc, packet) => {
    acc[packet.method] = (acc[packet.method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);


  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Wireshark Analysis</h1>
        <p className="page-subtitle">Network packet analysis and HTTP/HTTPS traffic monitoring</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Captured Packets"
          value={data.reduce((sum, p) => sum + p.count, 0)}
          changeType="positive"
          icon="📦"
          variant="primary"
        />
        <StatCard
          title="Unique Sources"
          value={uniqueSourceIPs}
          change="+4"
          changeType="positive"
          icon="🌐"
          variant="success"
        />
        <StatCard
          title="Most Common Method"
          value={Object.keys(methodDistribution).sort((a, b) => methodDistribution[b] - methodDistribution[a])[0] || 'N/A'}
          icon="📡"
          variant="warning"
        />
        <StatCard
          title="Websockets Status"
          value={isConnected ? 'Online' : 'Offline'}
          icon="🔒"
          variant="success"
        />
      </div>







      <div>
        <CombinedPieChart
          protocolData={protocol}
          srcIpData={ip}
          dstPortData={port}
        />
      </div>

      <ResponsiveContainer width="90%" height={320} style={{ margin: "0 auto" }}>
        <LineChart data={aggregatedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tickFormatter={formatXAxis} />
          <YAxis allowDecimals={false} />
          <Tooltip labelFormatter={(label) => new Date(label).toLocaleString()} />
          <Line type="monotone" dataKey="count" stroke="#BAAE98" name="Total" />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ width: "90%", margin: "10px auto", textAlign: "right" }}>
        <Select
          value={timeRange}
          onChange={(value) => setTimeRange(value as Range)}
          style={{ width: "auto", marginBottom: 16 }}
        >
          <Select.Option value="day">Daily (per hour)</Select.Option>
          <Select.Option value="week">Weekly (per day)</Select.Option>
          <Select.Option value="month">Monthly (per day)</Select.Option>
        </Select>
      </div>

      <div className="stats-grid">
        <StatCard
          title="GET Requests"
          value={getCount}
          changeType="positive"
          icon="⬇️"
        />
        <StatCard
          title="POST Requests"
          value={postCount}
          changeType="positive"
          icon="⬇️"
        />
        <StatCard
          title="PUT Requests"
          value={putCount}
          changeType="positive"
          icon="⬇️"
        />
        <StatCard
          title="DELETE Requests"
          value={deleteCount}
          changeType="positive"
          icon="⬇️"
        />
      </div>


      <div style={{ fontWeight: "400", textAlign: "center", display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 5% 20px' }}>
        <p style={{ margin: '0px' }}>
          <select value={protocolFilter} onChange={handleSelectChange} style={{ padding: '0.3rem 1rem', borderRadius: '4px', border: '1px solid #ccc' }}>
            <option value="">All</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </p>
      </div>



      <DataTable
        title="Captured HTTP/HTTPS Packets"
        data={currentItems}
        columns={wiresharkColumns}
      />

      <div style={{ margin: "2% 0 10%", textAlign: "center", display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="form-button"
          style={{ width: '100px', padding: '0.3rem 1.5rem' }}
        >
          ◀ Prev
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="form-button"
          style={{ width: '100px', padding: '0.3rem 1.5rem' }}
        >
          Next ▶
        </button>
      </div>
    </div>
  );
};

export default WiresharkPage;