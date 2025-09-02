import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../Styles/Navbar.css'
import LightRays from '../components/documentation/components/LightRays'
import { useEffect, useState } from 'react'
import ChatBotPopUp from '../components/ai/ChatBotPopUp'

const Rootlayout = () => {
  const [popupAI, setPopupAI] = useState(false);
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
            raysColor="#F1EAB9"
            raysSpeed={1}
            lightSpread={4}
            rayLength={10}
            followMouse={true}
            mouseInfluence={0.1}
            noiseAmount={0.1}
            distortion={0.001}
            className="custom-rays"
          />
        </div>
      }
      <div style={{ position: 'fixed', zIndex: 1, bottom: '10px', left: '10px', cursor: 'pointer' }} onClick={toggleBackground}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--body_text_color)"><path d="M680-640q-17 0-28.5-11.5T640-680q0-17 11.5-28.5T680-720q17 0 28.5 11.5T720-680q0 17-11.5 28.5T680-640ZM360-400l108-140 62 80 92-120 138 180H360ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm80-505v-215q0-33 23.5-56.5T320-880h200v80H320v215h-80Zm80 345q-33 0-56.5-23.5T240-320v-185h80v185h200v80H320Zm280 0v-80h200v-185h80v185q0 33-23.5 56.5T800-240H600Zm200-345v-215H600v-80h200q33 0 56.5 23.5T880-800v215h-80Z" /></svg>
      </div>
      <div style={{ position: 'fixed', zIndex: 1, bottom: '10px', right: '10px', cursor: 'pointer' }} onClick={() => setPopupAI(!popupAI)}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--body_text_color)"><path d="M400-240q-33 0-56.5-23.5T320-320v-50q-57-39-88.5-100T200-600q0-117 81.5-198.5T480-880q117 0 198.5 81.5T760-600q0 69-31.5 129.5T640-370v50q0 33-23.5 56.5T560-240H400Zm0-80h160v-92l34-24q41-28 63.5-71.5T680-600q0-83-58.5-141.5T480-800q-83 0-141.5 58.5T280-600q0 49 22.5 92.5T366-436l34 24v92Zm0 240q-17 0-28.5-11.5T360-120v-40h240v40q0 17-11.5 28.5T560-80H400Zm80-520Z" /></svg>
      </div>
      {popupAI &&
        <div className="chat-popup">
          <div className="chat-header">
            <p>AI Chat " HoneyBot "</p>
            <svg onClick={() => setPopupAI(false)} style={{ cursor: 'pointer' }} xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="var(--body_text_color)"><path d="M240-120v-120H120v-80h200v200h-80Zm400 0v-200h200v80H720v120h-80ZM120-640v-80h120v-120h80v200H120Zm520 0v-200h80v120h120v80H640Z" /></svg>
          </div>
          <ChatBotPopUp />
        </div>
      }
      <Outlet />
    </>
  )
}

export default Rootlayout
