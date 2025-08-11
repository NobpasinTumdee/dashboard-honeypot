import { useEffect, useState } from 'react';
import Aos from 'aos';
import 'aos/dist/aos.css';
import '../Styles/Dashborad.css';
import DateTimeNow from './DateTimeNow';
import { useCanarySocket } from './web-socket/controller';

export type AlertItemCanary = {
  id: number;
  dst_host: string;
  dst_port: number;
  local_time: string;
  local_time_adjusted: string;
  logdata_raw: string;
  logdata_msg_logdata: string;
  logtype: number;
  node_id: string;
  src_host: string;
  src_port: number;
  utc_time: string;
  full_json_line: string;
};



const OpenCanary = () => {
  const [data, setData] = useState<AlertItemCanary[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  // Custom hook to manage WebSocket connection
  useCanarySocket(setData, setIsConnected, setIsLogin);

  // Filter by eventid
  const [protocolFilter, setProtocolFilter] = useState("");
  const handleSelectChange = (event: any) => {
    setProtocolFilter(event.target.value);
  };
  const filteredData = data.filter((item) =>
    protocolFilter
      ? (item.logdata_msg_logdata && item.logdata_msg_logdata.toLowerCase() === protocolFilter.toLowerCase())
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
    const headers = ["id", "dst_host", "dst_port", "local_time", "local_time_adjusted", "logdata_raw", "logdata_msg_logdata", "logtype", "node_id", "src_host", "src_port", "utc_time", "full_json_line"];
    const headerString = headers.join(',');

    // แปลงข้อมูลแต่ละแถวโดยอิงจาก headers
    const rows = data.map(item => {
      return headers.map(header => {
        let value = item[header as keyof AlertItemCanary]; // ดึงค่าจาก item โดยใช้ header เป็น key
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
    link.setAttribute('download', `OpenCanary-${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <>
      <div style={{ margin: '10px 30px 20px', textAlign: 'center' }} data-aos="zoom-in-down">
        <h1>Open Canary</h1>
      </div>
      <div style={{ fontWeight: "400", textAlign: "center", display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 5%' }}>
        <p style={{ margin: '0px' }}>
          มีจำนวนทั้งสิ้น {data.length} รายการ{" "}
          {protocolFilter && `| Filtered by: `}
          <select value={protocolFilter} onChange={handleSelectChange}>
            <option value="">All</option>
            <option value="Canary running!!!">Running</option>
            <option value="Added service from class CanaryHTTPS in opencanary.modules.https to fake">Canary HTTPS</option>
            <option value="Added service from class CanaryHTTP in opencanary.modules.http to fake">Canary HTTP</option>
            <option value="Added service from class CanaryFTP in opencanary.modules.ftp to fake">Canary FTP</option>
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
                      {/* <th className="thStyle">dst_host</th> */}
                      <th className="thStyle">Destination Port</th>
                      <th className="thStyle">Local Time</th>
                      <th className="thStyle">Adjusted Local Time</th>
                      <th className="thStyle">Raw Log Data</th>
                      <th className="thStyle">Log Message</th>
                      <th className="thStyle">Log Type</th>
                      <th className="thStyle">Node ID</th>
                      <th className="thStyle">Source Host</th>
                      <th className="thStyle">Source Port</th>
                      <th className="thStyle">UTC Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item, index) => (
                      <tr key={item.id || index}>
                        <td className="tdStyle">{startIndex + index + 1}</td>
                        {/* <td className="tdStyle">{item.dst_host || <p className="tdStyle-null">null</p>}</td> */}
                        <td className="tdStyle">{item.dst_port || <p className="tdStyle-null">null</p>}</td>
                        <td className="tdStyle">{item.local_time || <p className="tdStyle-null">null</p>}</td>
                        <td className="tdStyleMessage">{item.local_time_adjusted || <p className="tdStyle-null">null</p>}</td>
                        <td className="tdStyleMessage">{item.logdata_raw || <p className="tdStyle-null">null</p>}</td>
                        <td className="tdStyleMessage">{item.logdata_msg_logdata || <p className="tdStyle-null">null</p>}</td>
                        <td className="tdStyle">{item.logtype || <p className="tdStyle-null">null</p>}</td>
                        <td className="tdStyle">{item.node_id || <p className="tdStyle-null">null</p>}</td>
                        <td className="tdStyle">{item.src_host || <p className="tdStyle-null">null</p>}</td>
                        <td className="tdStyle">{item.src_port || <p className="tdStyle-null">null</p>}</td>
                        <td className="tdStyle">{item.utc_time || <p className="tdStyle-null">null</p>}</td>
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
  )
}

export default OpenCanary
