import React from 'react';
import Chart from '../components/Chart';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import { mockWiresharkData } from '../mockData';

const WiresharkPage: React.FC = () => {
  const wiresharkColumns = [
    { key: 'timestamp', header: 'Timestamp', render: (value: string) => new Date(value).toLocaleString() },
    { key: 'src_ip', header: 'Source IP' },
    { key: 'dst_ip', header: 'Destination IP' },
    { key: 'method', header: 'Method' },
    { key: 'request_uri', header: 'URI' },
    { 
      key: 'userAgent', 
      header: 'User Agent',
      render: (value: string) => value.length > 50 ? value.substring(0, 50) + '...' : value
    }
  ];

  // Calculate stats
  const totalPackets = mockWiresharkData.length;
  const uniqueSourceIPs = new Set(mockWiresharkData.map(packet => packet.src_ip)).size;
  const methodDistribution = mockWiresharkData.reduce((acc, packet) => {
    acc[packet.method] = (acc[packet.method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Chart data
  const dailyTrafficData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [{
      label: 'HTTP Requests',
      data: [45, 25, 85, 120, 95, 65],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
    }, {
      label: 'HTTPS Requests',
      data: [35, 20, 75, 110, 85, 55],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
    }]
  };

  const topEndpointsData = {
    labels: ['/api/login', '/admin/config', '/wp-admin', '/api/users', '/dashboard', '/config.php'],
    datasets: [{
      label: 'Requests',
      data: [85, 62, 48, 35, 28, 22],
      backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'],
      borderWidth: 0,
    }]
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Wireshark Analysis</h1>
        <p className="page-subtitle">Network packet analysis and HTTP/HTTPS traffic monitoring</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Captured Packets"
          value={totalPackets}
          change="+15"
          changeType="positive"
          icon="📦"
          variant="primary"
        />
        <StatCard
          title="Unique Sources"
          value={uniqueSourceIPs}
          change="+4"
          changeType="positive"
          icon="🌐"
          variant="success"
        />
        <StatCard
          title="Most Common Method"
          value={Object.keys(methodDistribution).sort((a, b) => methodDistribution[b] - methodDistribution[a])[0] || 'N/A'}
          icon="📡"
          variant="warning"
        />
        <StatCard
          title="Protocol Coverage"
          value="HTTP/HTTPS"
          icon="🔒"
          variant="success"
        />
      </div>

      <div className="charts-grid">
        <ChartCard
          title="Daily Traffic Pattern"
          subtitle="HTTP/HTTPS requests throughout the day"
        >
          <Chart type="line" data={dailyTrafficData} height={300} />
        </ChartCard>
        <ChartCard
          title="Top Targeted Endpoints"
          subtitle="Most frequently requested URIs"
        >
          <Chart type="pie" data={topEndpointsData} height={300} />
        </ChartCard>
      </div>

      <DataTable
        title="Captured HTTP/HTTPS Packets"
        data={mockWiresharkData}
        columns={wiresharkColumns}
      />
    </div>
  );
};

export default WiresharkPage;