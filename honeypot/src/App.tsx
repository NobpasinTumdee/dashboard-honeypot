import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './App.css';

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
        <div className="content">เนื้อหาหลักของ Dashboard</div>
      </div>
    </div>
  );
};

export default App;
