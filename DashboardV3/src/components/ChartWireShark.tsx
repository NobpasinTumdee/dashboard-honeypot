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
    
    // คำนวณสีอัตโนมัติตามจำนวนข้อมูลที่ถูกหั่นมาแล้ว (สูงสุด 10 อันดับ)
    const count = labels.length;
    const backgroundColors = Array.from({ length: count }, (_, i) => 
        `hsla(${(i * 360) / count}, 70%, 60%, 0.6)`
    );
    const borderColors = Array.from({ length: count }, (_, i) => 
        `hsla(${(i * 360) / count}, 70%, 50%, 1)`
    );

    return {
        labels,
        datasets: [
            {
                label: chartLabel,
                data: counts,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
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