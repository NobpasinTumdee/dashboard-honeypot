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

const ChartByDateCanary: React.FC<Props> = ({ logs }) => {
  const chartRef = useRef<any>(null);

  // นับจำนวน log ตามวันที่
  const countsByDate = logs.reduce<Record<string, number>>((acc, log) => {
    const date = log.local_time_adjusted.slice(0, 10);
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const sortedDates = Object.keys(countsByDate).sort();

  const data = {
    labels: sortedDates,
    datasets: [
      {
        label: "Events per Day",
        data: sortedDates.map((date) => countsByDate[date]),
        backgroundColor: (ctx: any) => {
          const chart = ctx.chart;
          const { ctx: canvas } = chart;
          const gradient = canvas.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, "rgba(75, 192, 192, 0.9)");
          gradient.addColorStop(1, "rgba(153, 102, 255, 0.6)");
          return gradient;
        },
        borderRadius: 8,
      },
    ],
  };


  return <Bar ref={chartRef} data={data} />;
};

export default ChartByDateCanary;
