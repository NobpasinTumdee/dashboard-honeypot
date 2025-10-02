import React, { useRef } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title);

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
  const chartRef = useRef<any>(null);

  const logdataCounts: Record<string, number> = {};
  logs.forEach(item => {
    const message = item.logdata_msg_logdata || 'Other';
    logdataCounts[message] = (logdataCounts[message] || 0) + 1;
  });

  const sortedLogdata = Object.entries(logdataCounts)
    .sort(([, countA], [, countB]) => countB - countA);

  const labels = sortedLogdata.map(([message]) => {
    if (message === 'Added service from class CanaryHTTP in opencanary.modules.http to fake') {
      return 'HTTP';
    } else if (message === 'Added service from class CanaryHTTPS in opencanary.modules.https to fake') {
      return 'HTTPS';
    } else if (message === 'Added service from class CanaryFTP in opencanary.modules.ftp to fake') {
      return 'FTP';
    } else if (message === 'Canary running!!!') {
      return 'running';
    } else {
      return message.slice(0, 20) + '...';
    }
  });
  const counts = sortedLogdata.map(([, count]) => count);

  const data = {
    labels,
    datasets: [
      {
        label: "Log Message Count",
        data: counts,
        backgroundColor: (ctx: any) => {
          const chart = ctx.chart;
          const { ctx: canvas } = chart;
          const gradient = canvas.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, "rgba(255, 159, 64, 0.9)");
          gradient.addColorStop(1, "rgba(255, 205, 86, 0.6)");
          return gradient;
        },
        borderRadius: 8,
      },
    ],
  };


  return <Bar ref={chartRef} data={data} />;
};

export default ChartCanary;
