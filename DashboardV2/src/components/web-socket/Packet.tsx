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


    useEffect(() => { Aos.init({ duration: 1000, once: true, }); }, []);


    return (
        <>
            <div style={{ margin: '10px 5% 20px', textAlign: 'left' }} data-aos="zoom-in-down">
                <h1>Packets Logs</h1>
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
                            <div style={{ margin: "2% 0 10%", textAlign: "center" }} data-aos="fade-down">
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