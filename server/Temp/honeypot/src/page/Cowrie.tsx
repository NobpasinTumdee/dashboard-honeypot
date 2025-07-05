import React from 'react';
import AlertTable from '../apiMock/Apitest';
interface CowrieProps {
    isCowrieOpen: boolean;
}
const CowriePage: React.FC<CowrieProps> = ({ isCowrieOpen }) => {
    return (
        <>
            {isCowrieOpen ?
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

export default CowriePage;