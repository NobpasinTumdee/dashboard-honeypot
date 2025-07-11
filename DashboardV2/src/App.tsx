import { createBrowserRouter } from 'react-router-dom'
import { RouterProvider } from 'react-router-dom';
import Rootlayout from './layouts/Rootlayout'
import CowriePage from './components/Cowrie'
import Home from './components/Home'
import OpenCanary from './components/OpenCanary'
import WireShark from './components/WireShark'
import ChatBot from './components/ChatBot';
import Login from './components/Login/Login';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Rootlayout />,
    errorElement: <h1>Not found this page...</h1>,
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
