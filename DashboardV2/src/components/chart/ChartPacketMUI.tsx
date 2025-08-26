import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  type ChartOptions
} from 'chart.js';
import type { HttpsPacket } from '../web-socket/Packet';

// ลงทะเบียน components ที่ต้องใช้กับ Chart.js สำหรับกราฟเส้น
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface Props {
  logs: HttpsPacket[];
}

const ChartPacketMUI: React.FC<Props> = ({ logs }) => {
  const eventCounts = logs.reduce<Record<string, number>>((acc, log) => {
    if (log.method) {
      acc[log.method] = (acc[log.method] || 0) + 1;
    }
    return acc;
  }, {});

  const data = {
    labels: Object.keys(eventCounts),
    datasets: [
      {
        label: 'method',
        data: Object.values(eventCounts),
        borderColor: '#495AFB',
        backgroundColor: 'rgba(73, 90, 251, 0.2)', // เพิ่มสีพื้นหลังใต้เส้น
        tension: 0.4, // ทำให้เส้นโค้งมน
        fill: true, // เติมสีใต้เส้น
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    scales: {
      x: {
        grid: {
          display: false, // ซ่อนเส้นตารางแนวนอน
        },
      },
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      tooltip: {
        mode: 'index',
        intersect: false,
      },
      legend: {
        display: true,
      }
    }
  };

  return <Line data={data} options={options} />;
};



const ChartPacketByDateMUI: React.FC<Props> = ({ logs }) => {
  const countsByDate = logs.reduce<Record<string, number>>((acc, log) => {
    const date = log.timestamp.slice(0, 10);
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const sortedDates = Object.keys(countsByDate).sort();

  const data = {
    labels: sortedDates,
    datasets: [
      {
        label: 'Events per Day',
        data: sortedDates.map(date => countsByDate[date]),
        borderColor: '#6FACEE',
        backgroundColor: 'rgba(111, 172, 238, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      tooltip: {
        mode: 'index',
        intersect: false,
      },
      legend: {
        display: true,
      }
    }
  };

  return <Line data={data} options={options} />;
};

export { ChartPacketByDateMUI, ChartPacketMUI };