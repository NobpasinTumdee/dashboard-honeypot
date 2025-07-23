// src/components/ChartComponent.tsx

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';

// ลงทะเบียน components ที่ต้องใช้กับ Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// ประกาศ type ของ log (คุณสามารถแยกไปไว้ใน types.ts ก็ได้)
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

const ChartComponent: React.FC<Props> = ({ logs }) => {
  const eventCounts = logs.reduce<Record<string, number>>((acc, log) => {
    acc[log.protocol] = (acc[log.protocol] || 0) + 1;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(eventCounts),
    datasets: [
      {
        label: 'Protocol',
        data: Object.values(eventCounts),
        backgroundColor: '#DFD7AF',
      },
    ],
  };

  return <Bar data={data} />;
};

export default ChartComponent;
