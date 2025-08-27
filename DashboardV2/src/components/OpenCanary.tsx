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

  const countHTTP = (data: AlertItemCanary[]): number => {
    return data.filter(item => item.logdata_msg_logdata === 'Added service from class CanaryHTTP in opencanary.modules.http to fake').length;
  };
  const countHTTPS = (data: AlertItemCanary[]): number => {
    return data.filter(item => item.logdata_msg_logdata === 'Added service from class CanaryHTTPS in opencanary.modules.https to fake').length;
  };
  const countFTP = (data: AlertItemCanary[]): number => {
    return data.filter(item => item.logdata_msg_logdata === 'Added service from class CanaryFTP in opencanary.modules.ftp to fake').length;
  };

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
      <div style={{ margin: '10px 5% 20px', textAlign: 'left' }} data-aos="fade-down">
        <h1>Open Canary</h1>
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
            <h2 style={{ margin: '0' }}>HTTP</h2>
            <h1 style={{ margin: '0' }}>{countHTTP(data)}</h1>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" height="45px" viewBox="0 -960 960 960" width="45px" fill="#940404ff"><path d="M54.62-366.15v-227.7h47.69v80h92.31v-80h47.69v227.7h-47.69v-100h-92.31v100H54.62Zm295.38 0v-180h-63.85v-47.7h175.39v47.7h-63.85v180H350Zm212.31 0v-180h-63.85v-47.7h175.39v47.7H610v180h-47.69Zm155.38 0v-227.7h127.69q24 0 42 18t18 42v27.7q0 24-18 42t-42 18h-80v80h-47.69Zm47.69-127.7h80q4.62 0 8.47-3.84 3.84-3.85 3.84-8.46v-27.7q0-4.61-3.84-8.46-3.85-3.84-8.47-3.84h-80v52.3Z" /></svg>
        </div>
        <div className='box-alert' data-aos="fade-down" data-aos-duration="600">
          <div>
            <h2 style={{ margin: '0' }}>HTTPS</h2>
            <h1 style={{ margin: '0' }}>{countHTTPS(data)}</h1>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" height="45px" viewBox="0 -960 960 960" width="45px" fill="#404ad5ff"><path d="M480-100.77q-129.77-35.39-214.88-152.77Q180-370.92 180-516v-230.15l300-112.31 300 112.31V-516q0 145.08-85.12 262.46Q609.77-136.16 480-100.77Zm0-63.23q97-30 162-118.5T718-480H480v-314.62L240-705v206.62q0 7.38 2 18.38h238v316Z" /></svg>
        </div>
        <div className='box-alert' data-aos="fade-down" data-aos-duration="800">
          <div>
            <h2 style={{ margin: '0' }}>FTP</h2>
            <h1 style={{ margin: '0' }}>{countFTP(data)}</h1>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" height="45px" viewBox="0 -960 960 960" width="45px" fill="#cf8a00ff"><path d="m511.85-410-70.77 70.77 42.15 42.15L626.15-440 483.23-582.92l-42.15 42.15L511.85-470h-178v60h178ZM172.31-180Q142-180 121-201q-21-21-21-51.31v-455.38Q100-738 121-759q21-21 51.31-21h219.61l80 80h315.77Q818-700 839-679q21 21 21 51.31v375.38Q860-222 839-201q-21 21-51.31 21H172.31Zm0-60h615.38q5.39 0 8.85-3.46t3.46-8.85v-375.38q0-5.39-3.46-8.85t-8.85-3.46H447.38l-80-80H172.31q-5.39 0-8.85 3.46t-3.46 8.85v455.38q0 5.39 3.46 8.85t8.85 3.46ZM160-240v-480 480Z" /></svg>
        </div>
        <div className='box-alert' data-aos="fade-down" data-aos-duration="1000">
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
  )
}

export default OpenCanary
