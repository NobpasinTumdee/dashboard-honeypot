import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import type { ProtocolStats, SrcIpStats, DstPortStats } from '../../service/wireShark/type';

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

    const labels = chartInputData.map(item => item[labelKey]);
    const counts = chartInputData.map(item => item.count);
    const backgroundColors = [
        '#43362C',
        '#7A4440',
        '#CFBC9B',
        '#9F9E98',
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