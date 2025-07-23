import { useEffect, useState } from 'react';
import { Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { getCowrieAuth } from '../serviceApi';
import Aos from 'aos';
import 'aos/dist/aos.css';

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

const columns: TableColumnsType<AlertItem> = [
    {
        title: 'id',
        dataIndex: 'id',
        width: 20,
    },
    {
        title: 'timestamp',
        dataIndex: 'timestamp',
        render: (value: string) => {
            const date = new Date(value);
            return date.toISOString().slice(0, 16).replace("T", " ");
        },
        width: 60,
    },
    {
        title: 'eventid',
        dataIndex: 'eventid',
        render: (value) => (value != null ? value : (<p>null</p>)),
        width: 40,
    },
    {
        title: 'session',
        dataIndex: 'session',
        render: (value) => (value != null ? value : (<p style={{ opacity: '0.3' }}>null</p>)),
        width: 40,
    },
    {
        title: 'message',
        dataIndex: 'message',
        width: 40,
        fixed: 'right',
        ellipsis: true,
        render: (value) => value != null ? value : "Null",
    },
    {
        title: 'protocol',
        dataIndex: 'protocol',
        render: (value) => (value != null ? value : (<p style={{ opacity: '0.3' }}>null</p>)),
        width: 40,
    },
    {
        title: 'src_ip',
        dataIndex: 'src_ip',
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
        title: 'dst_ip',
        dataIndex: 'dst_ip',
        render: (value) => (value != null ? value : (<p style={{ opacity: '0.3' }}>null</p>)),
        width: 40,
    },
    {
        title: 'dst_port',
        dataIndex: 'dst_port',
        render: (value) => (value != null ? value : (<p style={{ opacity: '0.3' }}>null</p>)),
        width: 35,
    },
    {
        title: 'user',
        dataIndex: 'username',
        render: (value) => (value != null ? value : (<p style={{ opacity: '0.3' }}>null</p>)),
        width: 20,
    },
    {
        title: 'password',
        dataIndex: 'password',
        render: (value) => (value != null ? value : (<p style={{ opacity: '0.3' }}>null</p>)),
        width: 30,
    },
    {
        title: 'input',
        dataIndex: 'input',
        render: (value) => (value != null ? value : (<p style={{ opacity: '0.3' }}>null</p>)),
        width: 30,
    },
    {
        title: 'command',
        dataIndex: 'command',
        render: (value) => (value != null ? value : (<p style={{ opacity: '0.3' }}>null</p>)),
        width: 30,
    },
    {
        title: 'duration',
        dataIndex: 'duration',
        render: (value) => (value != null ? value : (<p style={{ opacity: '0.3' }}>null</p>)),
        width: 30,
    },
    {
        title: 'ttylog',
        dataIndex: 'ttylog',
        render: (value) => (value != null ? value : (<p style={{ opacity: '0.3' }}>null</p>)),
        width: 30,
    },
];




const CowriePage = () => {

    const [data, setData] = useState<AlertItem[]>([]);

    const handleFetchData = async () => {
        try {
            const res = await getCowrieAuth();
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
                <h1>Cowrie</h1>
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
    );
};

export default CowriePage;