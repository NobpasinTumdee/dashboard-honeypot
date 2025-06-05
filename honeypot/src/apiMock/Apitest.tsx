import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Skeleton from '@mui/material/Skeleton';

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
            <h2>Alert List</h2>
            <div>
                มีจำนวนทั้งสิ้น {data.length} รายการ
            </div>
            <button onClick={handleFetchData}>Load Data</button>
            <ul>
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
            </ul>
        </div>
    );
};

export default AlertTable;
