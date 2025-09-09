import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { DstPortStats, ProtocolStats, SrcIpStats } from '../types';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface CombinedBarChartProps {
    protocolData?: ProtocolStats[];
    srcIpData?: SrcIpStats[];
    dstPortData?: DstPortStats[];
}

const generateBarChartData = (data: any[] | undefined, labelKey: string) => {
    const chartInputData = data ?? [];

    if (chartInputData.length === 0) {
        return null;
    }

    const uniqueTimestamps = [...new Set(chartInputData.map(item => item.timestamp))].sort();
    const uniqueLabels = [...new Set(chartInputData.map(item => item[labelKey]))];

    const datasets = uniqueLabels.map(label => {
        const dataPoints = uniqueTimestamps.map(timestamp => {
            const item = chartInputData.find(d => d.timestamp === timestamp && d[labelKey] === label);
            return item ? item.count : 0;
        });

        const randomColor = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.8)`;

        return {
            label: label as string,
            data: dataPoints,
            backgroundColor: randomColor,
            herizontal: true
        };
    });

    return {
        labels: uniqueTimestamps,
        datasets,
    };
};

const CombinedBarChart: React.FC<CombinedBarChartProps> = ({ protocolData, srcIpData, dstPortData }) => {
    const protocolChartData = generateBarChartData(protocolData, 'protocol');
    const srcIpChartData = generateBarChartData(srcIpData, 'src_ip');
    const dstPortChartData = generateBarChartData(dstPortData, 'dst_port');

    const hasData = protocolData || srcIpData || dstPortData;

    if (!hasData) {
        return <div className="no-data">No chart data available.</div>;
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Chart.js Bar Chart',
            },
        },
        scales: {
            x: {
                stacked: true,
                title: {
                    display: true,
                    text: 'Timestamp',
                }
            },
            y: {
                stacked: true,
                title: {
                    display: true,
                    text: 'Count',
                }
            },
        },
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', textAlign: 'center', alignItems: 'end', marginBottom: '30px' }}>
            {protocolChartData && (
                <div style={{ width: '400px', margin: '20px' }}>
                    <h3>Protocol Statistics</h3>
                    <Bar data={protocolChartData} options={{ ...options, plugins: { ...options.plugins, title: { ...options.plugins.title, text: 'Protocol Statistics over Time' } } }} />
                </div>
            )}
            {srcIpChartData && (
                <div style={{ width: '400px', margin: '20px' }}>
                    <h3>Source IP Statistics</h3>
                    <Bar data={srcIpChartData} options={{ ...options, plugins: { ...options.plugins, title: { ...options.plugins.title, text: 'Source IP Statistics over Time' } } }} />
                </div>
            )}
            {dstPortChartData && (
                <div style={{ width: '400px', margin: '20px' }}>
                    <h3>Destination Port Statistics</h3>
                    <Bar data={dstPortChartData} options={{ ...options, plugins: { ...options.plugins, title: { ...options.plugins.title, text: 'Destination Port Statistics over Time' } } }} />
                </div>
            )}
        </div>
    );
};

export default CombinedBarChart;