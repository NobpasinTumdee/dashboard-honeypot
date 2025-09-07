import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import StatCard from '../components/StatCard';

import type { Users } from '../types';
import { mockUsersData } from '../mockData';
import { UsersSocket } from '../service/websocket';
import { AuthNewUser } from '../service/api';

const UsersPage: React.FC = () => {
  // routing
  const navigate = useNavigate();
  // data services
  const [user, setUser] = useState<Users[]>([])
  const [isConnected, setIsConnected] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  // Custom hook to manage WebSocket connection
  UsersSocket(setUser, setIsConnected, setIsLogin);

  const handleAuthUser = async (id: string) => {
    try {
      console.log(id)
      const res = await AuthNewUser(id)
      if (res.status === 200) {
        alert('Change Status User Success')
        window.location.reload();
      }
    } catch (error) {
      console.error(error)
    }
  }


  const [users] = useState<Users[]>(mockUsersData);

  const userColumns = [
    { key: 'UserID', header: 'User ID' },
    { key: 'UserName', header: 'Username' },
    { key: 'Email', header: 'Email' },
    {
      key: 'Status',
      header: 'Status',
      render: (value: string) => (
        <span className={`stat-change ${value === 'Authenticated' ? 'text-success' : 'text-warning'
          }`}>
          {value.toUpperCase()}
        </span>
      )
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (value: Date) => value.toLocaleDateString()
    },
    {
      key: 'updatedAt',
      header: 'Last Updated',
      render: (value: Date) => value.toLocaleDateString()
    },
    {
      Key: 'Action',
      header: 'Action',
    }
  ];

  // Calculate stats
  const activeUsers = user.filter(user => user.Status === 'Authenticated').length;
  const inactiveUsers = user.filter(user => user.Status === 'Unauthenticated').length;

  // ==================
  // export users
  // ==================
  const handleDownload = () => {
    const headers = ["UserID", "UserName", "Email", "Password", "Status", "createdAt", "updatedAt", "deletedAt"];
    const headerString = headers.join(',');

    const rows = user.map(item => {
      return headers.map(header => {
        let value = item[header as keyof Users];
        if (value === null || value === undefined) {
          return '';
        }
        if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });

    const csvString = [headerString, ...rows].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `users-${new Date().toISOString()}.csv`);
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
        <button onClick={() => navigate('/login')}>Go to Log in</button>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Manage system users and access controls</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Users"
          value={users.length - 1}
          icon="👥"
          variant="primary"
        />
        <StatCard
          title="Active Users"
          value={activeUsers}
          change={`${Math.round((activeUsers / (users.length - 1)) * 100)}%`}
          changeType="positive"
          icon="✅"
          variant="success"
        />
        <StatCard
          title="Inactive Users"
          value={inactiveUsers}
          change={`${Math.round((inactiveUsers / users.length) * 100)}%`}
          changeType="negative"
          icon="⏸️"
          variant="warning"
        />
        <StatCard
          title="websocket"
          value={isConnected ? 'Connected' : 'Disconnected'}
          icon="🔐"
          variant="primary"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">User Activity</h3>
            <p className="chart-subtitle">Login patterns and user engagement</p>
          </div>
          <div className="chart-placeholder">
            User activity chart visualization
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Role Distribution</h3>
            <p className="chart-subtitle">User roles and permissions breakdown</p>
          </div>
          <div className="chart-placeholder">
            Role distribution chart
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          className="form-button"
          style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
          onClick={() => navigate('/login')}
        >
          Add New User
        </button>
        <button
          className="form-button"
          style={{
            width: 'auto',
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
          }}
          onClick={handleDownload}
        >
          Export Users
        </button>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h3 className="table-title">System Users</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                {userColumns.map((column, index) => (
                  <th key={index}>{column.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {user.map((row) => (
                <tr key={row.UserID}>
                  <td>{row.UserID}</td>
                  <td>{row.UserName}</td>
                  <td>{row.Email}</td>
                  <td style={{ color: row.Status === 'Authenticated' ? '#DDD3C3' : '#4b4b4bff' }}>{row.Status}</td>
                  <td>{String(row.createdAt)}</td>
                  <td>{String(row.updatedAt)}</td>
                  <td>
                    {row.Status !== 'Authenticated' &&
                      <button
                        className="auth-button"
                        onClick={() => handleAuthUser(String(row.UserID))}
                      >
                        approve
                      </button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;