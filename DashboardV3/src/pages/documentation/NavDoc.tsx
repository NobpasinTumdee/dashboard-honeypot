import { Link, useLocation } from 'react-router-dom'
import './Doc.css'

const NavDoc = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;
    return (
        <>
            <div className='doc-nav-container'>
                <nav className="doc-nav">
                    <Link to="/" className={`Link-button-doc ${isActive('/') ? 'active' : ''}`}>Dashboard</Link>
                    <Link to="/document" className={`Link-button-doc ${isActive('/document') ? 'active' : ''}`}>Home</Link>
                    <Link to="/document/cowrie-guide" className={`Link-button-doc ${isActive('/cowrie-guide') ? 'active' : ''}`}>Cowrie</Link>
                    <Link to="/document/canary-guide" className={`Link-button-doc ${isActive('/canary-guide') ? 'active' : ''}`}>OpenCanary</Link>
                    <Link to="/document/wireshark-guide" className={`Link-button-doc ${isActive('/wireshark-guide') ? 'active' : ''}`}>Wireshark</Link>
                </nav>
            </div>
        </>
    )
}

export default NavDoc
