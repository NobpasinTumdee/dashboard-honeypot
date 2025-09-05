import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import HeroPage from './pages/HeroPage';
import CowriePage from './pages/CowriePage';
import OpenCanaryPage from './pages/OpenCanaryPage';
import WiresharkPage from './pages/WiresharkPage';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'hero':
        return <HeroPage />;
      case 'cowrie':
        return <CowriePage />;
      case 'opencanary':
        return <OpenCanaryPage />;
      case 'wireshark':
        return <WiresharkPage />;
      case 'login':
        return <LoginPage />;
      case 'users':
        return <UsersPage />;
      default:
        return <HomePage />;
    }
  };

  // Special case for login page - full screen without sidebar
  if (currentPage === 'login') {
    return (
      <ThemeProvider>
        <LoginPage />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="app-container">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="main-content">
          {renderPage()}
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;