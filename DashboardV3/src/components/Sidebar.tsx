import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import '../i18n';
import { message } from 'antd';

import ThemeToggle from './ThemeToggle'
import mc from '../assets/mc/MC2-Photoroom.png'

const Sidebar = () => {
  const { t, i18n } = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const isLogin = localStorage.getItem("isLogin");
  const UserName = localStorage.getItem("UserName");
  const isActive = (path: string) => location.pathname === path;
  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("token_type");
    localStorage.removeItem("token");
    localStorage.removeItem("UserName");
    localStorage.removeItem("status");
    messageApi.success('Logout successful!', 3)
    window.location.href = "/home/login";
  }
  return (
    <>
      {contextHolder}
      <aside className="sidebar" style={{ width: `${!isOpen ? '75px' : '250px'}` }}>
        <div>
          <div className="sidebar-header">
            {isOpen && (
              <>
                <img src={mc} alt="Logo" className="sidebar-logo" width={40} />
                <h1 className="sidebar-title">
                  {t('sidebar_title')}
                </h1>
                {/* <ThemeToggle /> */}
              </>
            )}
            <button
              className="theme-toggle"
              aria-label="Toggle theme"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M15 3v18" /><path d="m10 15-3-3 3-3" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M15 3v18" /><path d="m8 9 3 3-3 3" /></svg>
              )}
            </button>
          </div>

          <nav>
            <ul className="nav-list">
              <li className="nav-item">
                <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                  <span className="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
                  </span>
                  {isOpen && (
                    <span>{t('sidebar_munu_title1')}</span>
                  )}
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/home" className={`nav-link ${isActive('/home') ? 'active' : ''}`}>
                  <span className="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
                  </span>
                  {isOpen && (
                    <span>{t('sidebar_munu_title2')}</span>
                  )}
                </Link>
              </li>
              {isLogin === 'true' && (
                <>
                  <li className="nav-item">
                    <Link to="/home/cowrie" className={`nav-link ${isActive('/home/cowrie') ? 'active' : ''}`}>
                      <span className="nav-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z" /><path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" /></svg>
                      </span>
                      {isOpen && (
                        <span>{t('sidebar_munu_title3')}</span>
                      )}
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/home/open-canary" className={`nav-link ${isActive('/home/open-canary') ? 'active' : ''}`}>
                      <span className="nav-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M8 2v4" /><path d="M12 2v4" /><path d="M16 2v4" /><path d="M16 4h2a2 2 0 0 1 2 2v2" /><path d="M20 12v2" /><path d="M20 18v2a2 2 0 0 1-2 2h-1" /><path d="M13 22h-2" /><path d="M7 22H6a2 2 0 0 1-2-2v-2" /><path d="M4 14v-2" /><path d="M4 8V6a2 2 0 0 1 2-2h2" /><path d="M8 10h6" /><path d="M8 14h8" /><path d="M8 18h5" /></svg>
                      </span>
                      {isOpen && (
                        <span>{t('sidebar_munu_title4')}</span>
                      )}
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/home/wireshark" className={`nav-link ${isActive('/home/wireshark') ? 'active' : ''}`}>
                      <span className="nav-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M12 22v-9" /><path d="M15.17 2.21a1.67 1.67 0 0 1 1.63 0L21 4.57a1.93 1.93 0 0 1 0 3.36L8.82 14.79a1.655 1.655 0 0 1-1.64 0L3 12.43a1.93 1.93 0 0 1 0-3.36z" /><path d="M20 13v3.87a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13" /><path d="M21 12.43a1.93 1.93 0 0 0 0-3.36L8.83 2.2a1.64 1.64 0 0 0-1.63 0L3 4.57a1.93 1.93 0 0 0 0 3.36l12.18 6.86a1.636 1.636 0 0 0 1.63 0z" /></svg>
                      </span>
                      {isOpen && (
                        <span>{t('sidebar_munu_title5')}</span>
                      )}
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/home/users" className={`nav-link ${isActive('/home/users') ? 'active' : ''}`}>
                      <span className="nav-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M6.376 18.91a6 6 0 0 1 11.249.003" /><circle cx="12" cy="11" r="4" /></svg>
                      </span>
                      {isOpen && (
                        <span>{t('sidebar_munu_title6')}</span>
                      )}
                    </Link>
                  </li>
                </>
              )}
              <li className="nav-item">
                <Link to="/document" className={`nav-link ${isActive('/document') ? 'active' : ''}`}>
                  <span className="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M10 2v8l3-3 3 3V2" /><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" /></svg>
                  </span>
                  {isOpen && (
                    <span>{t('sidebar_munu_title7')}</span>
                  )}
                </Link>
              </li>
              <li className="nav-item">
                <p className={`nav-link`}>
                  {isOpen && (
                    <>
                      <span className="nav-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M18 5h4" /><path d="M20 3v4" /><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" /></svg>
                      </span>
                      <span>{t('sidebar_munu_title8')}</span>
                    </>
                  )}
                  <ThemeToggle />
                </p>
              </li>
              {isOpen && (
                <li className="nav-item">
                  <p className={`nav-link`}>
                    <>
                      <span className="nav-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="32px" fill="var(--text-primary)"><path d="m480-80-40-120H160q-33 0-56.5-23.5T80-280v-520q0-33 23.5-56.5T160-880h240l35 120h365q35 0 57.5 22.5T880-680v520q0 33-22.5 56.5T800-80H480ZM286-376q69 0 113.5-44.5T444-536q0-8-.5-14.5T441-564H283v62h89q-8 28-30.5 43.5T287-443q-39 0-67-28t-28-69q0-41 28-69t67-28q18 0 34 6.5t29 19.5l49-47q-21-22-50.5-34T286-704q-67 0-114.5 47.5T124-540q0 69 47.5 116.5T286-376Zm268 20 22-21q-14-17-25.5-33T528-444l26 88Zm50-51q28-33 42.5-63t19.5-47H507l12 42h40q8 15 19 32.5t26 35.5Zm-84 287h280q18 0 29-11.5t11-28.5v-520q0-18-11-29t-29-11H447l47 162h79v-42h41v42h146v41h-51q-10 38-30 74t-47 67l109 107-29 29-108-108-36 37 32 111-80 80Z"/></svg>
                      </span>
                      <select
                        className="hero-footer-select"
                        style={{ width: '100%' }}
                        onChange={changeLanguage}
                        value={i18n.language}
                      >
                        <option value="en">English</option>
                        <option value="th">ภาษาไทย</option>
                        <option value="ja">日本語</option>
                        <option value="zh">中文</option>
                        <option value="ko">한국어</option>
                        <option value="fr">Français</option>
                        <option value="cat">Cat 😸</option>
                      </select>
                    </>
                  </p>
                </li>
              )}
              {isLogin !== 'true' && (
                <li className="nav-item">
                  <Link to="/home/login" className={`nav-link ${isActive('/home/login') ? 'active' : ''}`}>
                    <span className="nav-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" /></svg>
                    </span>
                    {isOpen && (
                      <span>{t('sidebar_munu_title9')}</span>
                    )}
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
        {isLogin === 'true' && (
          <>
            <div className='footer-sidebar'>
              <div className='userprofile'>
                <h3>{UserName?.charAt(0).toUpperCase()}</h3>
              </div>
              {isOpen && (
                <>
                  <p>{UserName?.toUpperCase()}</p>
                  <svg onClick={() => handleLogout()} xmlns="http://www.w3.org/2000/svg" style={{ cursor: 'pointer' }} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /></svg>
                </>
              )}
            </div>
          </>
        )}
      </aside>

      <aside className='mobile-nav-bar'>
        <svg onClick={() => setIsMobile(!isMobile)} style={{ cursor: 'pointer' }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M16 5H3" /><path d="M16 12H3" /><path d="M16 19H3" /><path d="M21 5h.01" /><path d="M21 12h.01" /><path d="M21 19h.01" /></svg>
        <nav className={isMobile ? 'open' : ''}>
          <ul className="mobile-nav-list">
            <li className="mobile-nav-item">
              <Link to="/" className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}>
                <span className="mobile-nav-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
                </span>
                <span>{t('sidebar_munu_title1')}</span>
              </Link>
            </li>
            <li className="mobile-nav-item">
              <Link to="/home" className={`mobile-nav-link ${isActive('/home') ? 'active' : ''}`}>
                <span className="mobile-nav-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
                </span>
                <span>{t('sidebar_munu_title2')}</span>
              </Link>
            </li>
            {isLogin === 'true' && (
              <>
                <li className="mobile-navnav-item">
                  <Link to="/home/cowrie" className={`mobile-nav-link ${isActive('/home/cowrie') ? 'active' : ''}`}>
                    <span className="mobile-nav-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z" /><path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" /></svg>
                    </span>
                    <span>{t('sidebar_munu_title3')}</span>
                  </Link>
                </li>
                <li className="mobile-navnav-item">
                  <Link to="/home/open-canary" className={`mobile-nav-link ${isActive('/home/open-canary') ? 'active' : ''}`}>
                    <span className="mobile-nav-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M8 2v4" /><path d="M12 2v4" /><path d="M16 2v4" /><path d="M16 4h2a2 2 0 0 1 2 2v2" /><path d="M20 12v2" /><path d="M20 18v2a2 2 0 0 1-2 2h-1" /><path d="M13 22h-2" /><path d="M7 22H6a2 2 0 0 1-2-2v-2" /><path d="M4 14v-2" /><path d="M4 8V6a2 2 0 0 1 2-2h2" /><path d="M8 10h6" /><path d="M8 14h8" /><path d="M8 18h5" /></svg>
                    </span>
                    <span>{t('sidebar_munu_title4')}</span>
                  </Link>
                </li>
                <li className="mobile-navnav-item">
                  <Link to="/home/wireshark" className={`mobile-nav-link ${isActive('/home/wireshark') ? 'active' : ''}`}>
                    <span className="mobile-nav-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M12 22v-9" /><path d="M15.17 2.21a1.67 1.67 0 0 1 1.63 0L21 4.57a1.93 1.93 0 0 1 0 3.36L8.82 14.79a1.655 1.655 0 0 1-1.64 0L3 12.43a1.93 1.93 0 0 1 0-3.36z" /><path d="M20 13v3.87a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13" /><path d="M21 12.43a1.93 1.93 0 0 0 0-3.36L8.83 2.2a1.64 1.64 0 0 0-1.63 0L3 4.57a1.93 1.93 0 0 0 0 3.36l12.18 6.86a1.636 1.636 0 0 0 1.63 0z" /></svg>
                    </span>
                    <span>{t('sidebar_munu_title5')}</span>
                  </Link>
                </li>
                <li className="mobile-navnav-item">
                  <Link to="/home/users" className={`mobile-nav-link ${isActive('/home/users') ? 'active' : ''}`}>
                    <span className="mobile-nav-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M6.376 18.91a6 6 0 0 1 11.249.003" /><circle cx="12" cy="11" r="4" /></svg>
                    </span>
                    <span>{t('sidebar_munu_title6')}</span>
                  </Link>
                </li>
              </>
            )}
            <li className="mobile-navnav-item">
              <Link to="/document" className={`mobile-nav-link ${isActive('/document') ? 'active' : ''}`}>
                <span className="mobile-nav-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M10 2v8l3-3 3 3V2" /><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" /></svg>
                </span>
                <span>{t('sidebar_munu_title7')}</span>
              </Link>
            </li>
            <li className="mobile-navnav-item">
              <p className={`mobile-nav-link`}>
                <span className="mobile-nav-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M18 5h4" /><path d="M20 3v4" /><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" /></svg>
                </span>
                <span>{t('sidebar_munu_title8')}</span>
                <ThemeToggle />
              </p>
            </li>
            <li className="mobile-navnav-item">
              <Link to="/home/login" className={`mobile-nav-link ${isActive('/home/login') ? 'active' : ''}`}>
                <span className="mobile-nav-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" /></svg>
                </span>
                <span>{t('sidebar_munu_title9')}</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

    </>
  )
}

export default Sidebar
