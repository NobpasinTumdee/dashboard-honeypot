import '../Styles/Dashborad.css'
import '../App.css'
import Aos from 'aos';
import 'aos/dist/aos.css';
import { useEffect, useState } from 'react';
import ChartComponent from './chart/Chart';
import type { AlertItem } from './Cowrie';
import { getCowrieAuth, getOpenCanaryAuth } from '../serviceApi';
import ChartByDateComponent from './chart/ChartByDateComponent';
import { useCanarySocket, useCowrieSocket, usePacketSocket } from './web-socket/controller';
import type { AlertItemCanary } from './OpenCanary';
import ChartCanary from './chart/ChartCanary';
import ChartByDateCanary from './chart/ChartByDateCanary';
import { ChartPacketByDateMUI, ChartPacketMUI } from './chart/ChartPacketMUI';
import type { HttpsPacket } from './web-socket/Packet';



const Home = () => {
    useEffect(() => {
        (async () => {
            await handleFetchCowrieData();
            await handleFetchCanaryData();
        })();
        Aos.init({
            duration: 1000,
            once: true,
        });
    }, []);



    // ============================================ cowrie data
    const [dataCowrieApi, setDataCowrieApi] = useState<AlertItem[]>([]);
    const [dataCanaryApi, setDataCanaryApi] = useState<AlertItemCanary[]>([]);

    const handleFetchCowrieData = async () => {
        try {
            const res = await getCowrieAuth();
            const responseData = res?.data;
            if (!responseData) {
                console.error("No data received from API");
                setDataCowrieApi([]);
                return;
            }
            if (Array.isArray(responseData)) {
                setDataCowrieApi(responseData);
            } else if (Array.isArray(responseData?.data)) {
                setDataCowrieApi(responseData.data);
            } else {
                console.error("Unexpected response:", responseData);
                setDataCowrieApi([]);
            }
        } catch (error) {
            setDataCowrieApi([])
        }
    };

    const handleFetchCanaryData = async () => {
        try {
            const res = await getOpenCanaryAuth();
            const responseData = res?.data;
            if (!responseData) {
                console.error("No data received from API");
                setDataCanaryApi([]);
                return;
            }
            if (Array.isArray(responseData)) {
                setDataCanaryApi(responseData);
            } else if (Array.isArray(responseData?.data)) {
                setDataCanaryApi(responseData.data);
            } else {
                console.error("Unexpected response:", responseData);
                setDataCanaryApi([]);
            }
        } catch (error) {
            setDataCanaryApi([])
        }
    };


    const [dataCowrie, setDataCowrie] = useState<AlertItem[]>([]);
    const [dataCanary, setDataCanary] = useState<AlertItemCanary[]>([]);
    const [dataShark, setDataShark] = useState<HttpsPacket[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isLogin, setIsLogin] = useState(false);

    // Custom hook to manage WebSocket connection
    useCowrieSocket(setDataCowrie, setIsConnected, setIsLogin);
    useCanarySocket(setDataCanary, setIsConnected, setIsLogin);
    usePacketSocket(setDataShark, setIsConnected, setIsLogin);
    // ============================================
    return (
        <>
            <div className='main'>
                <div className='dashborad-main'>
                    {isLogin ? (
                        <>
                            <h1 style={{ textAlign: 'center' }} data-aos="zoom-in-down">Welcome to Honeypot Dashboard</h1>
                            <h2 style={{ textAlign: 'center' }} data-aos="zoom-in-down">Wireshark</h2>
                            <div className='chart-in-main'>
                                <div className='chart-in-sub'>
                                    <ChartPacketMUI logs={dataShark} />
                                </div>
                                <div className='chart-in-sub'>
                                    <ChartPacketByDateMUI logs={dataShark} />
                                </div>
                            </div>
                            <h2 style={{ textAlign: 'center' }} data-aos="zoom-in-down">Cowrie</h2>
                            <div className='chart-in-main'>
                                <div className='chart-in-sub'>
                                    <ChartComponent logs={dataCowrie} />
                                </div>
                                <div className='chart-in-sub'>
                                    <ChartByDateComponent logs={dataCowrie} />
                                </div>
                            </div>
                            <h2 style={{ textAlign: 'center' }} data-aos="zoom-in-down">Open Cannary</h2>
                            <div className='chart-in-main'>
                                <div className='chart-in-sub'>
                                    <ChartCanary logs={dataCanary} />
                                    <ChartByDateCanary logs={dataCanary} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <h1 style={{ textAlign: 'center' }} data-aos="zoom-in-down">Example Log Data</h1>
                            <p style={{ textAlign: 'center' }}>{isConnected ? 'Connected' : 'Disconnected'}</p>
                            <h2 style={{ textAlign: 'center' }} data-aos="zoom-in-down">Cowrie</h2>
                            <div className='chart-in-main-none-login'>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ backdropFilter: "blur(10px)" }}>
                                            <th className="thStyle">#</th>
                                            <th className="thStyle">Timestamp</th>
                                            <th className="thStyle">Event</th>
                                            <th className="thStyle">Message</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dataCowrieApi.map((item, index) => (
                                            <tr key={item.id || index}>
                                                <td className="tdStyle">{index + 1}</td>
                                                <td className="tdStyle">{item.timestamp.slice(0, 10) || <p className="tdStyle-null">null</p>}</td>
                                                <td className="tdStyle">{item.eventid || <p className="tdStyle-null">null</p>}</td>
                                                <td className="tdStyleMessage">{item.message || <p className="tdStyle-null">null</p>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <h2 style={{ textAlign: 'center' }} data-aos="zoom-in-down">Open Cannary</h2>
                            <div className='chart-in-main-none-login'>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ backdropFilter: "blur(10px)" }}>
                                            <th className="thStyle">#</th>
                                            <th className="thStyle">Adjusted Local Time</th>
                                            <th className="thStyle">Log Message</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dataCanaryApi.map((item, index) => (
                                            <tr key={item.id || index}>
                                                <td className="tdStyle">{index + 1}</td>
                                                <td className="tdStyle">{item.local_time_adjusted.slice(0, 10) || <p className="tdStyle-null">null</p>}</td>
                                                <td className="tdStyleMessage">{item.logdata_msg_logdata || <p className="tdStyle-null">null</p>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p style={{ textAlign: 'center', color: 'red' }} data-aos="zoom-in-down">Please log in to get full information.</p>
                        </>
                    )}

                </div>
            </div>
        </>
    )
}

export default Home
