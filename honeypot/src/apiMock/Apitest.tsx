import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table } from 'antd';
import type { TableColumnsType } from 'antd';
// import Skeleton from '@mui/material/Skeleton';

type AlertItem = {
    id: string;
    createdAt: string;
    Type: string;
    Alert: boolean;
    Date: number;
    Time: number;
    IP: string;
    IP_Server: string;
    Protocol: string;
    Comment: string;
};



export async function GetApiTest() {
    try {
        const res = await axios.get('https://683ec1c61cd60dca33dcf91d.mockapi.io/api/test/mock');
        return res;
    } catch (e: any) {
        return e.response;
    }
}




//===========================antd table title===================================

const columns: TableColumnsType<AlertItem> = [
    {
        title: 'id',
        dataIndex: 'id',
    },
    {
        title: 'Service',
        dataIndex: 'Type',
    },
    {
        title: 'Alert',
        dataIndex: 'Alert',
        render: (value: boolean) => (value ? 'Yes' : 'No'),
    },
    {
        title: 'Date',
        dataIndex: 'Date',
        render: (value: number) =>
            new Date(value * 1000).toLocaleDateString('th-TH', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
    },
    {
        title: 'Time',
        dataIndex: 'Time',
        render: (value: number) =>
            new Date(value * 1000).toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }),
    },
    {
        title: 'IP',
        dataIndex: 'IP',
    },
    {
        title: 'IP_Server',
        dataIndex: 'IP_Server',
    },
    {
        title: 'Protocol',
        dataIndex: 'Protocol',
    },
    {
        title: 'Comment',
        dataIndex: 'Comment',
    },
];



const AlertTable: React.FC = () => {
    const [data, setData] = useState<AlertItem[]>([]);

    const handleFetchData = async () => {
        const res = await GetApiTest();
        if (res && res.data) {
            setData(res.data);
        }
    };

    useEffect(() => {
        (async () => {
            await handleFetchData();
        })();
    }, []);


    return (
        <div>
            <h2 style={{fontWeight:'900',textAlign:'center'}}>Alert List</h2>
            <div style={{margin:'0 30px'}}>
                มีจำนวนทั้งสิ้น {data.length} รายการ
            </div>
            <div style={{ backgroundColor: '#fff', margin: '10px 30px' ,borderRadius:'10px'}}>
                <Table<AlertItem> columns={columns} dataSource={data} size="middle" />
            </div>
            <button style={{margin: '10px 30px'}} onClick={handleFetchData}>Load Data</button>
            {/* <ul>
                {data ? (
                    data.map((item) => (
                        <li key={item.id}>
                            id: {item.id} |
                            Alert: {item.Alert ? 'true' : 'false'} |
                            Date: {new Date(item.Date * 1000).toLocaleDateString()} |
                            Time: {new Date(item.Time * 1000).toLocaleTimeString()} |
                            IP: {item.IP} |
                            IP Server: {item.IP_Server} |
                            Protocol: {item.Protocol} |
                            Comment: {item.Comment}
                        </li>
                    ))
                ) : (
                    <>
                        <div style={{ width: '300px' }}>
                            <Skeleton animation="wave" />
                            <Skeleton animation="wave" />
                            <Skeleton animation="wave" />
                        </div>
                    </>
                )}
            </ul> */}
        </div>
    );
};

export default AlertTable;
