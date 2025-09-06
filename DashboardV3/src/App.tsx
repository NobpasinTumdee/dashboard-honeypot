// react router dom
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

// styles
import './index.css';

// documentation
import Doclayout from './pages/documentation/Doclayout';
import DocumentPage from './pages/documentation/DocumentPage';
import DocumentCowrie from './pages/documentation/DocumentCowrie';
import DocumentCanary from './pages/documentation/DocumentCanary';

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
    ]
  },
  {
    path: "/document",
    element: <Doclayout />,
    children: [
      { index: true, element: <DocumentPage /> },
      { path: "cowrie-guide", element: <DocumentCowrie /> },
      { path: "canary-guide", element: <DocumentCanary /> },
    ]
  }
]);
function App() {

  return (
    <ThemeProvider>
      <div className="app-container">
        <RouterProvider router={router} />
      </div>
    </ThemeProvider>
  );
}

export default App;