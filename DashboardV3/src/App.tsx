// react router dom
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

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

const router = createBrowserRouter([
  {
    path: "/",
    element: <Rootlayout />,
    errorElement: <div style={{ position: 'fixed', width: '100vw', height: '100vh', backgroundColor: '#242424', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>404 Not found this page...</div>,
    children: [
      { index: true, element: <HeroPage /> },
      { path: "home", element: <HomePage /> },
      { path: "cowrie", element: <CowriePage /> },
      { path: "open-canary", element: <OpenCanaryPage /> },
      { path: "wireshark", element: <WiresharkPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "users", element: <UsersPage /> },
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