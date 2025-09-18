import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import type { DstPortStats, ProtocolStats, SrcIpStats } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CombinedPieChartProps {
    protocolData?: ProtocolStats[];
    srcIpData?: SrcIpStats[];
    dstPortData?: DstPortStats[];
}

const generateChartData = (data: any[] | undefined, labelKey: string, chartLabel: string) => {
    const chartInputData = data ?? [];

    if (chartInputData.length === 0) {
        return null;
    }

    // กำหนด type ให้เป็น Record<string, number>
    const aggregatedData: Record<string, number> = chartInputData.reduce((acc, item) => {
        acc[item[labelKey]] = (acc[item[labelKey]] || 0) + item.count;
        return acc;
    }, {} as Record<string, number>);

    // แปลงเป็น array เพื่อง่ายต่อการ sort
    const aggregatedArray = Object.entries(aggregatedData)
        .map(([label, count]) => ({ label, count: count as number })) 
        .sort((a, b) => b.count - a.count) // เรียงจากมากไปน้อย
        .slice(0, 10); // เอาแค่ 10 อันดับแรก

    const labels = aggregatedArray.map(item => item.label);
    const counts = aggregatedArray.map(item => item.count);

    const backgroundColors = [
        '#BFBFBF',
        '#8B8B8D',
        '#3F464C',
        '#69686D',
        '#4B4E55',
        '#4A4E50',
        '#8D867C',
        '#A99F93',
        '#868E91',
        '#677077',
    ];

    return {
        labels,
        datasets: [
            {
                label: chartLabel,
                data: counts,
                backgroundColor: backgroundColors.slice(0, labels.length),
                borderColor: backgroundColors.map(color => color.replace('0.6', '1')),
                borderWidth: 1,
            },
        ],
    };
};



const CombinedPieChart: React.FC<CombinedPieChartProps> = ({ protocolData, srcIpData, dstPortData }) => {
    const protocolChartData = generateChartData(protocolData, 'protocol', 'Protocol Count');
    const srcIpChartData = generateChartData(srcIpData, 'src_ip', 'Source IP Count');
    const dstPortChartData = generateChartData(dstPortData, 'dst_port', 'Destination Port Count');
    
    const hasData = protocolData || srcIpData || dstPortData;

    if (!hasData) {
        return <div className="no-data">No chart data available.</div>;
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap',textAlign: 'center', alignItems:'end' ,marginBottom: '30px'}}>
            {protocolChartData && (
                <div style={{ width: '250px', margin: '20px' }}>
                    <h3>Protocol Statistics</h3>
                    <Pie data={protocolChartData} />
                </div>
            )}
            {srcIpChartData && (
                <div style={{ width: '300px', margin: '20px' }}>
                    <h3>Source IP Statistics</h3>
                    <Pie data={srcIpChartData} />
                </div>
            )}
            {dstPortChartData && (
                <div style={{ width: '250px', margin: '20px' }}>
                    <h3>Destination Port Statistics</h3>
                    <Pie data={dstPortChartData} />
                </div>
            )}
        </div>
    );
};

export default CombinedPieChart;