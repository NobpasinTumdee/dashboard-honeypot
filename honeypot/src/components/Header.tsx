import React from 'react';
import '../styles/Header.css';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <div className="header">
      <button className="toggle-button" onClick={toggleSidebar}>☰</button>
      <h1>Smart Tiny HoneyPot 🐝🍯</h1>
    </div>
  );
};

export default Header;
