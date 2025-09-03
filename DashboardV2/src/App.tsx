import { createBrowserRouter } from 'react-router-dom'
import { RouterProvider } from 'react-router-dom';
import Rootlayout from './layouts/Rootlayout'
import CowriePage from './components/Cowrie'
import Home from './components/Home'
import OpenCanary from './components/OpenCanary'
import ChatBot from './components/ai/ChatBot';
import Login from './components/Login/Login';
import FuzzyText from './components/Login/FuzzyText';
import Doclayout from './components/documentation/Doclayout';
import DocumentPage from './components/documentation/DocumentPage';
import DocumentCowrie from './components/documentation/DocumentCowrie';
import Wireshark from './components/Wireshark';
import DocumentCanary from './components/documentation/DocumentCanary';
import ProtectedRoute from './layouts/ProtectedRoute';
import AuthUser from './components/Login/AuthUser';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Rootlayout />,
    errorElement: <div style={{position: 'fixed',width: '100vw',height:'100vh',backgroundColor:'#242424',display:'flex',justifyContent:'center',alignItems:'center'}}><FuzzyText baseIntensity={0.2} >404 Not found this page...</FuzzyText></div>,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "cowrie", element: <ProtectedRoute><CowriePage /></ProtectedRoute> },
      { path: "open-canary", element: <ProtectedRoute><OpenCanary /></ProtectedRoute> },
      { path: "wireshark", element: <ProtectedRoute><Wireshark /></ProtectedRoute> },
      { path: "chatbot", element: <ProtectedRoute><ChatBot /></ProtectedRoute> },
      { path: "auth-user", element: <ProtectedRoute><AuthUser /></ProtectedRoute> },
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

// hello ubuntu ,hi windows!!!
function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
