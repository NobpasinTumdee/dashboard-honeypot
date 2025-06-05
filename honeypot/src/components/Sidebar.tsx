import React from 'react';
import '../styles/Sidebar.css';
import logo from '../assets/Logo/SUT_Engineering_Th.png';

interface SidebarProps {
  isOpen: boolean;
  onMenuClick: (menu: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen , onMenuClick }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <ul>
        <li><img src={logo} width={'100%'} className='Logo' alt="logo" /></li>
        <li className='sidebarbutton' onClick={() => onMenuClick('Overview')}>🏠 Overview</li>
        <li className='sidebarbutton' onClick={() => onMenuClick('Cowrie')}>🐚 Cowrie</li>
        <li className='sidebarbutton' onClick={() => onMenuClick('Dionaea')}>🦖 Dionaea</li>
        <li className='sidebarbutton' onClick={() => onMenuClick('Shark')}>🦈 Wire Shark</li>
      </ul>
    </div>
  );
};

export default Sidebar;