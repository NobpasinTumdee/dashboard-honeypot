import React, { useState } from 'react';

import Chart from '../components/Chart';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';

import type { CowrieLog } from '../types';
import { useCowrieSocket } from '../service/websocket';

const CowriePage: React.FC = () => {
  const [data, setData] = useState<CowrieLog[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  // Custom hook to manage WebSocket connection
  useCowrieSocket(setData, setIsConnected, setIsLogin);




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
  const ITEMS_PER_PAGE = 5;

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
    { key: 'dst_ip', header: 'Destination IP' },
    { key: 'dst_port', header: 'Destination Port' },
    { key: 'username', header: 'Username' },
    { key: 'password', header: 'Password' },
    { key: 'input', header: 'Command' },
    { key: 'protocol', header: 'Protocol' },
    {
      key: "duration",
      header: "Duration (s)",
      render: (value: any) => (value != null ? value.toFixed(2) : "-")
    }
  ];

  // Calculate stats
  const totalSessions = data.length;
  const uniqueIPs = new Set(data.map(log => log.src_ip)).size;





  // Chart data =================================================================================================
  const protocolData = {
    labels: ['SSH', 'Telnet'],
    datasets: [{
      data: [data.filter(log => log.protocol === 'ssh').length,
      data.filter(log => log.protocol === 'telnet').length],
      backgroundColor: ['#3b82f6', '#10b981'],
      borderWidth: 0,
    }]
  };
  // Chart data =================================================================================================







  // Top 10 passwords ===========================================================================================
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
      backgroundColor: '#ef4444',
      borderRadius: 4,
    }]
  };
  // Top 10 passwords ===========================================================================================








  // Top 10 usernames ===========================================================================================
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
      backgroundColor: '#f59e0b',
      borderRadius: 4,
    }]
  };
  // Top 10 usernames ===========================================================================================






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
      <>
        <h1>You are not logged in</h1>
      </>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Cowrie Honeypot</h1>
        <p className="page-subtitle">SSH/Telnet honeypot monitoring and analysis</p>
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
          value={`SSH ${data.filter(log => log.protocol === 'ssh').length}, Telnet ${data.filter(log => log.protocol === 'telnet').length}`}
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
          value={isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          icon="💻"
          variant="danger"
        />
      </div>

      <div className="charts-grid">
        <ChartCard
          title="Protocol Distribution"
          subtitle="SSH vs Telnet connections"
        >
          <Chart type="pie" data={protocolData} height={250} />
        </ChartCard>
        <ChartCard
          title="Top 10 Passwords"
          subtitle="Most commonly used passwords"
        >
          <Chart type="bar" data={passwordData} height={250} />
        </ChartCard>
        <ChartCard
          title="Top 10 Usernames"
          subtitle="Most commonly used usernames"
        >
          <Chart type="bar" data={usernameData} height={250} />
        </ChartCard>
      </div>

      <div style={{ fontWeight: "400", textAlign: "center", display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 5%' }}>
        <p style={{ margin: '0px' }}>
          {protocolFilter && `| Filtered by: ${protocolFilter} `}
          <select value={protocolFilter} onChange={handleSelectChange}>
            <option value="">All</option>
            <option value="cowrie.session.connect">connect</option>
            <option value="cowrie.session.closed">closed</option>
            <option value="cowrie.command.input">input</option>
            <option value="cowrie.command.failed">failed</option>
          </select>
        </p>
        <p style={{ margin: '0px' }}>
          <button onClick={handleDownload} className='download-button'>
            Download CSV
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--body_text_color)"><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" /></svg>
          </button>
        </p>
      </div>
      <DataTable
        title="Recent Cowrie Sessions"
        data={currentItems}
        columns={cowrieColumns}
      />
      <div style={{ margin: "2% 0 10%", textAlign: "center" }}>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          ◀ Prev
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          Next ▶
        </button>
      </div>
    </div>
  );
};

export default CowriePage;