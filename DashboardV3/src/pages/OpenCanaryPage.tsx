import React from 'react';
import Chart from '../components/Chart';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import { mockCanaryData } from '../mockData';

const OpenCanaryPage: React.FC = () => {
  const canaryColumns = [
    { key: 'local_time', header: 'Time' },
    { key: 'src_host', header: 'Source IP' },
    { key: 'dst_port', header: 'Target Port' },
    { key: 'logtype', header: 'Log Type' },
    { key: 'logdata_msg_logdata', header: 'Message' },
    { key: 'node_id', header: 'Node ID' }
  ];

  // Calculate stats
  const totalAlerts = mockCanaryData.length;
  const uniqueSourceIPs = new Set(mockCanaryData.map(log => log.src_host)).size;
  const portDistribution = mockCanaryData.reduce((acc, log) => {
    acc[log.dst_port] = (acc[log.dst_port] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  // Chart data
  const messageData = {
    labels: ['HTTP request detected', 'HTTPS probe detected', 'FTP connection attempt', 'SSH scan detected', 'Telnet probe'],
    datasets: [{
      label: 'Count',
      data: [25, 18, 12, 8, 5],
      backgroundColor: '#3b82f6',
      borderRadius: 4,
    }]
  };

  const dailyPacketsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Packets',
      data: [120, 95, 140, 85, 110, 75, 60],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
    }]
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">OpenCanary Honeypot</h1>
        <p className="page-subtitle">Multi-protocol honeypot alerts and monitoring</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Alerts"
          value={totalAlerts}
          change="+8"
          changeType="negative"
          icon="🚨"
          variant="danger"
        />
        <StatCard
          title="Unique Attackers"
          value={uniqueSourceIPs}
          change="+3"
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
          title="Active Nodes"
          value={new Set(mockCanaryData.map(log => log.node_id)).size}
          icon="📡"
          variant="success"
        />
      </div>

      <div className="charts-grid">
        <ChartCard
          title="Alert Messages Distribution"
          subtitle="Types of detected activities"
        >
          <Chart type="bar" data={messageData} height={300} />
        </ChartCard>
        <ChartCard
          title="Daily Packet Count"
          subtitle="Packets detected per day"
        >
          <Chart type="line" data={dailyPacketsData} height={300} />
        </ChartCard>
      </div>

      <DataTable
        title="Recent OpenCanary Alerts"
        data={mockCanaryData}
        columns={canaryColumns}
      />
    </div>
  );
};

export default OpenCanaryPage;