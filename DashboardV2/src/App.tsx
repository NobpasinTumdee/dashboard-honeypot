import { createBrowserRouter } from 'react-router-dom'
import { RouterProvider } from 'react-router-dom';
import Rootlayout from './layouts/Rootlayout'
import CowriePage from './components/Cowrie'
import Home from './components/Home'
import OpenCanary from './components/OpenCanary'
import WireShark from './components/WireShark'
import ChatBot from './components/ChatBot';
import Login from './components/Login/Login';
import FuzzyText from './components/Login/FuzzyText';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Rootlayout />,
    errorElement: <div style={{position: 'fixed',width: '100vw',height:'100vh',backgroundColor:'#242424',display:'flex',justifyContent:'center',alignItems:'center'}}><FuzzyText baseIntensity={0.2} >404 Not found this page...</FuzzyText></div>,
    children: [
      { index: true, element: <Home /> },
      { path: "cowrie", element: <CowriePage /> },
      { path: "open-canary", element: <OpenCanary /> },
      { path: "wire-shark", element: <WireShark /> },
      { path: "chatbot", element: <ChatBot /> },
      { path: "login", element: <Login /> },
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
