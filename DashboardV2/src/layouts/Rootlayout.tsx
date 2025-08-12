import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../Styles/Navbar.css'
import LightRays from '../components/documentation/components/LightRays'

const Rootlayout = () => {
  return (
    <>
      <Navbar />
      <div className='layout-overlap' />
      <div style={{ width: '100vw', height: '100vh', position: 'fixed', zIndex: -1, top: 0 }}>
        <LightRays
          raysOrigin="top-center"
          raysColor="#DFD7AF"
          raysSpeed={5}
          lightSpread={0.8}
          rayLength={2}
          followMouse={false}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={5}
          className="custom-rays"
        />
      </div>
      <Outlet />
    </>
  )
}

export default Rootlayout
