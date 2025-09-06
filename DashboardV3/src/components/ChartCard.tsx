import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, children }) => {
  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        {subtitle && <p className="chart-subtitle">{subtitle}</p>}
      </div>
      {children || (
        <div className="chart-placeholder">
          Chart visualization will be displayed here
        </div>
      )}
    </div>
  );
};

export default ChartCard;