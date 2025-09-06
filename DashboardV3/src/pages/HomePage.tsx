import React from 'react';
import Chart from '../components/Chart';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import { mockCowrieData, mockCanaryData, mockWiresharkData } from '../mockData';

const HomePage: React.FC = () => {
  // Combine recent activities from all sources
  const recentActivities = [
    ...mockCowrieData.slice(0, 2).map(item => ({
      source: 'Cowrie',
      timestamp: item.timestamp,
      activity: `SSH connection from ${item.src_ip}`,
      severity: 'medium'
    })),
    ...mockCanaryData.slice(0, 2).map(item => ({
      source: 'OpenCanary',
      timestamp: item.local_time,
      activity: `${item.logdata_msg_logdata}`,
      severity: 'high'
    })),
    ...mockWiresharkData.slice(0, 2).map(item => ({
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
        <span className={`stat-change ${
          value === 'high' ? 'text-danger' : 
          value === 'medium' ? 'text-warning' : 
          'text-success'
        }`}>
          {value.toUpperCase()}
        </span>
      )
    }
  ];

  // Chart data for dashboard
  const attackTimelineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Attacks',
      data: [120, 190, 300, 500, 200, 300],
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      fill: true,
      tension: 0.4,
    }]
  };

  const protocolDistributionData = {
    labels: ['SSH', 'HTTP', 'HTTPS', 'FTP', 'Telnet'],
    datasets: [{
      data: [35, 25, 20, 12, 8],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      borderWidth: 0,
    }]
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of all honeypot systems</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Attacks"
          value="1,247"
          change="+12%"
          changeType="negative"
          icon="⚡"
          variant="danger"
        />
        <StatCard
          title="Active Sessions"
          value="23"
          change="+5"
          changeType="positive"
          icon="🔗"
          variant="primary"
        />
        <StatCard
          title="Blocked IPs"
          value="856"
          change="+18"
          changeType="positive"
          icon="🛡️"
          variant="success"
        />
        <StatCard
          title="System Health"
          value="98.5%"
          change="+0.2%"
          changeType="positive"
          icon="💚"
          variant="success"
        />
      </div>

      <div className="charts-grid">
        <ChartCard
          title="Attack Timeline"
          subtitle="Attacks detected over time"
        >
          <Chart type="line" data={attackTimelineData} height={250} />
        </ChartCard>
        <ChartCard
          title="Protocol Distribution"
          subtitle="Most targeted protocols"
        >
          <Chart type="pie" data={protocolDistributionData} height={250} />
        </ChartCard>
      </div>

      <DataTable
        title="Recent Activity"
        data={recentActivities}
        columns={activityColumns}
      />
    </div>
  );
};

export default HomePage;