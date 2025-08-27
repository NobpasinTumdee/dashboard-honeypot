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
  protocol: string;
}

interface Props {
  logs: LogData[];
}

const ChartByDateComponent: React.FC<Props> = ({ logs }) => {
  // กลุ่มข้อมูลตามวันที่ (YYYY-MM-DD)
  const countsByDate = logs.reduce<Record<string, number>>((acc, log) => {
    const date = log.timestamp.slice(0, 10);
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  // เรียงวันที่
  const sortedDates = Object.keys(countsByDate).sort();

  // สร้าง Object สำหรับเก็บข้อมูล Protocol แต่ละประเภทต่อวัน
  const protocolCountsByDate: Record<string, Record<string, number>> = {};
  logs.forEach(log => {
    const date = log.timestamp.slice(0, 10);
    const protocol = log.protocol;
    if (!protocolCountsByDate[date]) {
      protocolCountsByDate[date] = {};
    }
    protocolCountsByDate[date][protocol] = (protocolCountsByDate[date][protocol] || 0) + 1;
  });

  // รวบรวม Protocol ทั้งหมดที่มีเพื่อใช้เป็น labels ของแต่ละ dataset
  const allProtocols = [...new Set(logs.map(log => log.protocol))].filter(Boolean);

  // สร้าง datasets สำหรับแต่ละ Protocol
  const protocolDatasets = allProtocols.map(protocol => {
    return {
      label: `Protocol: ${protocol}`,
      data: sortedDates.map(date => protocolCountsByDate[date]?.[protocol] || 0),
      backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)`, // สุ่มสีเพื่อให้แต่ละ Protocol แตกต่างกัน
    };
  });

  const data = {
    labels: sortedDates,
    datasets: [
      {
        label: 'Events per Day',
        data: sortedDates.map(date => countsByDate[date]),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
      ...protocolDatasets, // เพิ่ม datasets ของแต่ละ Protocol เข้าไป
    ],
  };

  const options = {
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default ChartByDateComponent;