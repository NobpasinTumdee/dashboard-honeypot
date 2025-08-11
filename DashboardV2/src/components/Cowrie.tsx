import { useEffect, useState } from 'react';
import '../Styles/Dashborad.css'
import DateTimeNow from './DateTimeNow';
import Aos from 'aos';
import 'aos/dist/aos.css';
import { useCowrieSocket } from './web-socket/controller';

export type AlertItem = {
    id: number;
    timestamp: string;
    eventid: string;
    session: string;
    message: string;
    protocol: string;
    src_ip: string;
    src_port: number;
    dst_ip: string;
    dst_port: number;
    username: string;
    password: string;
    input: string;
    command: string;
    duration: Float32Array;
    ttylog: string;
    json_data: string;
};



const CowriePage = () => {
    const [data, setData] = useState<AlertItem[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isLogin, setIsLogin] = useState(false);

    // Custom hook to manage WebSocket connection
    useCowrieSocket(setData, setIsConnected, setIsLogin);

    // Filter by eventid
    const [protocolFilter, setProtocolFilter] = useState("");
    const handleSelectChange = (event: any) => {
        setProtocolFilter(event.target.value);
    };
    const filteredData = data.filter((item) =>
        protocolFilter
            ? (item.eventid && item.eventid.toLowerCase() === protocolFilter.toLowerCase())
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


    const handleDownload = () => {
        // กำหนด Headers จาก AlertItem type
        const headers = ["id", "timestamp", "eventid", "session", "message", "protocol", "src_ip", "src_port", "dst_ip", "dst_port", "username", "password", "input", "command", "duration", "ttylog", "json_data"];
        const headerString = headers.join(',');

        // แปลงข้อมูลแต่ละแถวโดยอิงจาก headers
        const rows = data.map(item => {
            return headers.map(header => {
                let value = item[header as keyof AlertItem]; // ดึงค่าจาก item โดยใช้ header เป็น key
                // จัดการกับค่าที่เป็น null, undefined หรือ string ที่มี comma
                if (value === null || value === undefined) {
                    return ''; // ถ้าไม่มีข้อมูล ให้ส่งเป็นช่องว่าง
                }
                if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
                    return `"${value.replace(/"/g, '""')}"`; // ใส่ double quotes และ escape double quotes
                }
                return value;
            }).join(',');
        });

        // 3. รวม Header กับ Rows เข้าด้วยกัน
        const csvString = [headerString, ...rows].join('\n');

        // 4. สร้าง Blob และ URL สำหรับดาวน์โหลด
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        // 5. สร้าง Element <a> ที่มองไม่เห็นเพื่อทำการดาวน์โหลด
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `cowrie-${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <div style={{ margin: '10px 30px 20px', textAlign: 'center' }} data-aos="zoom-in-down">
                <h1>Cowrie</h1>
            </div>
            <div style={{ fontWeight: "400", textAlign: "center", display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 5%' }}>
                <p style={{ margin: '0px' }}>
                    มีจำนวนทั้งสิ้น {data.length} รายการ{" "}
                    {protocolFilter && `| Filtered by: ${protocolFilter} `}
                    <select value={protocolFilter} onChange={handleSelectChange}>
                        <option value="">All</option>
                        <option value="cowrie.session.connect">connect</option>
                        <option value="cowrie.session.closed">closed</option>
                        <option value="cowrie.command.input">input</option>
                        <option value="cowrie.command.failed">failed</option>
                    </select>
                </p>
                <p data-aos="fade-down" style={{ margin: '0px' }}>
                    WebSocket connection status:{" "}
                    {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
                    <button onClick={handleDownload} className='download-button'>Download CSV</button>
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

export default CowriePage;