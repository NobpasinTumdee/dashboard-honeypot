import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";


import Modal from "react-modal";
import { Select, Button, Space } from "antd";
import type { DropResult } from "@hello-pangea/dnd";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";


import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import CombinedPieChart from "../components/ChartWireShark";
import Loader from "../components/loader/Loader";


import { usePacketSocket, usePacketStatsSocket } from "../service/websocket";
import type { DstPortStats, HttpsPacket, ProtocolStats, SrcIpStats, TimeSeriesPackets } from "../types";


type Range = "day" | "week" | "month";
type CompareItem = { type: "protocol" | "ip" | "port"; value: string };
const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#a3e635", "#eab308", "#f97316", "#f43f5e"];
try { Modal.setAppElement("#root"); } catch { }

const WiresharkPage: React.FC = () => {
  // react router
  const navigate = useNavigate();

  // ================== State ==================
  const [dataPacket, setDataPacket] = useState<HttpsPacket[]>([]);
  const [data, setData] = useState<TimeSeriesPackets[]>([]);
  const [protocol, setProtocol] = useState<ProtocolStats[]>([]);
  const [ip, setSrcIp] = useState<SrcIpStats[]>([]);
  const [port, setDstPort] = useState<DstPortStats[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [timeRange, setTimeRange] = useState<Range>("day");

  const [protocolFilter, setProtocolFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareItems, setCompareItems] = useState<CompareItem[]>([]);
  const [compareRange, setCompareRange] = useState<Range>("day");

  // ================== Hooks ==================
  usePacketStatsSocket(setData, setProtocol, setSrcIp, setDstPort, setIsConnected, setIsLogin);
  usePacketSocket(setDataPacket, setIsConnected, setIsLogin);



  // ================== Filter ==================
  const handleSelectChange = (event: any) => setProtocolFilter(event.target.value);
  const filteredData = dataPacket.filter(item =>
    protocolFilter ? (item.method?.toLowerCase() === protocolFilter.toLowerCase()) : true
  );



  // ================== Pagination ==================
  const ITEMS_PER_PAGE = 10;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));



  // ================== Method Counts ==================
  const methodDistribution = useMemo(() => {
    return dataPacket.reduce((acc, packet) => {
      if (packet.method) {
        const method = packet.method.toUpperCase();
        acc[method] = (acc[method] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
  }, [dataPacket]);

  const getCount = methodDistribution["GET"] || 0;
  const postCount = methodDistribution["POST"] || 0;
  const putCount = methodDistribution["PUT"] || 0;
  const deleteCount = methodDistribution["DELETE"] || 0;




  // ================== Aggregate Data ==================
  const aggregatedData = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(p => {
      const d = new Date(p.timestamp);
      let key = "";
      switch (timeRange) {
        case "day":
          key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:00`;
          break;
        case "week":
        case "month":
          key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
          break;
      }
      map.set(key, (map.get(key) || 0) + p.count);
    });
    return Array.from(map, ([time, count]) => ({ time, count }))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }, [data, timeRange]);

  const formatXAxis = (time: string) => {
    const d = new Date(time);
    switch (timeRange) {
      case "day":
        return `${d.getHours()}:00`;
      case "week":
      case "month":
        return `${d.getDate()}/${d.getMonth() + 1}`; // แสดงแค่วัน/เดือน
      default:
        return time;
    }
  };




  const formatTooltipLabel = (time: string) => {
    const d = new Date(time);
    switch (timeRange) {
      case "day":
        return d.toLocaleString(); // วัน+เวลา
      case "week":
      case "month":
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`; // วัน/เดือน/ปี
      default:
        return time;
    }
  };




  const formatModalTooltipLabel = (time: string) => {
    const d = new Date(time);
    switch (compareRange) {
      case "day":
        return d.toLocaleString(); // วัน+เวลา
      case "week":
      case "month":
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`; // วัน/เดือน/ปี
      default:
        return time;
    }
  };



  // ================== Helper Functions ==================
  const aggregate = (points: { timestamp: string; count: number }[], range: Range) => {
    const map = new Map<string, number>();
    points.forEach(p => {
      const d = new Date(p.timestamp);
      let key = range === "day" ?
        `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:00` :
        `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      map.set(key, (map.get(key) || 0) + p.count);
    });
    return Array.from(map, ([time, count]) => ({ time, count }))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  };

  const seriesFor = (filter: CompareItem, range: Range) => {
    if (filter.type === "protocol")
      return aggregate(protocol.filter(p => p.protocol === filter.value).map(p => ({ timestamp: p.timestamp, count: p.count })), range);
    if (filter.type === "ip")
      return aggregate(ip.filter(s => s.src_ip === filter.value).map(p => ({ timestamp: p.timestamp, count: p.count })), range);
    return aggregate(port.filter(p => p.dst_port === filter.value).map(p => ({ timestamp: p.timestamp, count: p.count })), range);
  };

  const buildComparisonData = (items: CompareItem[], range: Range) => {
    const rows = new Map<string, any>();
    items.forEach(it => {
      const keyName = `${it.type}:${it.value}`;
      seriesFor(it, range).forEach(({ time, count }) => {
        const row = rows.get(time) || { time };
        row[keyName] = (row[keyName] || 0) + count;
        rows.set(time, row);
      });
    });
    return Array.from(rows.values()).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  };

  const comparisonData = useMemo(() => buildComparisonData(compareItems, compareRange), [compareItems, compareRange, protocol, ip, port]);
  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const [type, ...rest] = draggableId.split("::");
    const value = rest.join("::");
    const item: CompareItem = { type: type as CompareItem["type"], value };

    // ลากจากฝั่งซ้าย → compareZone
    if (source.droppableId !== "compareZone" && destination.droppableId === "compareZone") {
      setCompareItems(prev =>
        prev.some(p => p.type === item.type && p.value === item.value) ? prev : [...prev, item]
      );
    }

    // ลากจาก compareZone → ฝั่งซ้าย
    if (source.droppableId === "compareZone" && destination.droppableId !== "compareZone") {
      setCompareItems(prev => prev.filter((_, idx) => idx !== source.index));
    }

    // จัดลำดับภายใน compareZone
    if (source.droppableId === "compareZone" && destination.droppableId === "compareZone") {
      const items = Array.from(compareItems);
      const [removed] = items.splice(source.index, 1);
      items.splice(destination.index, 0, removed);
      setCompareItems(items);
    }
  };



  const toTopList = (rec: Record<string, number>) => Object.entries(rec).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const topProtocols = useMemo(() =>
    toTopList(
      protocol.reduce((acc: Record<string, number>, p) => {
        acc[p.protocol] = (acc[p.protocol] || 0) + p.count;
        return acc;
      }, {})
    ),
    [protocol]
  );



  const topIPs = useMemo(() =>
    toTopList(
      ip.reduce((acc: Record<string, number>, s) => {
        acc[s.src_ip] = (acc[s.src_ip] || 0) + s.count;
        return acc;
      }, {})
    ),
    [ip]
  );

  const topPorts = useMemo(() =>
    toTopList(
      port.reduce((acc: Record<string, number>, d) => {
        const key = d.dst_port.toString();
        acc[key] = (acc[key] || 0) + d.count;
        return acc;
      }, {})
    ),
    [port]
  );

  // ============== Search ================
  const [searchType, setSearchType] = useState<"any" | "ip" | "port" | "protocol">("any");
  const [searchTerm, setSearchTerm] = useState("");
  const filterData = (type: "ip" | "port" | "protocol", data: { name: string; value: number }[]) => {
    let filtered = data;

    if (searchTerm) {
      filtered = data.filter(item => {
        if (searchType === "any") return item.name.toLowerCase().includes(searchTerm.toLowerCase());
        if (searchType === type) return item.name.toLowerCase().includes(searchTerm.toLowerCase());
        return true;
      });
    }

    // ถ้าไม่ได้ค้น → แสดงแค่ 10 อันแรก
    return searchTerm ? filtered : filtered.slice(0, 10);
  };

  // =========== calculate percentage ===============
  const totalByType = {
    protocol: topProtocols.reduce((sum, item) => sum + item.value, 0),
    ip: topIPs.reduce((sum, item) => sum + item.value, 0),
    port: topPorts.reduce((sum, item) => sum + item.value, 0),
  };

  const uniqueSourceIPs = new Set(dataPacket.map(p => p.src_ip)).size;

  // ================== Render ==================
  if (!isLogin) {
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "80vh", textAlign: "center" }}>
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
    { key: 'userAgent', header: 'User Agent', render: (value: string) => value.length > 50 ? value.substring(0, 50) + '...' : value }
  ];


  if (!isConnected) {
    return (
      <Loader />
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Wireshark Analysis</h1>
        <p className="page-subtitle">Network packet analysis and HTTP/HTTPS traffic monitoring</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard title="Captured Packets" value={data.reduce((sum, p) => sum + p.count, 0)} changeType="positive" icon="📦" variant="primary" />
        <StatCard title="Unique Sources" value={uniqueSourceIPs} changeType="positive" icon="🌐" variant="success" />
        <StatCard title="Most Common Method" value={Object.keys(methodDistribution).sort((a, b) => methodDistribution[b] - methodDistribution[a])[0] || 'N/A'} icon="📡" variant="warning" />
        <StatCard title="Websockets Status" value={isConnected ? 'Online' : 'Offline'} icon="🔒" variant="success" />
      </div>


      {/* Pie Chart */}
      <CombinedPieChart protocolData={protocol} srcIpData={ip} dstPortData={port} />


      {/* Line Chart */}
      <ResponsiveContainer width="90%" height={320} style={{ margin: "0 auto" }}>
        <LineChart data={aggregatedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tickFormatter={formatXAxis} />
          <YAxis allowDecimals={false} />
          <Tooltip labelFormatter={formatTooltipLabel} />
          <Line type="monotone" dataKey="count" stroke="#BAAE98" name="Total" />
        </LineChart>
      </ResponsiveContainer>

      {/* TimeRange Selector */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "10px auto", width: "90%" }}>
        {/* Open Modal */}
        <button
          className="form-button"
          style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
          onClick={() => setIsCompareOpen(true)}
        >
          View Timeline!
        </button>

        <Select
          value={timeRange}
          onChange={(value) => setTimeRange(value as Range)}
          style={{ width: "auto" }}
        >
          <Select.Option value="day">Daily (per hour)</Select.Option>
          <Select.Option value="week">Weekly (per day)</Select.Option>
          <Select.Option value="month">Monthly (per day)</Select.Option>
        </Select>
      </div>

      {/* Method Stats */}
      <div className="stats-grid">
        <StatCard title="GET Requests" value={getCount} changeType="positive" icon="⬇️" />
        <StatCard title="POST Requests" value={postCount} changeType="positive" icon="⬇️" />
        <StatCard title="PUT Requests" value={putCount} changeType="positive" icon="⬇️" />
        <StatCard title="DELETE Requests" value={deleteCount} changeType="positive" icon="⬇️" />
      </div>


      {/* Protocol Filter */}
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

      {/* Data Table */}
      <DataTable title="Captured HTTP/HTTPS Packets" data={currentItems} columns={wiresharkColumns} />

      {/* Pagination */}
      <div style={{ margin: "2% 0 10%", textAlign: "center", display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="form-button" style={{ width: '100px', padding: '0.3rem 1.5rem' }}>◀ Prev</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="form-button" style={{ width: '100px', padding: '0.3rem 1.5rem' }}>Next ▶</button>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isCompareOpen}
        onRequestClose={() => setIsCompareOpen(false)}
        style={{
          overlay: {
            backgroundColor: 'rgba(0,0,0,0.7)',
          },
          content: {
            inset: "8%",
            padding: 20,
            borderRadius: 16,
            height: "auto",
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
          }
        }}
        contentLabel="Compare Items"
      >
        {/* Close button */}
        <button
          onClick={() => setIsCompareOpen(false)}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            fontSize: 18,
            cursor: "pointer",
            color: "var(--text-primary)",
            width: 32,
            height: 32,
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{
            margin: 0,
            marginBottom: 8,
            fontSize: 22,
            fontWeight: 600,
            color: "var(--text-primary)"
          }}>
            Compare Network Items
          </h2>
        </div>

        {/* Search Bar */}
        <div style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          padding: 12,
          background: "rgba(255,255,255,0.05)",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.1)"
        }}>
          <Select
            value={searchType}
            onChange={(v) => setSearchType(v)}
            style={{ width: 130 }}
          >
            <Select.Option value="any">Any</Select.Option>
            <Select.Option value="ip">IP</Select.Option>
            <Select.Option value="port">Port</Select.Option>
            <Select.Option value="protocol">Protocol</Select.Option>
          </Select>
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 6,
              background: "rgba(255,255,255,0.05)",
              color: "var(--text-primary)",
              fontSize: 14
            }}
          />
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{ display: "flex", gap: 20, height: "65vh" }}>
            {/* Left Panel */}
            <div style={{
              width: "30%",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 16
            }}>
              {["protocol", "ip", "port"].map(type => {
                if (searchType !== "any" && searchType !== type) return null;

                const rawData = type === "protocol" ? topProtocols : type === "ip" ? topIPs : topPorts;
                const filtered = filterData(type as any, rawData).slice(0, 10);

                return (
                  <Droppable droppableId={type} key={type}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                          padding: 12,
                          borderRadius: 8,
                          background: snapshot.isDraggingOver
                            ? "rgba(var(--accent-primary-rgb), 0.1)"
                            : "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)"
                        }}
                      >
                        <h3 style={{
                          borderBottom: "2px solid var(--text-primary)",
                          paddingBottom: "8px",
                          marginBottom: "12px",
                          margin: 0,
                          fontSize: 15,
                          fontWeight: 600,
                          color: "var(--text-primary)"
                        }}>
                          {type.toUpperCase()}
                        </h3>

                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {filtered
                            .filter(item => !compareItems.some(ci => ci.type === type && ci.value === item.name))
                            .map((item, idx) => (
                              <Draggable key={`${type}::${item.name}`} draggableId={`${type}::${item.name}`} index={idx}>
                                {(drag, dragSnapshot) => (
                                  <div
                                    ref={drag.innerRef}
                                    {...drag.draggableProps}
                                    {...drag.dragHandleProps}
                                    style={{
                                      padding: "8px 12px",
                                      border: "1px solid var(--text-primary)",
                                      borderRadius: 8,
                                      cursor: "grab",
                                      background: dragSnapshot.isDragging
                                        ? "rgba(var(--accent-primary-rgb), 0.2)"
                                        : "rgba(255,255,255,0.08)",
                                      boxShadow: dragSnapshot.isDragging
                                        ? "0 4px 8px rgba(0, 0, 0, 0.2)"
                                        : "none",
                                      minWidth: "fit-content",
                                      maxWidth: "100%",
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 2,
                                      ...drag.draggableProps.style
                                    }}
                                  >
                                    {/* ชื่อไอเทม */}
                                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                      {item.name}
                                    </div>

                                    {/* จำนวนและเปอร์เซ็นต์ */}
                                    <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500, display: "flex", justifyContent: "space-between" }}>
                                      <span>total: {item.value.toLocaleString()}</span>
                                      <span>
                                        {((item.value / totalByType[type as keyof typeof totalByType]) * 100).toFixed(3)}%
                                      </span>
                                    </div>

                                    {/* ประเภทหรือคำอธิบายสั้น */}
                                    <div style={{ fontSize: 10, color: "var(--text-tertiary)", fontStyle: "italic" }}>
                                      type: {type === "protocol" ? "Protocol" : type === "ip" ? "IP Address" : "Port"}
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))
                          }
                        </div>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>

            {/* Right Panel */}
            <div style={{
              width: "70%",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              overflowY: "auto"
            }}>
              {/* Clear Comparison Button */}
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <button
                  onClick={() => setCompareItems([])}
                  style={{
                    border: "2px solid var(--text-primary)",
                    borderRadius: 6,
                    padding: "6px 16px",
                    cursor: "pointer",
                    background: "rgba(255,255,255,0.05)",
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    fontSize: 13
                  }}
                >
                  Clear All
                </button>
              </div>

              {/* Compare Zone */}
              <Droppable droppableId="compareZone">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      minHeight: 100,
                      background: snapshot.isDraggingOver
                        ? "rgba(var(--accent-primary-rgb), 0.1)"
                        : "rgba(255,255,255,0.03)",
                      padding: 12,
                      borderRadius: 8,
                      border: snapshot.isDraggingOver
                        ? "2px dashed var(--accent-primary)"
                        : "2px dashed rgba(255,255,255,0.3)",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      position: "relative"
                    }}
                  >
                    {compareItems.length === 0 && (
                      <div style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "var(--text-secondary)",
                        fontSize: 14,
                        fontWeight: 500,
                        textAlign: "center",
                        pointerEvents: "none"
                      }}>
                        Drag items here to compare
                      </div>
                    )}

                    {compareItems.map((item, idx) => {
                      const count =
                        item.type === "protocol"
                          ? topProtocols.find(p => p.name === item.value)?.value || 0
                          : item.type === "ip"
                            ? topIPs.find(p => p.name === item.value)?.value || 0
                            : topPorts.find(p => p.name === item.value)?.value || 0;

                      return (
                        <Draggable
                          key={`${item.type}::${item.value}`}
                          draggableId={`${item.type}::${item.value}`}
                          index={idx}
                        >
                          {(drag, dragSnapshot) => (
                            <div
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              {...drag.dragHandleProps}
                              style={{
                                padding: "6px 10px",
                                border: "1px solid var(--text-primary)",
                                borderRadius: 6,
                                cursor: "grab",
                                background: dragSnapshot.isDragging
                                  ? "rgba(var(--accent-primary-rgb), 0.2)"
                                  : "rgba(255,255,255,0.08)",
                                boxShadow: dragSnapshot.isDragging
                                  ? "0 4px 8px rgba(0, 0, 0, 0.2)"
                                  : "none",
                                minWidth: "fit-content",
                                maxWidth: "200px",
                                ...drag.draggableProps.style,
                              }}
                            >
                              <div style={{
                                fontWeight: 600,
                                fontSize: 13,
                                color: "var(--text-primary)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                              }}>
                                {item.type}: {item.value}
                              </div>
                              <div style={{
                                fontSize: 11,
                                color: "var(--text-secondary)",
                                fontWeight: 500
                              }}>
                                Total: {count.toLocaleString()}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {/* Chart and Range */}
              <div style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: 8,
                padding: 12,
                border: "1px solid rgba(255,255,255,0.1)"
              }}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                    <XAxis dataKey="time" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                    <Tooltip
                      labelFormatter={formatModalTooltipLabel}
                      contentStyle={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 6
                      }}
                    />
                    {compareItems.map((it, idx) => (
                      <Line
                        key={`${it.type}:${it.value}`}
                        type="monotone"
                        dataKey={`${it.type}:${it.value}`}
                        stroke={COLORS[idx % COLORS.length]}
                        name={`${it.type}:${it.value}`}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: 8,
                padding: 12,
                border: "1px solid rgba(255,255,255,0.1)"
              }}>
                <Space>
                  <Select
                    value={compareRange}
                    onChange={v => setCompareRange(v as Range)}
                    style={{ width: 170 }}
                  >
                    <Select.Option value="day">Daily (per hour)</Select.Option>
                    <Select.Option value="week">Weekly (per day)</Select.Option>
                    <Select.Option value="month">Monthly (per day)</Select.Option>
                  </Select>
                </Space>
              </div>
            </div>
          </div>
        </DragDropContext>
      </Modal>
    </div>
  );
};
export default WiresharkPage;