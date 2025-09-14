import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Chart from '../components/Chart';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import Loader from '../components/loader/Loader';

import type { CowrieLog } from '../types';
import { useCowrieSocket } from '../service/websocket';
import MapIP from '../components/MapIP';
import CowrieLogTerminal from '../components/terminal/CowrieLogTerminal';
import type { ChartData } from 'chart.js';

const CowriePage: React.FC = () => {
  // routing
  const navigate = useNavigate();
  // data services
  const [data, setData] = useState<CowrieLog[]>([]);
  const [IpMap, setUniqueIPs] = useState<string[]>([]);

  // status and popup
  const [popupMap, setPopupMap] = useState(false);
  const [popupChart, setPopupChart] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [isError, setIsError] = useState<string>('');

  // Custom hook to manage WebSocket connection
  useCowrieSocket(setData, setIsConnected, setIsLogin, setIsError);



  // Filter by eventid and pagination ========================================================
  const [protocolFilter, setProtocolFilter] = useState("");
  const handleSelectChange = (event: any) => {
    setProtocolFilter(event.target.value);
  };

  const filteredData = data.filter((item) =>
    protocolFilter
      ? (item.eventid && item.eventid.toLowerCase() === protocolFilter.toLowerCase())
      : true
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // Calculate the current items to display based on pagination
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  // =========================================================================================





  // DataTable columns
  const cowrieColumns = [
    { key: 'timestamp', header: 'Timestamp', render: (value: string) => new Date(value).toLocaleString() },
    { key: 'src_ip', header: 'Source IP' },
    { key: 'src_port', header: 'Source Port' },
    // { key: 'dst_ip', header: 'Destination IP' },
    // { key: 'dst_port', header: 'Destination Port' },
    { key: 'username', header: 'Username' },
    { key: 'password', header: 'Password' },
    { key: 'input', header: 'Command' },
    { key: 'protocol', header: 'Protocol' },
    { key: 'eventid', header: 'Event' },
    { key: 'message', header: 'Message' },
    {
      key: "duration",
      header: "Duration (s)",
      render: (value: any) => (value != null ? value.toFixed(2) : "-")
    }
  ];

  // Calculate stats
  const totalSessions = data.length;
  const uniqueIPs = new Set(data.map(log => log.src_ip)).size;




  // =====================
  // Chart data
  // =====================
  const protocolData = {
    labels: ['SSH', 'Telnet'],
    datasets: [{
      data: [data.filter(log => log.protocol === 'ssh').length,
      data.filter(log => log.protocol === 'telnet').length],
      backgroundColor: ['#400C11', '#c9baa2ff'],
      borderWidth: 0,
    }]
  };





  // =====================
  // Top 10 passwords
  // =====================
  const passwordCounts: Record<string, number> = {};
  data.forEach(item => {
    if (item.password) {
      passwordCounts[item.password] = (passwordCounts[item.password] || 0) + 1;
    }
  });

  const sortedPasswords = Object.entries(passwordCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 10);

  const labelsPass = sortedPasswords.map(([password]) => password);
  const countsPass = sortedPasswords.map(([, count]) => count);

  const passwordData = {
    labels: labelsPass,
    datasets: [{
      label: 'Usage Count',
      data: countsPass,
      backgroundColor: (ctx: any) => {
        const chart = ctx.chart;
        const { ctx: canvas } = chart;
        const gradient = canvas.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, "#BAAE98");
        gradient.addColorStop(1, "#5f523dff");
        return gradient;
      },
      borderRadius: 4,
    }]
  };







  // =====================
  // Top 10 usernames 
  // =====================
  const usernameCounts: Record<string, number> = {};
  data.forEach(item => {
    if (item.username) {
      usernameCounts[item.username] = (usernameCounts[item.username] || 0) + 1;
    }
  });

  const sortedUsernames = Object.entries(usernameCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 10);

  const labelsUser = sortedUsernames.map(([username]) => username);
  const countsUser = sortedUsernames.map(([, count]) => count);
  const usernameData = {
    labels: labelsUser,
    datasets: [{
      label: 'Usage Count',
      data: countsUser,
      backgroundColor: (ctx: any) => {
        const chart = ctx.chart;
        const { ctx: canvas } = chart;
        const gradient = canvas.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, "#BAAE98");
        gradient.addColorStop(1, "#400C11");
        return gradient;
      },
      borderRadius: 4,
    }]
  };



  // =========================
  // ช่วงเวลาที่มีการเชื่อมต่อ
  // =========================
  const hourlyCounts = Array(24).fill(0);

  data.forEach(item => {
    const date = new Date(String(item.timestamp).replace("Z", ""));
    const hour = date.getHours();
    if (hour >= 0 && hour < 24) {
      hourlyCounts[hour]++;
    }
  });

  const datatest: ChartData<'line'> = {
    labels: Array.from({ length: 24 }, (_, i) => `${i < 10 ? '0' : ''}${i}:00`),
    datasets: [
      {
        label: 'จำนวนข้อมูล',
        data: hourlyCounts,
        fill: true,
        borderColor: '#BAAE98',
        backgroundColor: '#baae9880',
        tension: 0.4,
        pointBackgroundColor: '#5f523dff',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#5f523dff',
      },
    ],
  };


  // =====================
  // Chart แสดงว่าใช้คำสั่งถูกต้องหรือไม่
  // =====================
  const statusData = {
    labels: ['failed', 'Command input'],
    datasets: [{
      data: [data.filter(log => log.eventid === 'cowrie.command.failed').length,
      data.filter(log => log.eventid === 'cowrie.command.input').length],
      backgroundColor: ['#400C11', '#c9baa2ff'],
      borderWidth: 0,
    }]
  };



  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of times'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Password or Username'
        }
      }
    }
  };

  const PieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
        }
      }
    }
  };


  // ============================
  // แปลง ip และเอาไปปักใน map
  // ============================
  const handleFetchIP = () => {
    setPopupMap(true);
    try {
      if (data.length > 0) {
        const uniqueIPSet = new Set<string>();
        data.forEach(log => {
          if (log.src_ip) {
            uniqueIPSet.add(log.src_ip);
          }
        });
        setUniqueIPs(Array.from(uniqueIPSet));
      }
    } catch (error) {
      console.error('Error fetching IP addresses:', error);
    }
  }




  const handleDownload = () => {
    // กำหนด Headers จาก AlertItem type
    const headers = ["id", "timestamp", "eventid", "session", "message", "protocol", "src_ip", "src_port", "dst_ip", "dst_port", "username", "password", "input", "command", "duration", "ttylog", "json_data"];
    const headerString = headers.join(',');

    // แปลงข้อมูลแต่ละแถวโดยอิงจาก headers
    const rows = data.map(item => {
      return headers.map(header => {
        let value = item[header as keyof CowrieLog]; // ดึงค่าจาก item โดยใช้ header เป็น key
        // จัดการกับค่าที่เป็น null, undefined หรือ string ที่มี comma
        if (value === null || value === undefined) {
          return ''; // ถ้าไม่มีข้อมูล ให้ส่งเป็นช่องว่าง
        }
        if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`; // ใส่ double quotes และ escape double quotes
        }
        return value;
      }).join(',');
    });

    // 3. รวม Header กับ Rows เข้าด้วยกัน
    const csvString = [headerString, ...rows].join('\n');

    // 4. สร้าง Blob และ URL สำหรับดาวน์โหลด
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // 5. สร้าง Element <a> ที่มองไม่เห็นเพื่อทำการดาวน์โหลด
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cowrie-${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isLogin) {
    return (
      <div style={{ position: 'fixed', width: '90vw', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h2>
          You are not logged in. Please log in to access this page.
        </h2>
        <p>{isError}</p>
        <button onClick={() => navigate('/login')}>Go to Log in</button>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <Loader />
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Cowrie Honeypot</h1>
        <p className="page-subtitle">SSH/Telnet honeypot monitoring and analysis <b style={{ color: 'var(--accent-primary)' }}>{isError}</b></p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Sessions"
          value={totalSessions}
          changeType="negative"
          icon="🔗"
          variant="primary"
        />
        <StatCard
          title="Active Protocols"
          value={`SSH ${data.filter(log => log.protocol === 'ssh').length} Telnet ${data.filter(log => log.protocol === 'telnet').length}`}
          icon="🔒"
          variant="success"
        />
        <StatCard
          title="Unique Source IPs"
          value={uniqueIPs}
          changeType="negative"
          icon="🌐"
          variant="warning"
        />
        <StatCard
          title="Websockets status"
          value={isConnected ? 'Online' : 'Offline'}
          icon="💻"
          variant="danger"
        />
      </div>

      <div className="charts-grid">
        <ChartCard
          title="Protocol Distribution"
          subtitle="SSH vs Telnet connections"
        >
          <Chart type="pie" data={protocolData} height={250} options={PieOptions} />
        </ChartCard>
        <ChartCard
          title="Top 10 Passwords"
          subtitle="Most commonly used passwords"
        >
          <Chart type="bar" data={passwordData} height={250} options={options} />
        </ChartCard>
        <ChartCard
          title="Top 10 Usernames"
          subtitle="Most commonly used usernames"
        >
          <Chart type="bar" data={usernameData} height={250} options={options} />
        </ChartCard>
      </div>

      <div>
        <CowrieLogTerminal logs={data} />
      </div>

      {popupMap && (
        <div className='map-container'>
          <button className='close-map-button' onClick={() => setPopupMap(false)}>Close Map</button>
          <MapIP ipAddresses={IpMap} />
        </div>
      )}

      <div style={{ fontWeight: "400", textAlign: "center", display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 5% 20px' }}>
        <p style={{ margin: '0px' }}>
          {protocolFilter && `| Filtered by: ${protocolFilter} `}
          <select value={protocolFilter} onChange={handleSelectChange} style={{ padding: '0.3rem 1rem', borderRadius: '4px', border: '1px solid #ccc' }}>
            <option value="">All</option>
            <option value="cowrie.session.connect">connect</option>
            <option value="cowrie.session.closed">closed</option>
            <option value="cowrie.command.input">input</option>
            <option value="cowrie.command.failed">failed</option>
          </select>
        </p>
        <button
          className="form-button"
          style={{ width: 'auto', padding: '0.5rem 1rem' }}
          onClick={handleFetchIP}
        >
          Open Map
        </button>
        <button
          className="form-button"
          style={{ width: 'auto', padding: '0.5rem 1rem' }}
          onClick={() => setPopupChart(!popupChart)}
        >
          {popupChart ? 'Close Chart' : 'dayly activity'}
        </button>
      </div>

      {popupChart && (
        <div className="charts-grid">
          <ChartCard
            title="dayly activity"
            subtitle="activity per day"
          >
            <Chart type="line" data={datatest} height={250} options={options} />
          </ChartCard>
          <ChartCard
            title="Protocol Distribution"
            subtitle="SSH vs Telnet connections"
          >
            <Chart type="pie" data={statusData} height={250} options={PieOptions} />
          </ChartCard>
        </div>
      )}

      <div className="table-container">
        <div className="table-header">
          <h3 className="table-title">Recent Cowrie Sessions</h3>
          <button
            className="form-button"
            style={{ width: 'auto', padding: '0.5rem 1rem' }}
            onClick={handleDownload}
          >
            Download CSV
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                {cowrieColumns.map((column) => (
                  <th key={column.key}>{column.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((row, index) => (
                <tr key={index} className='cowrie-row' style={{ backgroundColor: String(row.eventid).slice(-7) === 'connect' ? '#a9ff6f5b' : String(row.eventid).slice(-6) === 'closed' ? '#ffb77d5b' : '' }}>
                  <td>
                    {new Date(String(row.timestamp).replace("Z", "")).toLocaleString("th-TH", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })}
                  </td>
                  <td>{row.src_ip}</td>
                  <td>{row.src_port}</td>
                  {/* <td>{row.dst_ip}</td>
                  <td>{row.dst_port}</td> */}
                  <td>{row.username}</td>
                  <td>{row.password}</td>
                  <td>{row.input}</td>
                  <td>{row.protocol}</td>
                  <td>{row.eventid}</td>
                  <td className='cowrie-message'>{row.message}</td>
                  <td>{row.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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

export default CowriePage;