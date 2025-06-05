import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Chartbar from './components/Chart';
import './App.css';
import AlertTable from './apiMock/Apitest';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-container">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="main-content">
        <Header toggleSidebar={toggleSidebar} />
        <div className="content">
          Overview
          <Chartbar test1='test' test2='test' test3='test' test4='test' />
        </div>
        
        <div>
          <AlertTable />
        </div>
      </div>
    </div>
  );
};

export default App;
