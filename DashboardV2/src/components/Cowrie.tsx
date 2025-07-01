import { useEffect, useState } from 'react';
import { Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { getCowrie } from '../serviceApi';
import Aos from 'aos';
import 'aos/dist/aos.css';

type AlertItem = {
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



// export async function GetApiTest() {
//     try {
//         const res = await axios.get('https://683ec1c61cd60dca33dcf91d.mockapi.io/api/test/mock');
//         return res;
//     } catch (e: any) {
//         return e.response;
//     }
// }




//===========================antd table title===================================

const columns: TableColumnsType<AlertItem> = [
    {
        title: 'id',
        dataIndex: 'id',
        width: 13,
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
        title: 'username',
        dataIndex: 'username',
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
    // {
    //     title: 'json_data',
    //     dataIndex: 'json_data',
    //     width: 40,
    //     render: (value) =>
    //         value != null ? (
    //             <span style={{ maxHeight: '40px', color: '#a78f48' }} title={value}>view more</span>
    //         ) : (
    //             <span style={{ maxHeight: '40px' }}>Null</span>
    //         ),
    // },
];




const CowriePage = () => {

    const [data, setData] = useState<AlertItem[]>([]);

    const handleFetchData = async () => {
        try {
            const res = await getCowrie();
            if (res && res.data) {
                setData(res.data);
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




    return (
        <>
            <div style={{ margin: '10px 30px 20px', textAlign: 'center' }} data-aos="zoom-in-down">
                <h1>Cowrie</h1>
                มีจำนวนทั้งสิ้น {data.length} รายการ
            </div>
            <div style={{ backgroundColor: '#fff', margin: '10px 30px', borderRadius: '10px' }} data-aos="fade-up">
                <Table<AlertItem> columns={columns} dataSource={data} size="middle" />
            </div>
        </>
    );
};

export default CowriePage;