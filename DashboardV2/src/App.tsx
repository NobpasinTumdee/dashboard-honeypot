import { createBrowserRouter } from 'react-router-dom'
import { RouterProvider } from 'react-router-dom';
import Rootlayout from './layouts/Rootlayout'
import CowriePage from './components/Cowrie'
import Home from './components/Home'
import Dionaea from './components/Dionaea'
import WireShark from './components/WireShark'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Rootlayout />,
    errorElement: <h1>Not found this page...</h1>,
    children: [
      { index: true, element: <Home /> },
      { path: "cowrie", element: <CowriePage /> },
      { path: "dionaea", element: <Dionaea /> },
      { path: "wire-shark", element: <WireShark /> },
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
