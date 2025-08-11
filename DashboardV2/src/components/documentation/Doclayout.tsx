import { Outlet } from 'react-router-dom'
import NavDoc from './NavDoc'
import './Doc.css'
import LightRays from './components/LightRays'

const Doclayout = () => {
    return (
        <>
            <NavDoc />
            <div style={{ width: '100vw', height: '100vh', position: 'fixed', zIndex: -1 }}>
                <LightRays
                    raysOrigin="top-center"
                    raysColor="#3aa48c"
                    raysSpeed={1.5}
                    lightSpread={0.8}
                    rayLength={2}
                    followMouse={true}
                    mouseInfluence={0.1}
                    noiseAmount={0.1}
                    distortion={2}
                    className="custom-rays"
                />
            </div>
            <Outlet />
        </>
    )
}

export default Doclayout
