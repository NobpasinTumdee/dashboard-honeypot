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
  dst_host: string;
  dst_port: number;
  local_time: string;
  local_time_adjusted: string;
  logdata_raw: string;
  logdata_msg_logdata: string;
  logtype: number;
  node_id: string;
  src_host: string;
  src_port: number;
  utc_time: string;
  full_json_line: string;
}

interface Props {
  logs: LogData[];
}

const ChartByDateCanary: React.FC<Props> = ({ logs }) => {
  // กลุ่มข้อมูลตามวันที่ (YYYY-MM-DD)
  const countsByDate = logs.reduce<Record<string, number>>((acc, log) => {
    const date = log.local_time_adjusted.slice(0, 10); // "2025-07-01"
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  // เรียงวันที่
  const sortedDates = Object.keys(countsByDate).sort();

  const data = {
    labels: sortedDates,
    datasets: [
      {
        label: 'Events per Day',
        data: sortedDates.map(date => countsByDate[date]),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  return <Bar data={data} />;
};

export default ChartByDateCanary;
