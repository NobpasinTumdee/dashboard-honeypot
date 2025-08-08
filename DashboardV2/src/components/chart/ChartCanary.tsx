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

const ChartCanary: React.FC<Props> = ({ logs }) => {
  const messageCounts = logs.reduce<Record<string, number>>((acc, log) => {
    const message = log.logdata_msg_logdata || 'Unknown';
    acc[message] = (acc[message] || 0) + 1;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(messageCounts),
    datasets: [
      {
        label: 'Log Message Count',
        data: Object.values(messageCounts),
        backgroundColor: '#DFD7AF',
      },
    ],
  };

  return <Bar data={data} />;
};

export default ChartCanary;
