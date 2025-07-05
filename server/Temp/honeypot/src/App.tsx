import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Chartbar from './components/Chart';
import './App.css';
import Aichatbot from './components/Aichatbot';
import CowriePage from './page/Cowrie';
import DionaeaPage from './page/Dionaea';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<string>('Overview');

  const callChat = () => {
    setChatOpen(!isChatOpen);
  };

  const [isMainPage, setMainPage] = useState(true);
  const [isCowriePage, setCowriePage] = useState(false);
  const [isDionaeaPage, setDionaeaPage] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const handleMenuClick = (menu: string) => {
    console.log('เมนูที่เลือก:', menu);
    setSelectedMenu(menu);
    if (menu === 'Overview') {
      setMainPage(true); setCowriePage(false); setDionaeaPage(false);
    } else if (menu === 'Cowrie') {
      setCowriePage(true); setDionaeaPage(false); setMainPage(false);
    } else if (menu === 'Dionaea') {
      setDionaeaPage(true); setCowriePage(false); setMainPage(false);
    } else if (menu === 'Shark') {
      setDionaeaPage(false); setCowriePage(false); setMainPage(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar isOpen={isSidebarOpen} onMenuClick={handleMenuClick} />
      <div className="main-content">

        <Header toggleSidebar={toggleSidebar} />

        <div className="content">

          <p>{selectedMenu}</p>
          <CowriePage isCowrieOpen={isCowriePage} />
          <DionaeaPage isDionaeaOpen={isDionaeaPage} />

          {isMainPage &&
            <>
              <div style={{ textAlign: 'right', borderRadius: '20px' }} className='poster'>
                <img src="https://gogetsecure.com/wp-content/uploads/2022/06/honeypot-cybersecurity.jpg" height={250} style={{ borderRadius: '20px' }} />
              </div>

              <div style={{marginLeft: '30px',width:'800px',wordWrap:'break-word'}}>
                <p style={{ fontWeight: '900', marginBottom: '0' }}>Overview</p>
                <p style={{ fontSize: '16px', opacity: '0.8' }}> Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatum, quasi. Reiciendis eligendi obcaecati ducimus non, voluptatem adipisci omnis distinctio velit earum explicabo, alias vel nesciunt nemo nam. Velit, culpa! A veniam magni aperiam quidem ipsam ex harum pariatur? </p>
              </div>

              <Chartbar test1='test' test2='test' test3='test' test4='test' />
            </>
          }
        </div>

        <div>
          <Aichatbot toggleChat={isChatOpen} />
        </div>

        <div onClick={callChat} className={`chat-box ${isChatOpen ? 'open' : 'wait'}`}>{isChatOpen ? '🚫' : '📫'}</div>

      </div>
    </div>
  );
};

export default App;
