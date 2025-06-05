import React from 'react';
import '../styles/Sidebar.css';
import logo from '../assets/Logo/SUT_Engineering_Th.png';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <ul>
        <li><img src={logo} width={'100%'} className='Logo' alt="logo" /></li>
        <li className='sidebarbutton'>🏠 Overview</li>
        <li className='sidebarbutton'>🐚 Cowrie</li>
        <li className='sidebarbutton'>🦖 Dionaea</li>
        <li className='sidebarbutton'>🦈 Wire Shark</li>
      </ul>
    </div>
  );
};

export default Sidebar;