import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive',
  icon,
  variant = 'primary'
}) => {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-header">
        <div className="stat-title">{title}</div>
        <div className="stat-icon">{icon}</div>
      </div>
      <div className="stat-value">{value}</div>
      {change && (
        <div className={`stat-change ${changeType === 'positive' ? 'text-success' : 'text-danger'}`}>
          {changeType === 'positive' ? '↗' : '↘'} {change}
        </div>
      )}
    </div>
  );
};

export default StatCard;