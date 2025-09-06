import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

interface ChartProps {
  type: 'bar' | 'pie' | 'line';
  data: any;
  options?: any;
  height?: number;
}

const Chart: React.FC<ChartProps> = ({ type, data, options, height = 300 }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'var(--text-primary)',
          font: {
            size: 12,
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          },
        },
      },
      tooltip: {
        backgroundColor: 'var(--card-bg)',
        titleColor: 'var(--text-primary)',
        bodyColor: 'var(--text-secondary)',
        borderColor: 'var(--border-color)',
        borderWidth: 1,
      },
    },
    scales: type !== 'pie' ? {
      x: {
        ticks: {
          color: 'var(--text-secondary)',
        },
        grid: {
          color: 'var(--border-color)',
        },
      },
      y: {
        ticks: {
          color: 'var(--text-secondary)',
        },
        grid: {
          color: 'var(--border-color)',
        },
      },
    } : undefined,
    ...options,
  };

  const chartStyle = { height: `${height}px` };

  switch (type) {
    case 'bar':
      return <div style={chartStyle}><Bar data={data} options={defaultOptions} /></div>;
    case 'pie':
      return <div style={chartStyle}><Pie data={data} options={defaultOptions} /></div>;
    case 'line':
      return <div style={chartStyle}><Line data={data} options={defaultOptions} /></div>;
    default:
      return null;
  }
};

export default Chart;