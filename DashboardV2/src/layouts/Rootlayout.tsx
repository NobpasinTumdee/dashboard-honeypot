import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../Styles/Navbar.css'

const Rootlayout = () => {
  return (
    <>
      <Navbar />
      <div className='layout-overlap'></div>
      <Outlet />
    </>
  )
}

export default Rootlayout
