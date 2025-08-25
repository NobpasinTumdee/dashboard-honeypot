import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../Styles/Navbar.css'
import LightRays from '../components/documentation/components/LightRays'
import { useEffect, useState } from 'react'

const Rootlayout = () => {
  const [background, setBackground] = useState(() => {
    const savedBackground = localStorage.getItem("background");
    return savedBackground === "true" ? true : false;
  });

  useEffect(() => {
    localStorage.setItem("background", background.toString());
  }, [background]);

  const toggleBackground = () => {
    setBackground(prevBackground => !prevBackground);
  };

  return (
    <>
      <Navbar />
      <div className='layout-overlap' />
      {!background &&
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
      }
      <div style={{ position: 'fixed', zIndex: 1, bottom: '10px', right: '10px', cursor: 'pointer' }} onClick={toggleBackground}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--body_text_color)"><path d="M680-640q-17 0-28.5-11.5T640-680q0-17 11.5-28.5T680-720q17 0 28.5 11.5T720-680q0 17-11.5 28.5T680-640ZM360-400l108-140 62 80 92-120 138 180H360ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm80-505v-215q0-33 23.5-56.5T320-880h200v80H320v215h-80Zm80 345q-33 0-56.5-23.5T240-320v-185h80v185h200v80H320Zm280 0v-80h200v-185h80v185q0 33-23.5 56.5T800-240H600Zm200-345v-215H600v-80h200q33 0 56.5 23.5T880-800v215h-80Z" /></svg>
      </div>
      <Outlet />
    </>
  )
}

export default Rootlayout
