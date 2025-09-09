// react router dom
import { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './layouts/ProtectedRoute';

// pages
import Rootlayout from './layouts/Rootlayout';
import HomePage from './pages/HomePage';
import HeroPage from './pages/HeroPage';
import CowriePage from './pages/CowriePage';
import OpenCanaryPage from './pages/OpenCanaryPage';
import WiresharkPage from './pages/WiresharkPage';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import ChatBotPopUp from './components/ai/ChatBot';
import Xss from './pages/Xss';

// styles
import './index.css';

// documentation
import Doclayout from './pages/documentation/Doclayout';
import DocumentPage from './pages/documentation/DocumentPage';
import DocumentCowrie from './pages/documentation/DocumentCowrie';
import DocumentCanary from './pages/documentation/DocumentCanary';
import DocumentWireshark from './pages/documentation/DocumentWireshark';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Rootlayout />,
    errorElement: <div style={{ position: 'fixed', width: '100vw', height: '100vh', backgroundColor: '#242424', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>404 Not found this page...</div>,
    children: [
      { index: true, element: <HeroPage /> },
      { path: "home", element: <ProtectedRoute><HomePage /></ProtectedRoute> },
      { path: "cowrie", element: <ProtectedRoute><CowriePage /></ProtectedRoute> },
      { path: "open-canary", element: <ProtectedRoute><OpenCanaryPage /></ProtectedRoute> },
      { path: "wireshark", element: <ProtectedRoute><WiresharkPage /></ProtectedRoute> },
      { path: "login", element: <LoginPage /> },
      { path: "users", element: <ProtectedRoute><UsersPage /></ProtectedRoute> },
      { path: "xss", element: <Xss /> },
    ]
  },
  {
    path: "/document",
    element: <Doclayout />,
    children: [
      { index: true, element: <DocumentPage /> },
      { path: "cowrie-guide", element: <DocumentCowrie /> },
      { path: "canary-guide", element: <DocumentCanary /> },
      { path: "wireshark-guide", element: <DocumentWireshark /> },
    ]
  }
]);
function App() {
  const [popupAI, setPopupAI] = useState(false);
  return (
    <ThemeProvider>
      <div className="app-container">
        <RouterProvider router={router} />
      </div>


      <div style={{ position: 'fixed', zIndex: 1, bottom: '10px', right: '10px', cursor: 'pointer' }} onClick={() => setPopupAI(!popupAI)}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--text-primary)"><path d="M400-240q-33 0-56.5-23.5T320-320v-50q-57-39-88.5-100T200-600q0-117 81.5-198.5T480-880q117 0 198.5 81.5T760-600q0 69-31.5 129.5T640-370v50q0 33-23.5 56.5T560-240H400Zm0-80h160v-92l34-24q41-28 63.5-71.5T680-600q0-83-58.5-141.5T480-800q-83 0-141.5 58.5T280-600q0 49 22.5 92.5T366-436l34 24v92Zm0 240q-17 0-28.5-11.5T360-120v-40h240v40q0 17-11.5 28.5T560-80H400Zm80-520Z" /></svg>
      </div>
      {popupAI &&
        <div className="chat-popup">
          <div className="chat-header">
            <p>AI Chat " HoneyBot "</p>
            <svg onClick={() => setPopupAI(false)} style={{ cursor: 'pointer' }} xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="var(--text-primary)"><path d="M240-120v-120H120v-80h200v200h-80Zm400 0v-200h200v80H720v120h-80ZM120-640v-80h120v-120h80v200H120Zm520 0v-200h80v120h120v80H640Z" /></svg>
          </div>
          <ChatBotPopUp />
        </div>
      }
      
    </ThemeProvider>
  );
}

export default App;