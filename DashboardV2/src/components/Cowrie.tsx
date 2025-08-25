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

    // นับจำนวน SSH
    const countSsh = (data: AlertItem[]): number => {
        return data.filter(item => item.protocol === 'ssh').length;
    };

    // นับจำนวน Telnet
    const countTelnet = (data: AlertItem[]): number => {
        return data.filter(item => item.protocol === 'telnet').length;
    };

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

            <div style={{ margin: '10px 5% 20px', textAlign: 'left' }} data-aos="fade-down">
                <h1>Cowrie</h1>
            </div>
            <div className='dashboard-container-box'>
                <div className='box-alert' data-aos="fade-down" data-aos-duration="200">
                    <div>
                        <h2 style={{ margin: '0' }}>Total Alert</h2>
                        <h1 style={{ margin: '0' }}>{data.length}</h1>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" height="45px" viewBox="0 -960 960 960" width="45px" fill="#d1c172ff"><path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 412L346-160H160v-186L28-480l132-134v-186h186l134-132 134 132h186v186l132 134-132 134v186H614L480-28Zm0-112 100-100h140v-140l100-100-100-100v-140H580L480-820 380-720H240v140L140-480l100 100v140h140l100 100Zm0-340Z" /></svg>
                </div>
                <div className='box-alert' data-aos="fade-down" data-aos-duration="400">
                    <div>
                        <h2 style={{ margin: '0' }}>SSH</h2>
                        <h1 style={{ margin: '0' }}>{countSsh(data)}</h1>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" height="45px" viewBox="0 -960 960 960" width="45px" fill="#346fdbff"><path d="M320-400h80v-80q0-17 11.5-28.5T440-520h80v80l120-120-120-120v80h-80q-50 0-85 35t-35 85v80ZM160-240q-33 0-56.5-23.5T80-320v-440q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v440q0 33-23.5 56.5T800-240H160Zm0-80h640v-440H160v440Zm0 0v-440 440ZM40-120v-80h880v80H40Z" /></svg>
                </div>
                <div className='box-alert' data-aos="fade-down" data-aos-duration="600">
                    <div>
                        <h2 style={{ margin: '0' }}>TELNET</h2>
                        <h1 style={{ margin: '0' }}>{countTelnet(data)}</h1>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" height="45px" viewBox="0 -960 960 960" width="45px" fill="#671bcbff"><path d="M480-840q74 0 139.5 28.5T734-734q49 49 77.5 114.5T840-480q0 74-28.5 139.5T734-226q-49 49-114.5 77.5T480-120q-41 0-79-9t-76-26l61-61q23 8 46.5 12t47.5 4q116 0 198-82t82-198q0-116-82-198t-198-82q-116 0-198 82t-82 198q0 24 4 47.5t12 46.5l-60 60q-18-36-27-74.5t-9-79.5q0-74 28.5-139.5T226-734q49-49 114.5-77.5T480-840Zm40 520v-144L176-120l-56-56 344-344H320v-80h280v280h-80Z" /></svg>
                </div>
                <div className='box-alert' data-aos="fade-down" data-aos-duration="800">
                    <div>
                        <h2 style={{ margin: '0' }}>Status WebSocket</h2>
                        <h3 style={{ margin: '0' }}>{isConnected ? "🟢 Connected" : "🔴 Disconnected"}</h3>
                    </div>
                    {isConnected ?
                        <svg xmlns="http://www.w3.org/2000/svg" height="45px" viewBox="0 -960 960 960" width="45px" fill="#2ba00bff"><path d="M40-160v-240h120v240H40Zm190 0v-320h120v320H230Zm190 0v-440h120v440H420Zm190 0v-520h120v520H610Zm190 0v-640h120v640H800Z" /></svg>
                        :
                        <svg xmlns="http://www.w3.org/2000/svg" height="45px" viewBox="0 -960 960 960" width="45px" fill="#ff0000ff"><path d="M816-123 660-232v72H540v-156l-120-84v240H300v-324L30-674l57-81 786 550-57 82Zm84-185-120-84v-408h120v492ZM60-160v-320h120v320H60Zm600-316-120-84v-120h120v204Z" /></svg>
                    }
                </div>
            </div>
            <div style={{ fontWeight: "400", textAlign: "center", display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 5%' }}>
                <p style={{ margin: '0px' }}>
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
                    <button onClick={handleDownload} className='download-button'>
                        Download CSV
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--body_text_color)"><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" /></svg>
                    </button>
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
                                                <td className="tdStyle">{item.timestamp.slice(0, 10) || <p className="tdStyle-null">null</p>}</td>
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