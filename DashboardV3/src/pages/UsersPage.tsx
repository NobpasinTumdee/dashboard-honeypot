import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { mockUsersData } from '../mockData';
import type { Users } from '../types';

const UsersPage: React.FC = () => {
  const [users] = useState<Users[]>(mockUsersData);

  const userColumns = [
    { key: 'UserID', header: 'User ID' },
    { key: 'UserName', header: 'Username' },
    { key: 'Email', header: 'Email' },
    { 
      key: 'Status', 
      header: 'Status',
      render: (value: string) => (
        <span className={`stat-change ${
          value === 'active' ? 'text-success' : 'text-warning'
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
    }
  ];

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.Status === 'active').length;
  const inactiveUsers = users.filter(user => user.Status === 'inactive').length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Manage system users and access controls</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon="👥"
          variant="primary"
        />
        <StatCard
          title="Active Users"
          value={activeUsers}
          change={`${Math.round((activeUsers / totalUsers) * 100)}%`}
          changeType="positive"
          icon="✅"
          variant="success"
        />
        <StatCard
          title="Inactive Users"
          value={inactiveUsers}
          change={`${Math.round((inactiveUsers / totalUsers) * 100)}%`}
          changeType="negative"
          icon="⏸️"
          variant="warning"
        />
        <StatCard
          title="System Roles"
          value="Admin, Analyst, Monitor"
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
        >
          Export Users
        </button>
      </div>

      <DataTable
        title="System Users"
        data={users}
        columns={userColumns}
      />
    </div>
  );
};

export default UsersPage;