import '../Styles/Dashborad.css'
import '../App.css'
import Aos from 'aos';
import 'aos/dist/aos.css';
import { useEffect, useState } from 'react';
import ChartComponent from './chart/Chart';
import type { AlertItem } from './Cowrie';
import { getCowrie, getCowrieAuth } from '../serviceApi';
import ChartByDateComponent from './chart/ChartByDateComponent';


const isLogin = localStorage.getItem("isLogin");

const Home = () => {
    useEffect(() => {
        (async () => {
            await handleFetchData();
            await handleFetchDataAuth();
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
            const res = await getCowrie();
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
    const [dataAuth, setDataAuth] = useState<AlertItem[]>([]);

    const handleFetchDataAuth = async () => {
        try {
            const res = await getCowrieAuth();
            const responseData = res?.data;
            if (!responseData) {
                console.error("No data received from API");
                setDataAuth([]);
                return;
            }
            if (Array.isArray(responseData)) {
                setDataAuth(responseData);
            } else if (Array.isArray(responseData?.data)) {
                setDataAuth(responseData.data);
            } else {
                console.error("Unexpected response:", responseData);
                setDataAuth([]);
            }
        } catch (error) {
            setDataAuth([])
        }
    };
    // ============================================
    return (
        <>
            <div className='main'>
                <div className='dashborad-main'>
                    <h1 style={{ textAlign: 'center' }} data-aos="zoom-in-down">Dashborad</h1>
                    {isLogin === "true" ? (
                        <>
                            <h2 style={{ textAlign: 'center' }} data-aos="zoom-in-down">Cowrie</h2>
                            <div className='chart-in-main'>
                                <div className='chart-in-sub'>
                                    <ChartComponent logs={dataAuth} />
                                </div>
                                <div className='chart-in-sub'>
                                    <ChartByDateComponent logs={dataAuth} />
                                </div>
                            </div>
                            <h2 style={{ textAlign: 'center' }} data-aos="zoom-in-down">Open Cannary</h2>
                            <div className='chart-in-main'>
                                <div className='chart-in-sub'>
                                    <ChartByDateComponent logs={dataAuth} />
                                </div>
                                <div className='chart-in-sub'>
                                    <ChartComponent logs={dataAuth} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 style={{ textAlign: 'center' }} data-aos="zoom-in-down">Cowrie</h2>
                            <p style={{ textAlign: 'center' , color: 'red'}} data-aos="zoom-in-down">Please log in to get full information.</p>
                            <div className='chart-in-main'>
                                <div className='chart-in-sub'>
                                    <ChartComponent logs={data} />
                                </div>
                                <div className='chart-in-sub'>
                                    <ChartByDateComponent logs={data} />
                                </div>
                            </div>
                            <h2 style={{ textAlign: 'center' }} data-aos="zoom-in-down">Open Cannary</h2>
                            <div className='chart-in-main'>
                                <div className='chart-in-sub'>
                                    <ChartByDateComponent logs={data} />
                                </div>
                                <div className='chart-in-sub'>
                                    <ChartComponent logs={data} />
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </>
    )
}

export default Home
