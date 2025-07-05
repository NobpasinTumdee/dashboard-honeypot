import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
interface ChartProps {
    test1: string;
    test2: string;
    test3: string;
    test4: string;
}


const Chartbar: React.FC<ChartProps> = ({ }) => {
    return (
        <>
            <div style={{ margin: '30px 10px' }}>
                <BarChart
                    sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.65)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 2,
                        padding: 2,
                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                    xAxis={[
                        {
                            id: 'barCategories',
                            data: ['Cowrie', 'Dionaea', 'Wire Shark'],
                            scaleType: 'band',
                            label: 'Overview',
                            tickLabelStyle: {
                                fill: '#000',
                                fontSize: 14,
                            },
                        },
                    ]}
                    series={[
                        { data: [1, 3, 3], color: '#E16428', },
                        { data: [2, 2, 1], color: '#F6E9E9', },
                        { data: [3, 1, 2], color: '#272121', },
                    ]}
                    height={400}
                    slotProps={{
                        tooltip: {
                            sx: {
                                backgroundColor: '#1A1A1A',
                                color: '#fff',
                                fontSize: 14,
                                borderRadius: 2,
                                padding: '4px',
                                boxShadow: '0 0 15pxrgba(16, 16, 16, 0.62)',
                            },
                        },
                    }}
                />

            </div>




            <div style={{ margin: '30px 10px' }}>
                <LineChart
                    sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.65)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 2,
                        padding: 2,
                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                    xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
                    series={[
                        {
                            data: [2, 5.5, 2, 8.5, 1.5, 5],
                        },
                    ]}
                    height={300}
                />
            </div>
        </>
    );
};

export default Chartbar;