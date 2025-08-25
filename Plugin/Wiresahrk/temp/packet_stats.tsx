import React, { useEffect, useState, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

interface StatsData {
  time_series: { time: string; count: number }[];
  protocol: { date: string; protocol: string; count: number }[];
  src_ip: { date: string; src_ip: string; count: number }[];
  dst_port: { date: string; dst_port: number; count: number }[];
}

const RealtimeChart: React.FC = () => {
  const [data, setData] = useState<StatsData>({
    time_series: [],
    protocol: [],
    src_ip: [],
    dst_port: [],
  });

  const [paused, setPaused] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:2004/ws");
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      setData((prev) => {
        if (msg.type === "snapshot") {
          return msg.data;
        }

        if (msg.type === "update" && !paused) {
          const updated = { ...prev };

          // --- Merge time_series ---
          if (msg.data.time_series) {
            updated.time_series = [...prev.time_series];
            msg.data.time_series.forEach((newEntry: any) => {
              const idx = updated.time_series.findIndex((e) => e.time === newEntry.time);
              if (idx >= 0) updated.time_series[idx] = newEntry;
              else updated.time_series.push(newEntry);
            });
            updated.time_series.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
          }

          // --- Merge protocol ---
          if (msg.data.protocol) {
            updated.protocol = [...prev.protocol];
            msg.data.protocol.forEach((newEntry: any) => {
              const idx = updated.protocol.findIndex(
                (e) => e.date === newEntry.date && e.protocol === newEntry.protocol
              );
              if (idx >= 0) updated.protocol[idx] = newEntry;
              else updated.protocol.push(newEntry);
            });
          }

          // --- Merge src_ip ---
          if (msg.data.src_ip) {
            updated.src_ip = [...prev.src_ip];
            msg.data.src_ip.forEach((newEntry: any) => {
              const idx = updated.src_ip.findIndex(
                (e) => e.date === newEntry.date && e.src_ip === newEntry.src_ip
              );
              if (idx >= 0) updated.src_ip[idx] = newEntry;
              else updated.src_ip.push(newEntry);
            });
          }

          // --- Merge dst_port ---
          if (msg.data.dst_port) {
            updated.dst_port = [...prev.dst_port];
            msg.data.dst_port.forEach((newEntry: any) => {
              const idx = updated.dst_port.findIndex(
                (e) => e.date === newEntry.date && e.dst_port === newEntry.dst_port
              );
              if (idx >= 0) updated.dst_port[idx] = newEntry;
              else updated.dst_port.push(newEntry);
            });
          }

          return updated;
        }

        return prev;
      });
    };

    return () => ws.close();
  }, [paused]);

  const toSortedChartArray = <T extends Record<string, any>>(arr: T[], keyField: keyof T) => {
    const filtered = selectedDate ? arr.filter((item) => item.date === selectedDate) : arr;

    const summary: Record<string, number> = {};
    filtered.forEach((item) => {
      const key = String(item[keyField]);
      summary[key] = (summary[key] || 0) + item.count;
    });

    return Object.entries(summary)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const filteredTimeSeries = selectedDate
    ? data.time_series.filter((item) => item.time.startsWith(selectedDate))
    : data.time_series;

  // --- Formatter สำหรับแกน X ---
  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    if (selectedDate) {
      // เลือกวัน → แสดงเวลา HH:mm
      return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    } else {
      // ไม่เลือกวัน → แสดงวัน/เดือน/ปี
      return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    }
  };

  return (
    <div className="p-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <button
          style={{
            padding: "12px 24px",
            background: "linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6)",
            color: "white",
            fontWeight: "bold",
            border: "none",
            borderRadius: "16px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          onClick={() => setPaused(!paused)}
        >
          {paused ? "▶ Resume" : "⏸ Pause"}
        </button>
        <input
          type="date"
          style={{
            padding: "6px 12px",
            borderRadius: "12px",
            border: "1px solid #9ca3af",
            background: "linear-gradient(180deg, #f9fafb, #e5e7eb)",
            color: "#111827",
            fontWeight: "500",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
            cursor: "pointer",
          }}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        {selectedDate && (
          <button
            style={{
              marginLeft: "10px",
              padding: "6px 12px",
              background: "linear-gradient(90deg, #d1d5db, #9ca3af)",
              color: "#111827",
              fontWeight: "bold",
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
              cursor: "pointer",
            }}
            onClick={() => setSelectedDate("")}
          >
            X Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Time Series */}
        <div className="w-full">
          <h3>
            Packets Over Time{" "}
            <span style={{ fontSize: "0.9rem", color: "#6b7280", fontWeight: "normal" }}>
              ({selectedDate || "All Time"})
            </span>
          </h3>
          {filteredTimeSeries.length === 0 ? (
            <p className="text-center text-gray-500">Data is empty</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredTimeSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tickFormatter={formatXAxis} minTickGap={20} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Protocol */}
        <div className="w-full">
          <h3>Packets by Protocol</h3>
          {toSortedChartArray(data.protocol, "protocol").length === 0 ? (
            <p className="text-center text-gray-500">Data is empty</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={toSortedChartArray(data.protocol, "protocol").slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Source IP */}
        <div className="w-full">
          <h3>Packets by Source IP</h3>
          {toSortedChartArray(data.src_ip, "src_ip").length === 0 ? (
            <p className="text-center text-gray-500">Data is empty</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={toSortedChartArray(data.src_ip, "src_ip").slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Destination Port */}
        <div className="w-full">
          <h3>Packets by Destination Port</h3>
          {toSortedChartArray(data.dst_port, "dst_port").length === 0 ? (
            <p className="text-center text-gray-500">Data is empty</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={toSortedChartArray(data.dst_port, "dst_port").slice(0, 20)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#d88484" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealtimeChart;