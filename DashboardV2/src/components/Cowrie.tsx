import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table } from 'antd';
import type { TableColumnsType } from 'antd';

interface CowrieProps {
    isCowrieOpen: boolean;
}


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




const CowriePage: React.FC<CowrieProps> = ({ isCowrieOpen }) => {

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
        <>
            {isCowrieOpen ?
                <>
                    <div style={{ margin: '0 30px' }}>
                        มีจำนวนทั้งสิ้น {data.length} รายการ
                    </div>
                    <div style={{ backgroundColor: '#fff', margin: '10px 30px', borderRadius: '10px' }}>
                        <Table<AlertItem> columns={columns} dataSource={data} size="middle" />
                    </div>
                    <button style={{ margin: '10px 30px' }} onClick={handleFetchData}>Load Data</button>
                </>
                :
                <>
                </>
            }
        </>
    );
};

export default CowriePage;