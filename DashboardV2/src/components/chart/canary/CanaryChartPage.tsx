import React, { useMemo } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
} from 'chart.js';
import type { AlertItemCanary } from '../../service/openCanary/OpenCanary';
import '../chart.css'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement
);

interface CanaryAlertsChartProps {
    data: AlertItemCanary[];
}

const CanaryAlertsChart: React.FC<CanaryAlertsChartProps> = ({ data }) => {

    // กราฟที่ 1: นับจำนวน Packet ตาม logdata_msg_logdata
    const logdataChartData = useMemo(() => {
        const logdataCounts: Record<string, number> = {};
        data.forEach(item => {
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
            }
            // ถ้าไม่ใช่ชื่อที่ต้องการ ก็ใช้ชื่อเดิม
            return message;
        });
        const counts = sortedLogdata.map(([, count]) => count);

        return {
            labels,
            datasets: [
                {
                    label: 'จำนวนแพ็กเก็ต',
                    data: counts,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                },
            ],
        };
    }, [data]);

    // กราฟที่ 2: นับจำนวน Packet รายวัน
    const dailyChartData = useMemo(() => {
        const dailyCounts: Record<string, number> = {};
        data.forEach(item => {
            const date = item.local_time_adjusted.split(' ')[0]; // แยกวันที่จาก 'YYYY-MM-DD HH:mm:ss'
            dailyCounts[date] = (dailyCounts[date] || 0) + 1;
        });

        const sortedDates = Object.keys(dailyCounts).sort();

        const labels = sortedDates;
        const counts = sortedDates.map(date => dailyCounts[date]);

        return {
            labels,
            datasets: [
                {
                    label: 'จำนวนแพ็กเก็ตทั้งหมด',
                    data: counts,
                    fill: false,
                    backgroundColor: 'rgb(255, 99, 132)',
                    borderColor: 'rgba(255, 99, 132, 0.5)',
                },
            ],
        };
    }, [data]);

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'จำนวน'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'ข้อมูล'
                }
            }
        }
    };

    if (!data || data.length === 0) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>ไม่พบข้อมูล Alert</div>;
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            width: '100%',
            maxWidth: '1400px',
            margin: '0 auto 20px',
        }}>
            <div className='modal-chart'>
                <h2 style={{ textAlign: 'center' }}>Protocol</h2>
                <Bar data={logdataChartData} options={options} />
            </div>
            <div className='modal-chart'>
                <h2 style={{ textAlign: 'center' }}>Packets per Day</h2>
                <Line data={dailyChartData} options={options} />
            </div>
        </div>
    );
};

export default CanaryAlertsChart;