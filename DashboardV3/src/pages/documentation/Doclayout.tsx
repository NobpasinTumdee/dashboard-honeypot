import { Outlet } from 'react-router-dom'
import NavDoc from './NavDoc'
import './Doc.css'

const Doclayout = () => {
    return (
        <>
            <NavDoc />
            <div style={{ display: 'flex', flexDirection: 'column', width: '100vw' }}>
                <Outlet />
            </div>
        </>
    )
}

export default Doclayout
