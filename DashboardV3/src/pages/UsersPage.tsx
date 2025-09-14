import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import StatCard from '../components/StatCard';
import Loader from '../components/loader/Loader';

import type { Users } from '../types';
import { mockUsersData } from '../mockData';
import { UsersSocket } from '../service/websocket';
import { AuthNewUser, DeAuthNewUser } from '../service/api';

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

  const handleDeAuthUser = async (id: string) => {
    try {
      console.log(id)
      const res = await DeAuthNewUser(id)
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

  if (!isConnected) {
    return (
      <Loader />
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
          value={users.length}
          icon="👥"
          variant="primary"
        />
        <StatCard
          title="Admin Users"
          value={activeUsers}
          change={`${Math.round((activeUsers / (users.length)) * 100)}%`}
          changeType="positive"
          icon="✅"
          variant="success"
        />
        <StatCard
          title="Guest Users"
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
            <h3 className="chart-title">User Authenticated</h3>
            <p className="chart-subtitle">Here is a list of all authorized moderators.</p>
          </div>
          <div className="chart-placeholder">
            Member list
            <div style={{ overflowX: 'auto', maxHeight: '200px', overflowY: 'scroll' }}>
              <table className="data-table">
                <tbody>
                  {user.map((row) => (
                    row.Status === 'Authenticated' ? (
                      <tr key={row.UserID}>
                        <td>{row.UserName}</td>
                        <td>{row.Email}</td>
                        <td style={{ color: '#DDD3C3' }}>{row.Status}</td>
                      </tr>
                    ) : null
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Role Guest</h3>
            <p className="chart-subtitle">Guest list required for approval</p>
          </div>
          <div className="chart-placeholder">
            Member list
            <div style={{ overflowX: 'auto', maxHeight: '200px', overflowY: 'scroll' }}>
              <table className="data-table">
                <tbody>
                  {user.map((row) => (
                    row.Status !== 'Authenticated' ? (
                      <tr key={row.UserID}>
                        <td>{row.UserName}</td>
                        <td>{row.Email}</td>
                        <td style={{ color: '#9c0909ff' }}>{row.Status}</td>
                      </tr>
                    ) : null
                  ))}
                </tbody>
              </table>
            </div>
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
                    {
                      row.Status !== 'Authenticated' ? (
                        <button
                          className="auth-button"
                          onClick={() => handleAuthUser(String(row.UserID))}
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          className="auth-button revoke"
                          onClick={() => handleDeAuthUser(String(row.UserID))}
                        >
                          Revoke
                        </button>
                      )
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