import { BarChart, LineChart } from '@mui/x-charts'
import '../Styles/Dashborad.css'
import '../App.css'
import Aos from 'aos';
import 'aos/dist/aos.css';
import { useEffect, useState } from 'react';
import ChartComponent from './chart/Chart';
import type { AlertItem } from './Cowrie';
import { getCowrieAuth } from '../serviceApi';
import ChartByDateComponent from './chart/ChartByDateComponent';

const Home = () => {
    useEffect(() => {
        (async () => {
            await handleFetchData();
        })();
        Aos.init({
            duration: 1000,
            once: true,
        });
    }, []);



    // ============================================ cowrie data
    const [data, setData] = useState<AlertItem[]>([]);

    const handleFetchData = async () => {
        try {
            const res = await getCowrieAuth();
            const responseData = res?.data;
            if (!responseData) {
                console.error("No data received from API");
                setData([]);
                return;
            }
            if (Array.isArray(responseData)) {
                setData(responseData);
            } else if (Array.isArray(responseData?.data)) {
                setData(responseData.data);
            } else {
                console.error("Unexpected response:", responseData);
                setData([]);
            }
        } catch (error) {
            setData([])
        }
    };
    // ============================================
    return (
        <>
            <div className='main'>
                <div className='dashborad-main'>
                    <h1 style={{ textAlign: 'center' }} data-aos="zoom-in-down">Dashborad</h1>
                    <h2 style={{ textAlign: 'center' }} data-aos="zoom-in-down">Cowrie</h2>
                    <div className='chart-in-main'>
                        <div className='chart-in-sub'>
                            <ChartComponent logs={data} />
                        </div>
                        <div className='chart-in-sub'>
                            <ChartByDateComponent logs={data} />
                        </div>
                    </div>
                    <h2 style={{ textAlign: 'center' }} data-aos="zoom-in-down">Dionaea</h2>
                    <div className='chart-in-main'>
                        <div className='chart-in-sub'>
                            <ChartByDateComponent logs={data} />
                        </div>
                        <div className='chart-in-sub'>
                            <ChartComponent logs={data} />
                        </div>
                    </div>
                    <>
                        <div className='overview-in-main'>
                            <div className='chart-mini-size' data-aos="zoom-out" data-aos-duration="500">
                                <p>Cowrie</p>
                                <LineChart
                                    sx={{
                                        backdropFilter: 'blur(10px)',
                                        backgroundColor: 'var(--line_header)',
                                        borderRadius: 2,
                                        border: '1px solid var(--line_header)',
                                        margin: '10px'
                                    }}
                                    xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
                                    series={[
                                        {
                                            data: [2, 5.5, 2, 8.5, 1.5, 5],
                                        },
                                    ]}
                                    height={200}
                                />
                            </div>
                            <div className='chart-mini-size' data-aos="zoom-out" data-aos-duration="1000">
                                <p>Dionaea</p>
                                <LineChart
                                    sx={{
                                        backdropFilter: 'blur(10px)',
                                        backgroundColor: 'var(--line_header)',
                                        borderRadius: 2,
                                        border: '1px solid var(--line_header)',
                                        margin: '10px'
                                    }}
                                    xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
                                    series={[
                                        {
                                            data: [2, 2, 6, 8.5, 1.5, 5],
                                        },
                                    ]}
                                    height={200}
                                />
                            </div>
                            <div className='chart-mini-size' data-aos="zoom-out" data-aos-duration="2000">
                                <p>Wire Shark</p>
                                <LineChart
                                    sx={{
                                        backdropFilter: 'blur(10px)',
                                        backgroundColor: 'var(--line_header)',
                                        borderRadius: 2,
                                        border: '1px solid var(--line_header)',
                                        margin: '10px'
                                    }}
                                    xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
                                    series={[
                                        {
                                            data: [2, 5, 1, 8.5, 15, 5],
                                        },
                                    ]}
                                    height={200}
                                />
                            </div>
                        </div>
                        <div className='overview-in-main'>
                            <div className='chart-mini-size' data-aos="fade-up" data-aos-duration="2000">
                                <p>Overview</p>
                                <BarChart
                                    xAxis={[{ data: ['group A', 'group B', 'group C'] }]}
                                    series={[{ data: [4, 3, 5], color: '#8470FF' }, { data: [1, 6, 3], color: '#67BFFF' }, { data: [2, 5, 6], color: '#61C8B5' }]}
                                />
                            </div>
                            <div className='chart-mini-size' data-aos="fade-up" data-aos-duration="2500">
                                <p>I don't Know bro.</p>
                                <BarChart
                                    xAxis={[{ data: ['group A', 'group B', 'group C'] }]}
                                    series={[{ data: [4, 3, 5], color: '#8470FF' }, { data: [1, 6, 3], color: '#67BFFF' }, { data: [2, 5, 6], color: '#61C8B5' }]}
                                />
                            </div>
                        </div>
                    </>

                </div>
            </div>
        </>
    )
}

export default Home
