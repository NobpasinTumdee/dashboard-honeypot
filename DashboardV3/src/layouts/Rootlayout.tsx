import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const Rootlayout = () => {
    return (
        <>
            <Sidebar />
            <main className="main-content">
                <Outlet />
            </main>
        </>
    )
}

export default Rootlayout