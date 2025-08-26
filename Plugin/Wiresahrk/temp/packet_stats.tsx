import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import Modal from "react-modal";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./dash.css"
import type { DropResult } from 'react-beautiful-dnd';
import { Select, Button, Space } from "antd";


// ---------- Types ----------
type DataPoint = { time: string; count: number };
type ProtocolStat = { timestamp: string; protocol: string; count: number };
type IPStat = { timestamp: string; src_ip: string; count: number };
type PortStat = { timestamp: string; dst_port: number; count: number };

type Range = "day" | "week" | "month";

interface Snapshot {
  time_series: DataPoint[];
  protocol: ProtocolStat[];
  src_ip: IPStat[];
  dst_port: PortStat[];
}

interface CompareItem {
  type: "protocol" | "ip" | "port";
  value: string; // store as string for uniform key handling
}

// ---------- Constants ----------
const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#a3e635", "#eab308", "#f97316", "#f43f5e", "#6366f1", "#22c55e"];

// For react-modal a11y; adjust your root selector if different
try { Modal.setAppElement("#root"); } catch {}

// ---------- Component ----------
const Dashboard: React.FC = () => {
  const [data, setData] = useState<Snapshot>({
    time_series: [],
    protocol: [],
    src_ip: [],
    dst_port: [],
  });

  // Ranges
  const [mainTimeRange, setMainTimeRange] = useState<Range>("day");
  const [protocolTimeRange, setProtocolTimeRange] = useState<Range>("day");
  const [ipTimeRange, setIpTimeRange] = useState<Range>("day");
  const [portTimeRange, setPortTimeRange] = useState<Range>("day");

  const [focusFilters, setFocusFilters] = useState<CompareItem[]>([]);

  // Compare modal
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareItems, setCompareItems] = useState<CompareItem[]>([]);
  const [compareRange, setCompareRange] = useState<Range>("day");

  // ---------- Data feed (WebSocket) ----------
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:2004/ws");
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "snapshot") setData(msg.data);
      if (msg.type === "update") {
        setData((prev) => {
          const merged = { ...prev } as Snapshot;
          (["time_series", "protocol", "src_ip", "dst_port"] as const).forEach((key) => {
            if (msg.data[key]) {
              const updated = [...prev[key]] as any[];
              msg.data[key].forEach((newItem: any) => {
                const nonCountKeys = Object.keys(newItem).filter((k) => k !== "count");
                const idx = updated.findIndex((item) =>
                  JSON.stringify(nonCountKeys.map((k) => (item as any)[k])) ===
                  JSON.stringify(nonCountKeys.map((k) => newItem[k]))
                );
                if (idx >= 0) updated[idx] = newItem; else updated.push(newItem);
              });
              (merged as any)[key] = updated;
            }
          });
          return merged;
        });
      }
    };
    return () => ws.close();
  }, []);

  // ---------- Helpers ----------
  const formatXAxis = (time: string, range: Range) => {
    const d = new Date(time);
    if (range === "day") return `${d.getDate()}/${d.getMonth() + 1} ${d.getHours()}:00`;
    if (range === "week") return `${d.getDate()}/${d.getMonth() + 1}`;
    if (range === "month") return `${d.getDate()}`;
    return time;
  };

  const aggregate = (points: DataPoint[], range: Range) => {
    const map = new Map<string, number>();
    points.forEach((p) => {
      const d = new Date(p.time);
      let key = "";
      if (range === "day") key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:00`;
      if (range === "week") key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      if (range === "month") key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      map.set(key, (map.get(key) || 0) + p.count);
    });
    return Array.from(map, ([time, count]) => ({ time, count }))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  };

  // Series for main chart
  const aggregatedSeries = useMemo(() => aggregate(data.time_series, mainTimeRange), [data.time_series, mainTimeRange]);

  // Top lists
  const toTopList = (rec: Record<string, number>) =>
    Object.entries(rec)
      .map(([name, value]) => ({ name, value: value as number }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

  const topProtocols = useMemo(() => {
    const rec = data.protocol.reduce((acc: Record<string, number>, p) => {
      acc[p.protocol] = (acc[p.protocol] || 0) + p.count; return acc;
    }, {});
    return toTopList(rec);
  }, [data.protocol]);

  const topIPs = useMemo(() => {
    const rec = data.src_ip.reduce((acc: Record<string, number>, s) => {
      acc[s.src_ip] = (acc[s.src_ip] || 0) + s.count; return acc;
    }, {});
    return toTopList(rec);
  }, [data.src_ip]);

  const topPorts = useMemo(() => {
    const rec = data.dst_port.reduce((acc: Record<string, number>, d) => {
      const key = d.dst_port.toString(); acc[key] = (acc[key] || 0) + d.count; return acc;
    }, {});
    return toTopList(rec);
  }, [data.dst_port]);

  // Build time series for a single filter
  const seriesFor = (filter: CompareItem, range: Range): DataPoint[] => {
    if (filter.type === "protocol") {
      const raw = data.protocol.filter((p) => p.protocol === filter.value)
        .map((p) => ({ time: p.timestamp, count: p.count }));
      return aggregate(raw, range);
    }
    if (filter.type === "ip") {
      const raw = data.src_ip.filter((s) => s.src_ip === filter.value)
        .map((s) => ({ time: s.timestamp, count: s.count }));
      return aggregate(raw, range);
    }
    // port
    const raw = data.dst_port.filter((d) => d.dst_port === Number(filter.value))
      .map((d) => ({ time: d.timestamp, count: d.count }));
    return aggregate(raw, range);
  };

  // Combine multiple series into a single array of rows keyed by time
  const buildComparisonData = (items: CompareItem[], range: Range) => {
    const rows = new Map<string, any>();
    items.forEach((it) => {
      const keyName = `${it.type}:${it.value}`;
      const s = seriesFor(it, range);
      s.forEach(({ time, count }) => {
        const row = rows.get(time) || { time };
        row[keyName] = (row[keyName] || 0) + count;
        rows.set(time, row);
      });
    });
    return Array.from(rows.values()).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  };

  const comparisonData = useMemo(() => buildComparisonData(compareItems, compareRange), [compareItems, compareRange, data]);

  // ---------- UI handlers ----------
  const handlePieClick = (type: CompareItem["type"], value: string | number) => {
    const v = String(value);

    setFocusFilters((prev) => {
      // ถ้าคลิกซ้ำตัวเดียวกัน -> ลบออก (ปิดกราฟ)
      if (prev.length === 1 && prev[0].type === type && prev[0].value === v) {
        return [];
      }
      // ถ้าเป็นตัวใหม่ -> แทนที่ด้วยตัวใหม่
      return [{ type, value: v }];
    });
  };

  // กรองไอเทมที่อยู่ใน compare zone ออก
  const filteredTopProtocols = topProtocols.filter(
    (p) => !compareItems.some((c) => c.type === "protocol" && c.value === p.name)
  );

  const filteredTopIPs = topIPs.filter(
    (ip) => !compareItems.some((c) => c.type === "ip" && c.value === ip.name)
  );

  const filteredTopPorts = topPorts.filter(
    (port) => !compareItems.some((c) => c.type === "port" && c.value === port.name)
  );


  const removeCompareItem = (idx: number) => setCompareItems((prev) => prev.filter((_, i) => i !== idx));

  // Drag & Drop
  const onDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId !== "compareZone") return;

    const [type, ...rest] = draggableId.split("::");
    const value = rest.join("::");
    const item: CompareItem = { type: type as CompareItem["type"], value };

    setCompareItems((prev) =>
      prev.some((p) => p.type === item.type && p.value === item.value)
        ? prev
        : [...prev, item]
    );
  };

  // ---------- Render helpers ----------
const renderPieAndBar = (list: { name: string; value: number }[], type: CompareItem["type"]) => {
  const top10 = list.slice(0, 10);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      {/* Pie */}
      <PieChart width={400} height={400}>
        <Pie
          data={top10}
          dataKey="value"
          nameKey="name"
          outerRadius={80}
          label={({ percent }) => {
            const p = percent ?? 0;
            return `${(p * 100).toFixed(1)}%`;
          }}
          onClick={(d: any) => handlePieClick(type, d.name)}
        >
          {top10.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>

      {/* Bar (X=name, Y=value) */}
      <ResponsiveContainer width={520} height={280}>
        <BarChart data={top10} layout="horizontal" margin={{ top: 8, right: 16, left: 16, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" type="category" angle={-30} textAnchor="end" interval={0} />
          <YAxis type="number" allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" onClick={(barData) => handlePieClick(type, (barData as any).name)}>
            {top10.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ---------- JSX ----------
return (
  <div>
    <div>
      <h1>Network Traffic Dashboard(เดี๋ยวมาแก้UI)</h1>
      <Button
        onClick={() => setIsCompareOpen(true)}
      >
        Custom Chart!!
      </Button>
    </div>

    {/* Time series (overall) */}
    <div>
      <div>
        <h2>Traffic Over Time</h2>
        <Select
          value={mainTimeRange}
          onChange={(value: Range) => setMainTimeRange(value)}
          style={{ width: 180 }}
        >
          <Select.Option value="day">Daily (per hour)</Select.Option>
          <Select.Option value="week">Weekly (per day)</Select.Option>
          <Select.Option value="month">Monthly (per day)</Select.Option>
        </Select>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={aggregatedSeries}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tickFormatter={(t) => formatXAxis(t, mainTimeRange)} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#2563eb" name="Total" />
        </LineChart>
      </ResponsiveContainer>
    </div>

    {/* Top lists with Pie + Bar */}
    <div>
      <div>
        <h2>Top Protocols</h2>
        {renderPieAndBar(topProtocols, "protocol")}
      </div>
      <div>
        <h2>Top Source IPs</h2>
        {renderPieAndBar(topIPs, "ip")}
      </div>
      <div>
        <h2>Top Destination Ports</h2>
        {renderPieAndBar(topPorts, "port")}
      </div>
    </div>

    {/* Focus timelines (quick add by clicking bars/pies) */}
    <div>
      {focusFilters.map((filter, index) => {
        const timeRange = filter.type === "protocol" ? protocolTimeRange : filter.type === "ip" ? ipTimeRange : portTimeRange;
        const setTimeRange = filter.type === "protocol" ? setProtocolTimeRange : filter.type === "ip" ? setIpTimeRange : setPortTimeRange;
        return (
          <div key={`${filter.type}-${filter.value}-${index}`}>
            <div>
              <h3>Timeline for {filter.type.toUpperCase()}: {filter.value}</h3>
              <Select
                value={timeRange}
                onChange={(value: Range) => setTimeRange(value)}
                style={{ width: 120 }}
              >
                <Select.Option value="day">Daily</Select.Option>
                <Select.Option value="week">Weekly</Select.Option>
                <Select.Option value="month">Monthly</Select.Option>
              </Select>
              <Button danger style={{marginLeft: "10px"}} onClick={() => setFocusFilters((prev) => prev.filter((_, i) => i !== index))}>Close</Button>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={seriesFor(filter, timeRange)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tickFormatter={(t) => formatXAxis(t, timeRange)} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#10b981" name={`${filter.type}:${filter.value}`} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>

    {/* Compare Modal */}
    <Modal
    isOpen={isCompareOpen}
    onRequestClose={() => setIsCompareOpen(false)}
    style={{ content: { inset: "10%", padding: 16, borderRadius: 16 } }}
    contentLabel="Compare Items"
  >
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="stats-custom">
        {/* Top 3 columns */}
        <div className="stats-custom-top">
          {(["protocol", "ip", "port"] as const).map((type) => (
            <Droppable droppableId={type} isDropDisabled key={type}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="stats-custom-column"
                >
                  <h3>{type.toUpperCase()}</h3>
                  {(type === "protocol" ? filteredTopProtocols : type === "ip" ? filteredTopIPs : filteredTopPorts).map(
                    (item, index) => (
                      <Draggable
                        key={`${type}::${item.name}`}
                        draggableId={`${type}::${item.name}`}
                        index={index}
                      >
                        {(drag) => (
                          <div
                            ref={drag.innerRef}
                            {...drag.draggableProps}
                            {...drag.dragHandleProps}
                            className="stats-custom-item"
                          >
                            {item.name} <span>({item.value})</span>
                          </div>
                        )}
                      </Draggable>
                    )
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>

        {/* Bottom: drop zone + chart */}
        <div className="stats-custom-bottom">
          <Droppable droppableId="compareZone">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="stats-custom-dropzone"
              >
                {snapshot.isDraggingOver && <h3>Drop here!!</h3>}
                {compareItems.map((item, index) => (
                  <Draggable
                    key={`${item.type}::${item.value}`}
                    draggableId={`${item.type}::${item.value}`}
                    index={index}
                  >
                    {(drag) => (
                      <div
                        ref={drag.innerRef}
                        {...drag.draggableProps}
                        {...drag.dragHandleProps}
                        className="stats-custom-item"
                      >
                        {item.type.toUpperCase()}: {item.value}
                        <button
                          onClick={() => removeCompareItem(index)}
                          style={{
                            backgroundColor: "transparent",
                            color: "red",
                            border: "none", 
                            fontSize: "18px",
                            cursor: "pointer" 
                          }}
                        >
                          x
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <div>
          <Space style={{ marginBottom: 16 }}>
            <Select
              value={compareRange}
              onChange={(value: Range) => setCompareRange(value)}
              style={{ width: 120 }}
            >
              <Select.Option value="day">Daily</Select.Option>
              <Select.Option value="week">Weekly</Select.Option>
              <Select.Option value="month">Monthly</Select.Option>
            </Select>

            <Button danger onClick={() => setCompareItems([])}>
              Clear
            </Button>
          </Space>
          </div>    

          <div className="stats-custom-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={comparisonData}
                margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  tickFormatter={(t) => formatXAxis(t, compareRange)}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                {compareItems.map((it, idx) => {
                  const keyName = `${it.type}:${it.value}`;
                  return (
                    <Line
                      key={keyName}
                      type="monotone"
                      dataKey={keyName}
                      stroke={COLORS[idx % COLORS.length]}
                      dot={false}
                      name={keyName}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <Button
            danger
            style={{ alignSelf: "flex-end" }}
            onClick={() => setIsCompareOpen(false)}
          >
            Close
          </Button>
        </div>
      </div>
    </DragDropContext>
  </Modal>
  </div>
);
};
export default Dashboard;