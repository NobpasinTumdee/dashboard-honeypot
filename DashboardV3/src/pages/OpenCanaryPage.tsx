import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// components
import Chart from '../components/Chart';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';

// data types and services
import type { CanaryLog } from '../types';
import { useCanarySocket } from '../service/websocket';

const OpenCanaryPage: React.FC = () => {
  // routing
  const navigate = useNavigate();
  // data services
  const [data, setData] = useState<CanaryLog[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLogin, setIsLogin] = useState(false);


  // ==========================================
  // Custom hook to manage WebSocket connection
  // ==========================================
  useCanarySocket(setData, setIsConnected, setIsLogin);
  // Filter by eventid
  const [protocolFilter, setProtocolFilter] = useState("");
  const handleSelectChange = (event: any) => {
    setProtocolFilter(event.target.value);
  };
  const filteredData = data.filter((item) =>
    protocolFilter
      ? (item.logdata_msg_logdata && item.logdata_msg_logdata.toLowerCase() === protocolFilter.toLowerCase())
      : true
  );
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Calculate the current items to display based on pagination
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);




  // =============
  // Table columns
  // =============
  const canaryColumns = [
    { key: 'local_time_adjusted', header: 'Time' },
    { key: 'logdata_msg_logdata', header: 'Message' },
    { key: 'logtype', header: 'Log Type' },
    { key: 'src_host', header: 'Source IP' },
    { key: 'src_port', header: 'Source Port' },
    { key: 'dst_host', header: 'Target IP' },
  ];




  // ===============
  // Calculate stats
  // ===============
  const uniqueSourceIPs = new Set(data.map(log => log.src_host)).size;
  const portDistribution = data.reduce((acc, log) => {
    acc[log.dst_port] = (acc[log.dst_port] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);





  // ===========================
  // Chart จำนวน protocol ทั้งหมด
  // ===========================
  const logdataCounts: Record<string, number> = {};
  data.forEach(item => {
    const message = item.logdata_msg_logdata || 'Other';
    logdataCounts[message] = (logdataCounts[message] || 0) + 1;
  });

  const sortedLogdata = Object.entries(logdataCounts)
    .sort(([, countA], [, countB]) => countB - countA);

  const labelsType = sortedLogdata.map(([message]) => {
    if (message === 'Added service from class CanaryHTTP in opencanary.modules.http to fake') {
      return 'HTTP';
    } else if (message === 'Added service from class CanaryHTTPS in opencanary.modules.https to fake') {
      return 'HTTPS';
    } else if (message === 'Added service from class CanaryFTP in opencanary.modules.ftp to fake') {
      return 'FTP';
    } else if (message === 'Canary running!!!') {
      return 'running';
    } else {
      return message.slice(0, 20) + '...';
    }
  });
  const countsType = sortedLogdata.map(([, count]) => count);
  const messageData = {
    labels: labelsType,
    datasets: [{
      label: 'Count',
      data: countsType,
      backgroundColor: '#BAAE98',
      borderRadius: 4,
    }]
  };




  // ========================
  // Chart จำนวน Packet ตามวัน
  // ========================
  const dailyCounts: Record<string, number> = {};
  data.forEach(item => {
    const date = item.local_time_adjusted.split(' ')[0]; // แยกวันที่จาก 'YYYY-MM-DD HH:mm:ss'
    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
  });

  const sortedDates = Object.keys(dailyCounts).sort();

  const labelsDaily = sortedDates;
  const countsDaily = sortedDates.map(date => dailyCounts[date]);
  const dailyPacketsData = {
    labels: labelsDaily,
    datasets: [{
      label: 'Packets',
      data: countsDaily,
      borderColor: '#BAAE98',
      backgroundColor: '#baae981f',
      fill: true,
      tension: 0.4,
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





  // ===============================
  // Function to show log data popup
  // ===============================
  const showLogDataPopup = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData); // Parse the JSON string
      let content = '<h3 style="margin-bottom: 10px; color: #333;">Log Details</h3>';
      content += '<ul style="list-style-type: none; padding: 0;">';
      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
          const value = data[key];
          content += `<li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>${key}:</strong> ${value}</li>`;
        }
      }
      content += '</ul>';

      const popup = window.open("", "Log Data", "width=600,height=400,scrollbars=yes,resizable=yes");
      if (popup) {
        popup.document.body.style.fontFamily = "Arial, sans-serif";
        popup.document.body.style.padding = "20px";
        popup.document.body.style.backgroundColor = "#f9f9f9";
        popup.document.body.innerHTML = content;
      } else {
        alert("Please allow pop-ups for this website to view the log data.");
      }
    } catch (e) {
      console.error("Failed to parse JSON string:", e);
      alert("Invalid log data format.");
    }
  };



  // ===========================
  // Function to handle download
  // ===========================
  const handleDownload = () => {
    // กำหนด Headers จาก AlertItem type
    const headers = ["id", "dst_host", "dst_port", "local_time", "local_time_adjusted", "logdata_raw", "logdata_msg_logdata", "logtype", "node_id", "src_host", "src_port", "utc_time", "full_json_line"];
    const headerString = headers.join(',');

    // แปลงข้อมูลแต่ละแถวโดยอิงจาก headers
    const rows = data.map(item => {
      return headers.map(header => {
        let value = item[header as keyof CanaryLog]; // ดึงค่าจาก item โดยใช้ header เป็น key
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
    link.setAttribute('download', `OpenCanary-${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isLogin) {
    return (
      <div style={{ position: 'fixed', width: '90vw', height: '100vh', display: 'flex',flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h2>
          You are not logged in. Please log in to access this page.
        </h2>
        <button onClick={() => navigate('/login')}>Go to Log in</button>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">OpenCanary Honeypot</h1>
        <p className="page-subtitle">Multi-protocol honeypot alerts and monitoring</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Alerts"
          value={data.length}
          changeType="negative"
          icon="🚨"
          variant="danger"
        />
        <StatCard
          title="Unique Attackers"
          value={uniqueSourceIPs}
          changeType="negative"
          icon="👤"
          variant="warning"
        />
        <StatCard
          title="Most Targeted Port"
          value={Object.keys(portDistribution).sort((a, b) => portDistribution[Number(b)] - portDistribution[Number(a)])[0] || 'N/A'}
          icon="🔌"
          variant="primary"
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
          title="Alert Messages Distribution"
          subtitle="Types of detected activities"
        >
          <Chart type="bar" data={messageData} height={300} options={options} />
        </ChartCard>
        <ChartCard
          title="Daily Packet Count"
          subtitle="Packets detected per day"
        >
          <Chart type="line" data={dailyPacketsData} height={300} options={options} />
        </ChartCard>
      </div>

      <div style={{ fontWeight: "400", textAlign: "center", display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 5% 20px' }}>
        <p style={{ margin: '0px' }}>
          {protocolFilter && `| Filtered by: `}
          <select value={protocolFilter} onChange={handleSelectChange} style={{ padding: '0.3rem 1rem', borderRadius: '4px', border: '1px solid #ccc' }}>
            <option value="">All</option>
            <option value="Canary running!!!">Running</option>
            <option value="Added service from class CanaryHTTPS in opencanary.modules.https to fake">Canary HTTPS</option>
            <option value="Added service from class CanaryHTTP in opencanary.modules.http to fake">Canary HTTP</option>
            <option value="Added service from class CanaryFTP in opencanary.modules.ftp to fake">Canary FTP</option>
          </select>
        </p>
        <button
          className="form-button"
          style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
          onClick={handleDownload}
        >
          Download CSV
        </button>
      </div>


      <div className="table-container">
        <div className="table-header">
          <h3 className="table-title">Recent OpenCanary Alerts</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                {canaryColumns.map((column) => (
                  <th key={column.key}>{column.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr key={item.id || index}>
                  <td>{(item.local_time_adjusted).slice(0, 19)}</td>
                  <td onClick={() => {
                    try {
                      JSON.parse(item.logdata_msg_logdata);
                      showLogDataPopup(item.logdata_msg_logdata);
                    } catch (e) {
                      console.error("Not a valid JSON string, not showing popup.");
                    }
                  }}>
                    {item.logdata_msg_logdata && item.logdata_msg_logdata.startsWith('{') && item.logdata_msg_logdata.endsWith('}') ?
                      <p style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}>Click to view log</p> :
                      <p>{item.logdata_msg_logdata || <span className="tdStyle-null">null</span>}</p>}
                  </td>
                  <td>{item.logtype}</td>
                  <td>{item.src_host}</td>
                  <td>
                    {item.src_port !== null && item.src_port.toString() === '-1'
                      ? 'System operation'
                      : item.src_port || <p className="tdStyle-null">null</p>}
                  </td>
                  <td>
                    {item.dst_port !== null && item.dst_port.toString() === '-1'
                      ? 'System operation'
                      : item.dst_port || <p className="tdStyle-null">null</p>}
                  </td>
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

export default OpenCanaryPage;