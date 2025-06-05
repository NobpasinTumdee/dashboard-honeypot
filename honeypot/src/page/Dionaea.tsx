import React from 'react';
import AlertTable from '../apiMock/Apitest';
interface DionaeaProps {
    isDionaeaOpen: boolean;
}
const DionaeaPage: React.FC<DionaeaProps> = ({ isDionaeaOpen }) => {
    return (
        <>
            {isDionaeaOpen ?
                <>
                    <AlertTable />
                </>
                :
                <>
                </>
            }
        </>
    );
};

export default DionaeaPage;