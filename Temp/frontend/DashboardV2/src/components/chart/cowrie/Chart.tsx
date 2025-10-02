import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export interface LogData {
  id: number;
  timestamp: string;
  eventid: string;
  src_ip: string;
  protocol: string | null;
}

interface Props {
  logs: LogData[];
}

// ฟังก์ชันสำหรับสุ่มสีในรูปแบบ HSL
const getRandomColor = () => {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 50) + 50; // 50-100% saturation
  const l = Math.floor(Math.random() * 30) + 60; // 60-90% lightness
  return `hsl(${h}, ${s}%, ${l}%)`;
};

// ฟังก์ชันสำหรับสร้าง Array ของสีตามจำนวนข้อมูล
const getDynamicColors = (count: number) => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(getRandomColor());
  }
  return colors;
};

const ChartComponent: React.FC<Props> = ({ logs }) => {
  const eventCounts = logs.reduce<Record<string, number>>((acc, log) => {
    if (log.protocol) {
      acc[log.protocol] = (acc[log.protocol] || 0) + 1;
    }
    return acc;
  }, {});

  const labels = Object.keys(eventCounts);
  const dataValues = Object.values(eventCounts);

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Protocol',
        data: dataValues,
        backgroundColor: getDynamicColors(labels.length), // ใช้ฟังก์ชันสุ่มสี
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(255, 99, 132, 0.8)', // สีเมื่อนำเมาส์ไปชี้
        hoverBorderColor: 'rgba(255, 99, 132, 1)',
      },
    ],
  };

  return <Bar data={data} />;
};

export default ChartComponent;