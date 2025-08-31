import { useEffect, useState } from 'react';
import { usePacketSocket } from './controller';
import Aos from 'aos';
import 'aos/dist/aos.css';
import '../../Styles/Dashborad.css';
import DateTimeNow from '../DateTimeNow';

export interface HttpsPacket {
    id: number;
    timestamp: string;
    src_ip: string;
    src_port: string;
    dst_ip: string;
    dst_port: string;
    method: string;
    request_uri: string;
    userAgent: string;
}

const LogDisplay = () => {
    const [data, setData] = useState<HttpsPacket[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isLogin, setIsLogin] = useState(false);

    // Custom hook to manage WebSocket connection
    usePacketSocket(setData, setIsConnected, setIsLogin);

    // Filter by eventid
    const [protocolFilter, setProtocolFilter] = useState("");
    const handleSelectChange = (event: any) => {
        setProtocolFilter(event.target.value);
    };
    const filteredData = data.filter((item) =>
        protocolFilter
            ? (item.method && item.method.toLowerCase() === protocolFilter.toLowerCase())
            : true
    );

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Calculate the current items to display based on pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

    // Calculate counts for each method
    const getCount = data.filter(item => item.method?.toUpperCase() === 'GET').length;
    const postCount = data.filter(item => item.method?.toUpperCase() === 'POST').length;
    const putCount = data.filter(item => item.method?.toUpperCase() === 'PUT').length;
    const deleteCount = data.filter(item => item.method?.toUpperCase() === 'DELETE').length;

    useEffect(() => { Aos.init({ duration: 1000, once: true, }); }, []);


    return (
        <>
            <div style={{ margin: '10px 5% 20px', textAlign: 'left' }} data-aos="zoom-in-down">
                <h1>Http/Https Logs</h1>
            </div>
            <div className='dashboard-container-box'>
                <div className='box-alert' data-aos="fade-down" data-aos-duration="200">
                    <div>
                        <h2 style={{ margin: '0' }}>Total</h2>
                        <h1 style={{ margin: '0' }}>{data.length}</h1>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" height="45px" viewBox="0 -960 960 960" width="45px" fill="#d1c172ff"><path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 412L346-160H160v-186L28-480l132-134v-186h186l134-132 134 132h186v186l132 134-132 134v186H614L480-28Zm0-112 100-100h140v-140l100-100-100-100v-140H580L480-820 380-720H240v140L140-480l100 100v140h140l100 100Zm0-340Z" /></svg>
                </div>
                <div className='box-alert' data-aos="fade-down" data-aos-duration="400">
                    <div>
                        <h2 style={{ margin: '0' }}>GET</h2>
                        <h1 style={{ margin: '0' }}>{getCount}</h1>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" height="45px" viewBox="0 -960 960 960" width="45px" fill="#12a022ff"><path d="M200-120q-33 0-56.5-23.5T120-200v-400q0-33 23.5-56.5T200-680h160v80H200v400h560v-400H600v-80h160q33 0 56.5 23.5T840-600v400q0 33-23.5 56.5T760-120H200Zm280-200L320-480l56-56 64 63v-487h80v487l64-63 56 56-160 160Z"/></svg>
                </div>
                <div className='box-alert' data-aos="fade-down" data-aos-duration="600">
                    <div>
                        <h2 style={{ margin: '0' }}>POST</h2>
                        <h1 style={{ margin: '0' }}>{postCount}</h1>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" height="45px" viewBox="0 -960 960 960" width="45px" fill="#e57803ff"><path d="M240-40q-33 0-56.5-23.5T160-120v-440q0-33 23.5-56.5T240-640h120v80H240v440h480v-440H600v-80h120q33 0 56.5 23.5T800-560v440q0 33-23.5 56.5T720-40H240Zm200-280v-447l-64 64-56-57 160-160 160 160-56 57-64-64v447h-80Z"/></svg>
                </div>
                <div className='box-alert' data-aos="fade-down" data-aos-duration="800">
                    <div>
                        <h2 style={{ margin: '0' }}>PUT</h2>
                        <h1 style={{ margin: '0' }}>{putCount}</h1>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" height="45px" viewBox="0 -960 960 960" width="45px" fill="#c4ae25ff"><path d="M560-80v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T903-300L683-80H560Zm300-263-37-37 37 37ZM620-140h38l121-122-18-19-19-18-122 121v38ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v120h-80v-80H520v-200H240v640h240v80H240Zm280-400Zm241 199-19-18 37 37-18-19Z"/></svg>
                </div>
                <div className='box-alert' data-aos="fade-down" data-aos-duration="1000">
                    <div>
                        <h2 style={{ margin: '0' }}>DELETE</h2>
                        <h1 style={{ margin: '0' }}>{deleteCount}</h1>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" height="45px" viewBox="0 -960 960 960" width="45px" fill="#ff0000ff"><path d="M580-280h80q25 0 42.5-17.5T720-340v-160h40v-60H660v-40h-80v40H480v60h40v160q0 25 17.5 42.5T580-280Zm0-220h80v160h-80v-160ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640v400q0 33-23.5 56.5T800-160H160Zm0-80h640v-400H447l-80-80H160v480Zm0 0v-480 480Z"/></svg>
                </div>
            </div>
            <div style={{ fontWeight: "400", textAlign: "center", display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 5%' }}>
                <p style={{ margin: '0px' }}>
                    มีจำนวนทั้งสิ้น {data.length} รายการ{" "}
                    {protocolFilter && `| Filtered by: ${protocolFilter} `}
                    <select value={protocolFilter} onChange={handleSelectChange}>
                        <option value="">All</option>
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                    </select>
                </p>
                <p data-aos="fade-down" style={{ margin: '0px' }}>
                    WebSocket connection status:{" "}
                    {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
                </p>
            </div>
            {isLogin ? (
                <>
                    {data.length === 0 ? (
                        <div style={{ textAlign: 'center', margin: '20px' }} data-aos="zoom-in-up">
                            <h1>please login for full data.</h1>
                        </div>
                    ) : (
                        <>
                            <div className="table-container">
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ backdropFilter: "blur(10px)" }}>
                                            <th className="thStyle">ID</th>
                                            <th className="thStyle">Timestamp</th>
                                            <th className="thStyle">Source IP</th>
                                            <th className="thStyle">Source Port</th>
                                            <th className="thStyle">Destination IP</th>
                                            <th className="thStyle">Destination Port</th>
                                            <th className="thStyle">Method</th>
                                            <th className="thStyle">Request URI</th>
                                            <th className="thStyle">User Agent</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.map((log, index) => (
                                            <tr key={log.id || index}>
                                                <td className="tdStyle">{index + 1}</td>
                                                <td className="tdStyle">{new Date(log.timestamp).toLocaleString()}</td>
                                                <td className="tdStyle">{log.src_ip}</td>
                                                <td className="tdStyle">{log.src_port}</td>
                                                <td className="tdStyle">{log.dst_ip}</td>
                                                <td className="tdStyle">{log.dst_port}</td>
                                                <td className="tdStyle">{log.method}</td>
                                                <td className="tdStyle">{log.request_uri}</td>
                                                <td className="tdStyleMessage">{log.userAgent}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div data-aos="flip-left">
                                <DateTimeNow />
                            </div>
                            <div style={{ margin: "2% 0 10%", textAlign: "center" }}>
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="pagination-button"
                                >
                                    ◀ Prev
                                </button>
                                <span>Page {currentPage} of {totalPages}</span>
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="pagination-button"
                                >
                                    Next ▶
                                </button>
                            </div>
                        </>
                    )}
                </>
            ) : (
                <>
                    <p style={{ textAlign: "center", color: "red", fontWeight: "bold", fontSize: "3rem" }} data-aos="fade-up">
                        Please login to view the data.
                    </p>
                </>
            )}


        </>
    );
};

export default LogDisplay;