import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import type { AlertItem } from '../Cowrie';
import './chart.css'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// กำหนด Props สำหรับคอมโพเนนต์
interface TopCredentialsChartProps {
    data: AlertItem[];
}

const TopCredentialsChart: React.FC<TopCredentialsChartProps> = ({ data }) => {

    // เตรียมข้อมูลสำหรับกราฟ Top 10 Passwords
    const passwordChartData = useMemo(() => {
        const passwordCounts: Record<string, number> = {};
        data.forEach(item => {
            if (item.password) {
                passwordCounts[item.password] = (passwordCounts[item.password] || 0) + 1;
            }
        });

        const sortedPasswords = Object.entries(passwordCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 10);

        const labels = sortedPasswords.map(([password]) => password);
        const counts = sortedPasswords.map(([, count]) => count);

        return {
            labels,
            datasets: [
                {
                    label: 'Total amount',
                    data: counts,
                    backgroundColor: (ctx: any) => {
                        const chart = ctx.chart;
                        const { ctx: canvas } = chart;
                        const gradient = canvas.createLinearGradient(0, 0, 0, 200);
                        gradient.addColorStop(0, "rgba(255, 159, 64, 0.9)");
                        gradient.addColorStop(1, "rgba(255, 205, 86, 0.6)");
                        return gradient;
                    },
                },
            ],
        };
    }, [data]);

    // เตรียมข้อมูลสำหรับกราฟ Top 10 Usernames
    const usernameChartData = useMemo(() => {
        const usernameCounts: Record<string, number> = {};
        data.forEach(item => {
            if (item.username) {
                usernameCounts[item.username] = (usernameCounts[item.username] || 0) + 1;
            }
        });

        const sortedUsernames = Object.entries(usernameCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 10);

        const labels = sortedUsernames.map(([username]) => username);
        const counts = sortedUsernames.map(([, count]) => count);

        return {
            labels,
            datasets: [
                {
                    label: 'Total amount',
                    data: counts,
                    backgroundColor: (ctx: any) => {
                        const chart = ctx.chart;
                        const { ctx: canvas } = chart;
                        const gradient = canvas.createLinearGradient(0, 0, 0, 200);
                        gradient.addColorStop(0, "rgba(179, 255, 64, 0.9)");
                        gradient.addColorStop(1, "rgba(86, 255, 125, 0.6)");
                        return gradient;
                    },
                },
            ],
        };
    }, [data]);


    // เตรียมข้อมูลสำหรับกราฟ Protocol (ssh or telnet)
    const protocolChartData = useMemo(() => {
        const protocolCounts: Record<string, number> = {
            'ssh': 0,
            'telnet': 0
        };
        data.forEach(item => {
            const protocol = item.protocol;
            if (protocol === 'ssh' || protocol === 'telnet') {
                protocolCounts[protocol] = (protocolCounts[protocol] || 0) + 1;
            }
        });

        const labels = Object.keys(protocolCounts);
        const counts = Object.values(protocolCounts);

        return {
            labels,
            datasets: [
                {
                    label: 'total protocol',
                    data: counts,
                    backgroundColor: (ctx: any) => {
                        const chart = ctx.chart;
                        const { ctx: canvas } = chart;
                        const gradient = canvas.createLinearGradient(0, 0, 0, 200);
                        gradient.addColorStop(0, "rgba(64, 191, 255, 0.9)");
                        gradient.addColorStop(1, "rgba(86, 114, 255, 0.6)");
                        return gradient;
                    },
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
                    text: 'Number of times'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Password or Username'
                }
            }
        }
    };

    if (!data || data.length === 0) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>ไม่พบข้อมูลรหัสผ่านและชื่อผู้ใช้</div>;
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            width: '100%',
            maxWidth: '1400px',
            margin: '0 auto'
        }}>
            <div className='modal-chart'>
                <h2 style={{ textAlign: 'center' }}>Protocol</h2>
                <Bar data={protocolChartData} options={options} />
            </div>
            <div className='modal-chart'>
                <h2 style={{ textAlign: 'center' }}>Top 10 Username</h2>
                <Bar data={usernameChartData} options={options} />
            </div>
            <div className='modal-chart'>
                <h2 style={{ textAlign: 'center' }}>Top 10 Password</h2>
                <Bar data={passwordChartData} options={options} />
            </div>
        </div>
    );
};

export default TopCredentialsChart;