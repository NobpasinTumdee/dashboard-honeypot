import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Chart from '../components/Chart';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';

import type { CanaryLog, CowrieLog, HttpsPacket } from '../types';
import { useCanarySocket, useCowrieSocket, usePacketSocket } from '../service/websocket';
import MapIP from '../components/MapIP';

const HomePage: React.FC = () => {
  // routing
  const navigate = useNavigate();
  // data services
  const [CowrieData, setCowrieData] = useState<CowrieLog[]>([]);
  const [CanaryData, setCanaryData] = useState<CanaryLog[]>([]);
  const [dataPacket, setDataPacket] = useState<HttpsPacket[]>([]);
  const [IpMap, setUniqueIPs] = useState<string[]>([]);
  // status
  const [isConnected, setIsConnected] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [popupMap, setPopupMap] = useState(false);

  useCowrieSocket(setCowrieData, setIsConnected, setIsLogin);
  useCanarySocket(setCanaryData, setIsConnected, setIsLogin);
  usePacketSocket(setDataPacket, setIsConnected, setIsLogin);



  // Combine recent activities from all sources
  const recentActivities = [
    ...CowrieData.slice(0, 2).map(item => ({
      source: 'Cowrie',
      timestamp: item.timestamp,
      activity: `SSH connection from ${item.src_ip}`,
      severity: 'high'
    })),
    ...CanaryData.slice(0, 2).map(item => ({
      source: 'OpenCanary',
      timestamp: item.local_time,
      activity: `${item.logdata_msg_logdata}`,
      severity: 'medium'
    })),
    ...dataPacket.slice(0, 2).map(item => ({
      source: 'Wireshark',
      timestamp: item.timestamp,
      activity: `${item.method} request to ${item.request_uri}`,
      severity: 'low'
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const activityColumns = [
    { key: 'source', header: 'Source' },
    { key: 'timestamp', header: 'Timestamp', render: (value: string) => new Date(value).toLocaleString() },
    { key: 'activity', header: 'Activity' },
    {
      key: 'severity',
      header: 'Severity',
      render: (value: string) => (
        <span className={`stat-change ${value === 'high' ? 'text-danger' :
          value === 'medium' ? 'text-warning' :
            'text-success'
          }`}>
          {value.toUpperCase()}
        </span>
      )
    }
  ];







  // ========================
  // Top 10 usernames
  // ========================
  const usernameCounts: Record<string, number> = {};
  CowrieData.forEach(item => {
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
        gradient.addColorStop(0, "#ef4444");
        gradient.addColorStop(1, "#400C11");
        return gradient;
      },
      borderRadius: 4,
    }]
  };

  const CowrieOptions = {
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



  // ========================
  // Chart จำนวน Packet ตามวัน
  // ========================
  const dailyCounts: Record<string, number> = {};
  CanaryData.forEach(item => {
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
      borderColor: '#ef4444',
      backgroundColor: '#400c114b',
      fill: true,
      tension: 0.4,
    }]
  };



  // ========================
  // Chart จำนวน Packet Wireshark ตามวัน
  // ========================
  const dailyPacketCounts: Record<string, number> = {};
  dataPacket.forEach(item => {
    const date = item.timestamp.split(' ')[0]; // แยกวันที่จาก 'YYYY-MM-DD HH:mm:ss'
    dailyPacketCounts[date] = (dailyPacketCounts[date] || 0) + 1;
  });

  const sortedPacketDates = Object.keys(dailyPacketCounts).sort();

  const labelsPacketDaily = sortedPacketDates;
  const countsPacketDaily = sortedPacketDates.map(date => dailyPacketCounts[date]);
  const dailyWiresharkData = {
    labels: labelsPacketDaily,
    datasets: [{
      label: 'Wireshark',
      data: countsPacketDaily,
      borderColor: '#ef4444',
      backgroundColor: '#630a13bb',
      fill: true,
      tension: 0.4,
    }]
  };


  const PacketsOptions = {
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
          text: 'Date (YYYY-MM-DD)'
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
      if (CowrieData.length > 0) {
        const uniqueIPSet = new Set<string>();
        CowrieData.forEach(log => {
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

  if (!isLogin) {
    return (
      <div style={{ position: 'fixed', width: '90vw', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
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
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of all honeypot systems <b style={{ color: isConnected ? 'var(--accent-primary)' : 'red' }}>Server : {isConnected ? 'Online 🌐' : 'Offline 🔴'}</b></p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Packets"
          value={CowrieData.length + CanaryData.length + dataPacket.length}
          icon="⚡"
          variant="danger"
        />
        <StatCard
          title="SSH & TELNET"
          value={CowrieData.length}
          change={CowrieData.filter(item => item.timestamp.split(' ')[0] === new Date().toISOString().split('T')[0]).length.toString()}
          changeType="positive"
          icon="🖥️"
          variant="primary"
        />
        <StatCard
          title="FTP & HTTP & HTTPS"
          value={CanaryData.length}
          change={CanaryData.filter(item => item.local_time_adjusted.split(' ')[0] === new Date().toISOString().split('T')[0]).length.toString()}
          changeType="positive"
          icon="🛜"
          variant="primary"
        />
        <StatCard
          title="Wireshark"
          value={dataPacket.length}
          change={dataPacket.filter(item => item.timestamp.split(' ')[0] === new Date().toISOString().split('T')[0]).length.toString()}
          changeType="positive"
          icon="📦"
          variant="primary"
        />
      </div>

      <div className="charts-grid">
        <ChartCard
          title="Top 10 Passwords"
          subtitle="Most commonly used passwords"
        >
          <Chart type="bar" data={usernameData} height={250} options={CowrieOptions} />
        </ChartCard>
        <ChartCard
          title="Daily OpenCanary Count"
          subtitle="Packets detected per day"
        >
          <Chart type="line" data={dailyPacketsData} height={300} options={PacketsOptions} />
        </ChartCard>
        <ChartCard
          title="Daily Wireshark Count"
          subtitle="Packets detected per day"
        >
          <Chart type="bar" data={dailyWiresharkData} height={300} options={PacketsOptions} />
        </ChartCard>
      </div>

      {popupMap && (
        <div className='map-container'>
          <button className='close-map-button' onClick={() => setPopupMap(false)}>Close Map</button>
          <MapIP ipAddresses={IpMap} />
        </div>
      )}
      <button
        className="form-button"
        style={{ width: 'auto', padding: '0.5rem 1rem', marginBottom: '1rem' }}
        onClick={handleFetchIP}
      >
        Open Map
      </button>

      <DataTable
        title="Recent Activity"
        data={recentActivities}
        columns={activityColumns}
      />
    </div>
  );
};

export default HomePage;