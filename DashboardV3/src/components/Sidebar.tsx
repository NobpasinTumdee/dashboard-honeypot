import { Shield } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { Link, useLocation } from 'react-router-dom'

const Sidebar = () => {
  const location = useLocation();
    const isActive = (path: string) => location.pathname === path;
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">
          <Shield size={24} />
          HoneyPot Monitor
        </h1>
        <ThemeToggle />
      </div>

      <nav>
        <ul className="nav-list">
            <li className="nav-item">
              <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                <span className="nav-icon">🎯</span>
                Hero
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/home" className={`nav-link ${isActive('/home') ? 'active' : ''}`}>
                <span className="nav-icon">📊</span>
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/cowrie" className={`nav-link ${isActive('/cowrie') ? 'active' : ''}`}>
                <span className="nav-icon">🐄</span>
                Cowrie
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/open-canary" className={`nav-link ${isActive('/open-canary') ? 'active' : ''}`}>
                <span className="nav-icon">🐦</span>
                OpenCanary
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/wireshark" className={`nav-link ${isActive('/wireshark') ? 'active' : ''}`}>
                <span className="nav-icon">🦈</span>
                Wireshark
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/users" className={`nav-link ${isActive('/users') ? 'active' : ''}`}>
                <span className="nav-icon">👥</span>
                User Management
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>
                <span className="nav-icon">🔐</span>
                Login
              </Link>
            </li>
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
