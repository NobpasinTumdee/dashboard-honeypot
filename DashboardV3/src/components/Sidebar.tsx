import React from 'react';
import { Shield } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import type { NavItem } from '../types';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Dashboard', path: 'home', icon: '📊' },
  { id: 'hero', label: 'Hero', path: 'hero', icon: '🎯' },
  { id: 'cowrie', label: 'Cowrie', path: 'cowrie', icon: '🐄' },
  { id: 'opencanary', label: 'OpenCanary', path: 'opencanary', icon: '🐦' },
  { id: 'wireshark', label: 'Wireshark', path: 'wireshark', icon: '🦈' },
  { id: 'users', label: 'User Management', path: 'users', icon: '👥' },
  { id: 'login', label: 'Login', path: 'login', icon: '🔐' },
];

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
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
          {navItems.map((item) => (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-link ${currentPage === item.path ? 'active' : ''}`}
                onClick={() => onNavigate(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;