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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;


  // Calculate the current items to display based on pagination
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  useEffect(() => { Aos.init({ duration: 1000, once: true, }); }, []);


  return (
    <>
      <div style={{ margin: '10px 30px 20px', textAlign: 'center' }} data-aos="zoom-in-down">
        <h1>Open Canary</h1>
      </div>
      <div style={{ fontWeight: "400", textAlign: "center", display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 5%' }}>
        <p style={{ margin: '0px' }}>มีจำนวนทั้งสิ้น {data.length} รายการ</p>
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
              <div className="table-container" data-aos="fade-up">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backdropFilter: "blur(10px)" }}>
                      <th className="thStyle">#</th>
                      {/* <th className="thStyle">dst_host</th> */}
                      <th className="thStyle">dst_port</th>
                      <th className="thStyle">local_time</th>
                      <th className="thStyle">local_time_adjusted</th>
                      <th className="thStyle">logdata_raw</th>
                      <th className="thStyle">logdata_msg_logdata</th>
                      <th className="thStyle">logtype</th>
                      <th className="thStyle">node_id</th>
                      <th className="thStyle">src_host</th>
                      <th className="thStyle">src_port</th>
                      <th className="thStyle">utc_time</th>
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
