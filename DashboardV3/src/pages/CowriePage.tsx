import React from 'react';
import Chart from '../components/Chart';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import { mockCowrieData } from '../mockData';

const CowriePage: React.FC = () => {
  const cowrieColumns = [
    { key: 'timestamp', header: 'Timestamp', render: (value: string) => new Date(value).toLocaleString() },
    { key: 'src_ip', header: 'Source IP' },
    { key: 'username', header: 'Username' },
    { key: 'command', header: 'Command' },
    { key: 'protocol', header: 'Protocol' },
    { 
      key: 'duration', 
      header: 'Duration (s)',
      render: (value: number) => value.toFixed(2)
    }
  ];

  // Calculate stats
  const totalSessions = mockCowrieData.length;
  const uniqueIPs = new Set(mockCowrieData.map(log => log.src_ip)).size;
  const commonCommands = mockCowrieData.reduce((acc, log) => {
    acc[log.command] = (acc[log.command] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Chart data
  const protocolData = {
    labels: ['SSH', 'Telnet'],
    datasets: [{
      data: [mockCowrieData.filter(log => log.protocol === 'ssh').length, 
             mockCowrieData.filter(log => log.protocol === 'telnet').length],
      backgroundColor: ['#3b82f6', '#10b981'],
      borderWidth: 0,
    }]
  };

  const passwordData = {
    labels: ['password123', 'admin', 'root', '123456', 'password', 'qwerty', 'letmein', 'welcome', 'monkey', 'dragon'],
    datasets: [{
      label: 'Usage Count',
      data: [45, 38, 32, 28, 25, 22, 18, 15, 12, 10],
      backgroundColor: '#ef4444',
      borderRadius: 4,
    }]
  };

  const usernameData = {
    labels: ['admin', 'root', 'user', 'test', 'guest', 'administrator', 'pi', 'ubuntu', 'oracle', 'postgres'],
    datasets: [{
      label: 'Usage Count',
      data: [52, 48, 35, 28, 24, 20, 18, 15, 12, 8],
      backgroundColor: '#f59e0b',
      borderRadius: 4,
    }]
  };

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
          change="+5"
          changeType="negative"
          icon="🔗"
          variant="primary"
        />
        <StatCard
          title="Unique Source IPs"
          value={uniqueIPs}
          change="+2"
          changeType="negative"
          icon="🌐"
          variant="warning"
        />
        <StatCard
          title="Most Used Command"
          value={Object.keys(commonCommands).sort((a, b) => commonCommands[b] - commonCommands[a])[0] || 'N/A'}
          icon="💻"
          variant="danger"
        />
        <StatCard
          title="Active Protocols"
          value="SSH, Telnet"
          icon="🔒"
          variant="success"
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

      <DataTable
        title="Recent Cowrie Sessions"
        data={mockCowrieData}
        columns={cowrieColumns}
      />
    </div>
  );
};

export default CowriePage;