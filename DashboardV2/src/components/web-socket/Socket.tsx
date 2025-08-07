import { useEffect, useState } from "react";
import DateTimeNow from "../DateTimeNow";
import type { AlertItem } from "../Cowrie";
import '../../Styles/Dashborad.css'

import Aos from 'aos';
import 'aos/dist/aos.css';
import { useCowrieSocket } from "./controller";

const SocketPage = () => {
    const [data, setData] = useState<AlertItem[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isLogin, setIsLogin] = useState(false);

    // Custom hook to manage WebSocket connection
    useCowrieSocket(setData, setIsConnected, setIsLogin);

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

    useEffect(() => { Aos.init({ duration: 1000, once: true, }); }, []);

    return (
        <>
            <h2 style={{ fontWeight: "900", textAlign: "center" }} data-aos="fade-down">
                WebSocket cowrie test
            </h2>
            <p style={{ fontWeight: "400", textAlign: "center" }} data-aos="fade-down">
                WebSocket connection status:{" "}
                {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
            </p>
            <div data-aos="flip-left">
                <DateTimeNow />
            </div>

            {isLogin ? (
                <>
                    <div className="table-container" data-aos="fade-up">
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ backdropFilter: "blur(10px)" }}>
                                    <th className="thStyle">#</th>
                                    <th className="thStyle">Timestamp</th>
                                    <th className="thStyle">Event</th>
                                    <th className="thStyle">Message</th>
                                    <th className="thStyle">Protocol</th>
                                    <th className="thStyle">Source IP</th>
                                    <th className="thStyle">Source Port</th>
                                    <th className="thStyle">Dst IP</th>
                                    <th className="thStyle">Dst Port</th>
                                    <th className="thStyle">username</th>
                                    <th className="thStyle">password</th>
                                    <th className="thStyle">input</th>
                                    <th className="thStyle">command</th>
                                    <th className="thStyle">Session</th>
                                    <th className="thStyle">Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((item, index) => (
                                    <tr key={item.id || index}>
                                        <td className="tdStyle">{startIndex + index + 1}</td>
                                        <td className="tdStyle">{item.timestamp || <p className="tdStyle-null">null</p>}</td>
                                        <td className="tdStyle">{item.eventid || <p className="tdStyle-null">null</p>}</td>
                                        <td className="tdStyleMessage">{item.message || <p className="tdStyle-null">null</p>}</td>
                                        <td className="tdStyle">{item.protocol || <p className="tdStyle-null">null</p>}</td>
                                        <td className="tdStyle">{item.src_ip || <p className="tdStyle-null">null</p>}</td>
                                        <td className="tdStyle">{item.src_port || <p className="tdStyle-null">null</p>}</td>
                                        <td className="tdStyle">{item.dst_ip || <p className="tdStyle-null">null</p>}</td>
                                        <td className="tdStyle">{item.dst_port || <p className="tdStyle-null">null</p>}</td>
                                        <td className="tdStyle">{item.username || <p className="tdStyle-null">null</p>}</td>
                                        <td className="tdStyle">{item.password || <p className="tdStyle-null">null</p>}</td>
                                        <td className="tdStyle">{item.input || <p className="tdStyle-null">null</p>}</td>
                                        <td className="tdStyle">{item.command || <p className="tdStyle-null">null</p>}</td>
                                        <td className="tdStyle">{item.session || <p className="tdStyle-null">null</p>}</td>
                                        <td className="tdStyle">{item.duration || <p className="tdStyle-null">null</p>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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

export default SocketPage;
