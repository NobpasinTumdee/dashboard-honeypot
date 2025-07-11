import { useEffect, useState } from 'react';
import { Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { getOpenCanaryAuth } from '../serviceApi';
import Aos from 'aos';
import 'aos/dist/aos.css';

type AlertItem = {
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

const columns: TableColumnsType<AlertItem> = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 13,
  },
  {
    title: 'Dst host',
    dataIndex: 'dst_host',
    render: (value) => (value != "" ? value : (<p style={{ opacity: '0.3' }}>null</p>)),
    width: 70,
  },
  {
    title: 'Dst port',
    dataIndex: 'dst_port',
    render: (value) => (value != null ? value : (<p style={{ opacity: '0.3' }}>null</p>)),
    width: 40,
  },
  {
    title: 'Local Time',
    dataIndex: 'local_time',
    render: (value: string) => {
      const date = new Date(value);
      return date.toISOString().slice(0, 16).replace("T", " ");
    },
    width: 60,
  },
  {
    title: 'Local Time adjusted',
    dataIndex: 'local_time_adjusted',
    render: (value: string) => {
      const date = new Date(value);
      return date.toISOString().slice(0, 16).replace("T", " ");
    },
    width: 60,
  },
  {
    title: 'logdata_raw',
    dataIndex: 'logdata_raw',
    render: (value) => (value != null ? value : (<p style={{ opacity: '0.3' }}>null</p>)),
    width: 40,
  },
  {
    title: 'logdata_msg_logdata',
    dataIndex: 'logdata_msg_logdata',
    render: (value) => (value != null ? value : (<p style={{ opacity: '0.3' }}>null</p>)),
    width: 40,
  },
  {
    title: 'logtype',
    dataIndex: 'logtype',
    render: (value) => (value != null ? value : (<p style={{ opacity: '0.3' }}>null</p>)),
    width: 40,
  },
  {
    title: 'node_id',
    dataIndex: 'node_id',
    render: (value) => (value != null ? value : (<p style={{ opacity: '0.3' }}>null</p>)),
    width: 40,
  },
  {
    title: 'src_host',
    dataIndex: 'src_host',
    render: (value) => (value != null ? value : (<p style={{ opacity: '0.3' }}>null</p>)),
    width: 40,
  },
  {
    title: 'src_port',
    dataIndex: 'src_port',
    render: (value) => (value != null ? value : (<p style={{ opacity: '0.3' }}>null</p>)),
    width: 40,
  },
  {
    title: 'utc_time',
    dataIndex: 'utc_time',
    render: (value: string) => {
      const date = new Date(value);
      return date.toISOString().slice(0, 16).replace("T", " ");
    },
    width: 40,
  },
];


const OpenCanary = () => {
  const [data, setData] = useState<AlertItem[]>([]);

  const handleFetchData = async () => {
    try {
      const res = await getOpenCanaryAuth();
      const responseData = res?.data;
      if (!responseData) {
        console.error("No data received from API");
        setData([]);
        return;
      }
      if (Array.isArray(responseData)) {
        setData(responseData);
      } else if (Array.isArray(responseData?.data)) {
        setData(responseData.data);
      } else {
        console.error("Unexpected response:", responseData);
        setData([]);
      }
    } catch (error) {
      setData([])
    }
  };

  useEffect(() => {
    (async () => {
      await handleFetchData();
    })();
    Aos.init({
      duration: 1000,
      once: true,
    });
  }, []);

  useEffect(() => {
        const interval = setInterval(() => {
            (async () => {
                await handleFetchData();
            })();
            console.log("reload data 10 วิ");
        }, 10000);
        return () => clearInterval(interval); // เคลียร์เมื่อ component หายไป
    }, []);

  return (
    <>
      <div style={{ margin: '10px 30px 20px', textAlign: 'center' }} data-aos="zoom-in-down">
        <h1>Open Canary</h1>
        มีจำนวนทั้งสิ้น {data.length} รายการ
      </div>
      {data.length === 0 ? (
        <div style={{ textAlign: 'center', margin: '20px' }} data-aos="zoom-in-up">
          <h1>โปรดล็อคอิน เพื่อดูตารางแบบเต็ม</h1>
        </div>
      ) : (
        <div style={{ backgroundColor: '#fff', margin: '10px 30px', borderRadius: '10px', overflowX: 'auto' }} data-aos="fade-up">
          <div style={{ minWidth: '1460px' }}>
            <Table<AlertItem> columns={columns} dataSource={data} size="middle" />
          </div>
        </div>
      )}
    </>
  )
}

export default OpenCanary
