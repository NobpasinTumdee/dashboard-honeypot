import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Chartbar from './components/Chart';
import './App.css';
import AlertTable from './apiMock/Apitest';
import Aichatbot from './components/Aichatbot';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const callChat = () => {
    setChatOpen(!isChatOpen);
  };

  return (
    <div className="app-container">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="main-content">
        <Header toggleSidebar={toggleSidebar} />
        <div className="content">
          <div style={{textAlign:'right',borderRadius:'20px'}} className='poster'>
            <img src="https://gogetsecure.com/wp-content/uploads/2022/06/honeypot-cybersecurity.jpg" height={250} style={{borderRadius:'20px'}}/>
          </div>
          <p style={{fontWeight:'900',marginLeft:'30px',marginBottom:'0'}}>Overview</p>
          <p style={{fontSize:'16px',marginLeft:'30px',opacity:'0.8'}}> Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatum, quasi. Reiciendis eligendi obcaecati ducimus non, voluptatem adipisci omnis distinctio velit earum explicabo, alias vel nesciunt nemo nam. Velit, culpa! A veniam magni aperiam quidem ipsam ex harum pariatur? </p>
          <Chartbar test1='test' test2='test' test3='test' test4='test' />
        </div>
        <div>
          <AlertTable />
        </div>
        <div>
          <Aichatbot toggleChat={isChatOpen} />
        </div>
        <div onClick={callChat} className={`chat-box ${isChatOpen ? 'open' : 'wait'}`}>{isChatOpen? '🚫' : '📫'}</div>
      </div>
    </div>
  );
};

export default App;
