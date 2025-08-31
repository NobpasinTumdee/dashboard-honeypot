import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Select, Button } from "antd";
import { usePacketStatsSocket } from "./web-socket/controller";
import "../Styles/Dashborad.css";
import { useNavigate } from "react-router-dom";
import type { TimeSeriesPackets, ProtocolStats, SrcIpStats, DstPortStats } from "./wireshark/type";
import LogDisplay from "./web-socket/Packet";
import Aos from 'aos';
import 'aos/dist/aos.css';
import '../Styles/Dashborad.css';
import CombinedPieChart from "./chart/wireshark/ChartWireShark";

type Range = "day" | "week" | "month";


const Wireshark: React.FC = () => {
  const [data, setData] = useState<TimeSeriesPackets[]>([]);
  const [protocol, setProtocol] = useState<ProtocolStats[]>([]);
  const [ip, setSrcIp] = useState<SrcIpStats[]>([]);
  const [port, setDstPort] = useState<DstPortStats[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [timeRange, setTimeRange] = useState<Range>("day");

  const navigate = useNavigate();
  usePacketStatsSocket(setData, setProtocol, setSrcIp, setDstPort, setIsConnected, setIsLogin);

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

  useEffect(() => { Aos.init({ duration: 1000, once: true, }); }, []);

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

  return (
    <>
      <div style={{ margin: "10px 5% 20px", textAlign: "center" }}>
        <h1 data-aos="zoom-in-down">Traffic Over Time</h1>
      </div>

      <div className="container-table-packet">
        <CombinedPieChart
          protocolData={protocol}
          srcIpData={ip}
          dstPortData={port}
        />
      </div>

      <div className="dashboard-container-box">
        <div className="box-alert" data-aos="zoom-in-down">
          <div>
            <h2 style={{ margin: 0 }}>Total Packets</h2>
            <h1 style={{ margin: 0 }}>
              {data.reduce((sum, p) => sum + p.count, 0)}
            </h1>
          </div>
          <img
            src="https://www.wireshark.org/_astro/wireshark-logo-big.CkRjSOaC_2eT4Ah.png"
            alt="Wireshark Logo"
            width="45px"
          />
        </div>

        <div className="box-alert" data-aos="zoom-in-down">
          <div>
            <h2 style={{ margin: 0 }}>Status WebSocket</h2>
            <h3 style={{ margin: 0 }}>
              {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
            </h3>
          </div>
          {isConnected ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="45px"
              viewBox="0 -960 960 960"
              width="45px"
              fill="#2ba00bff"
            >
              <path d="M40-160v-240h120v240H40Zm190 0v-320h120v320H230Zm190 0v-440h120v440H420Zm190 0v-520h120v520H610Zm190 0v-640h120v640H800Z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="45px"
              viewBox="0 -960 960 960"
              width="45px"
              fill="#ff0000ff"
            >
              <path d="M816-123 660-232v72H540v-156l-120-84v240H300v-324L30-674l57-81 786 550-57 82Zm84-185-120-84v-408h120v492ZM60-160v-320h120v320H60Zm600-316-120-84v-120h120v204Z" />
            </svg>
          )}
        </div>
      </div>

      <ResponsiveContainer width="90%" height={320} style={{ margin: "0 auto" }}>
        <LineChart data={aggregatedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tickFormatter={formatXAxis} />
          <YAxis allowDecimals={false} />
          <Tooltip labelFormatter={(label) => new Date(label).toLocaleString()} />
          <Line type="monotone" dataKey="count" stroke="#2563eb" name="Total" />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ width: "90%", margin: "10px auto", textAlign: "right" }}>
        <Select
          value={timeRange}
          onChange={(value) => setTimeRange(value as Range)}
          style={{ width: 180, marginBottom: 16 }}
        >
          <Select.Option value="day">Daily (per hour)</Select.Option>
          <Select.Option value="week">Weekly (per day)</Select.Option>
          <Select.Option value="month">Monthly (per day)</Select.Option>
        </Select>
      </div>


      <div className="container-table-packet">
        {protocol.length > 0 && (
          <div className="table-packet" data-aos="zoom-in-down">
            <h2>Top Protocols</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th className="thStyle">Protocol</th>
                  <th className="thStyle">Last Detected</th>
                  <th className="thStyle">Count</th>
                </tr>
              </thead>
              <tbody>
                {protocol.map((p) => (
                  <tr key={p.id}>
                    <td className="tdStyle">{p.protocol}</td>
                    <td className="tdStyle">{p.timestamp}</td>
                    <td className="tdStyle">{p.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {ip.length > 0 && (
          <div className="table-packet" data-aos="zoom-in-down">
            <h2>Top Source IPs</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th className="thStyle">Source IP</th>
                  <th className="thStyle">Last Detected</th>
                  <th className="thStyle">Count</th>
                </tr>
              </thead>
              <tbody>
                {ip.map((p) => (
                  <tr key={p.id}>
                    <td className="tdStyle">{p.src_ip}</td>
                    <td className="tdStyle">{p.timestamp}</td>
                    <td className="tdStyle">{p.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {port.length > 0 && (
          <div className="table-packet" data-aos="zoom-in-down">
            <h2>Top Destination Ports</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th className="thStyle">Destination Port</th>
                  <th className="thStyle">Count</th>
                  <th className="thStyle">Last Detected</th>
                </tr>
              </thead>
              <tbody>
                {port.map((p) => (
                  <tr key={p.id}>
                    <td className="tdStyle">{p.dst_port}</td>
                    <td className="tdStyle">{p.count}</td>
                    <td className="tdStyle">{p.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <LogDisplay />

    </>
  );
};

export default Wireshark;