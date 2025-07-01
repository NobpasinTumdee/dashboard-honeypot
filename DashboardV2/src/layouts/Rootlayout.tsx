import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

const Rootlayout = () => {
  return (
    <>
      <Navbar />
      <div style={{height: '70px'}}></div>
      <Outlet />
    </>
  )
}

export default Rootlayout
