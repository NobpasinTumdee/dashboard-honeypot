import { createBrowserRouter } from 'react-router-dom'
import { RouterProvider } from 'react-router-dom';
import Rootlayout from './layouts/Rootlayout'
import CowriePage from './components/Cowrie'
import Home from './components/Home'
import OpenCanary from './components/OpenCanary'
import ChatBot from './components/ChatBot';
import Login from './components/Login/Login';
import FuzzyText from './components/Login/FuzzyText';
import Doclayout from './components/documentation/Doclayout';
import DocumentPage from './components/documentation/DocumentPage';
import DocumentCowrie from './components/documentation/DocumentCowrie';
import LogDisplay from './components/web-socket/Packet';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Rootlayout />,
    errorElement: <div style={{position: 'fixed',width: '100vw',height:'100vh',backgroundColor:'#242424',display:'flex',justifyContent:'center',alignItems:'center'}}><FuzzyText baseIntensity={0.2} >404 Not found this page...</FuzzyText></div>,
    children: [
      { index: true, element: <Home /> },
      { path: "cowrie", element: <CowriePage /> },
      { path: "open-canary", element: <OpenCanary /> },
      { path: "chatbot", element: <ChatBot /> },
      { path: "login", element: <Login /> },
      { path: "socket", element: <LogDisplay /> },
    ]
  },
  {
    path: "/document",
    element: <Doclayout />,
    children: [
      { index: true, element: <DocumentPage /> },
      { path: "cowrie-guide", element: <DocumentCowrie /> },
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
