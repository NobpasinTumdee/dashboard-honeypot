import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Aos from 'aos';
import '../App.css'
import 'aos/dist/aos.css';
import '../Styles/Dashborad.css'


import type { AlertItem } from './service/cowriePage/Cowrie';
import type { AlertItemCanary } from './service/openCanary/OpenCanary';
import type { HttpsPacket } from './service/wireShark/Packet';


import ChartComponent from './chart/cowrie/Chart';
import ChartByDateComponent from './chart/cowrie/ChartByDateComponent';
import ChartCanary from './chart/ChartCanary';
import ChartByDateCanary from './chart/ChartByDateCanary';
import { ChartPacketByDateMUI, ChartPacketMUI } from './chart/ChartPacketMUI';
import { useCanarySocket, useCowrieSocket, usePacketSocket } from './web-socket/controller';

const Home = () => {
    useEffect(() => {
        Aos.init({
            duration: 1000,
            once: true,
        });
    }, []);


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
                            {isConnected ? (<span className="status-connected">🟢 Connected to server</span>) : (<span className="status-disconnected">🔴 Disconnected from server</span>)}
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
                            <div className='not-login'>
                                <p data-aos="zoom-in-up">Welcome to Honeypot Dashboard ✨</p>
                                <h1 data-aos="zoom-in-up">Smart tiny HoneyPot</h1>
                                <h2 data-aos="zoom-in-up">See the storm before it gathers.</h2>
                                <div className='btn-home' data-aos="zoom-in-up">
                                    <Link to="/document" className='buttonLink' style={{ backgroundColor: 'var(--body_text_color)', color: 'var(--body_main_background)' }}>Dashboard Guide</Link>
                                    <Link to="/login" className='buttonLink'>Register</Link>
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
