import { Link, useLocation } from 'react-router-dom';
import '../Styles/Navbar.css'
// import logo from '../assets/Honeypot-logo.png';
// import GlassSurface from './reactbits/ui/GlassSurface';

//theme web
const setDarkMode = () => {
    document.querySelector("body")?.setAttribute("data-theme", "dark");
    localStorage.setItem("SelectedTheme", "dark")
}
const setLightMode = () => {
    document.querySelector("body")?.setAttribute("data-theme", "light");
    localStorage.setItem("SelectedTheme", "light")
}
const SelectedTheme = localStorage.getItem("SelectedTheme");
if (SelectedTheme === "dark") {
    setDarkMode();
}
const toggleTheme = (e: any) => {
    if (e.target.checked) setDarkMode();
    else setLightMode();
}

const isLogin = localStorage.getItem("isLogin");
if (isLogin === "true") {
    console.log("Login Success");

}

const Navbar = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;
    return (
        <>
            <div className="Main-nav-bar">
                {/* <GlassSurface
                    width={"auto"}
                    height={"70px"}
                    borderRadius={50}
                    style={{padding:' 0 20px'}}
                > */}
                <div className='nav-bar-wrapper'>
                    <div className='group-logo'>
                        <img className='logo' src="https://www.mobilistics.de/_Resources/Persistent/1/1/0/0/11008f37693898dfc7206dafe7efd10ee29b7519/logo-bear.svg" alt="logo" width={45} />
                        <h2>Smart tiny HoneyPot</h2>
                    </div>
                    <div className="sub-nav-bar">
                        <Link to="/" className={`Link-button ${isActive('/') ? 'active' : ''}`}> Home </Link>
                        {isLogin === "true" ? (
                            <>
                                <Link to={'cowrie'} className={`Link-button ${isActive('/cowrie') ? 'active' : ''}`}>Cowrie </Link>
                                <Link to="open-canary" className={`Link-button ${isActive('/open-canary') ? 'active' : ''}`}>OpenCanary </Link>
                                <Link to="socket" className={`Link-button ${isActive('/socket') ? 'active' : ''}`}>Packets </Link>
                            </>
                        ) : (
                            <>
                                <Link to="login" className={`Link-button ${isActive('/login') ? 'active' : ''}`}>Login</Link>
                            </>
                        )}
                        <Link to="document" className={`Link-button ${isActive('/document') ? 'active' : ''}`}> Document </Link>
                        {isLogin === "true" && (
                            <Link to="chatbot" className="icon-nav">
                                <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="var(--body_text_color)"><path d="M180-380q-41.92 0-70.96-29.04Q80-438.08 80-480q0-41.92 29.04-70.96Q138.08-580 180-580v-87.69q0-29.83 21.24-51.07Q222.48-740 252.31-740H380q0-41.92 29.04-70.96Q438.08-840 480-840q41.92 0 70.96 29.04Q580-781.92 580-740h127.69q29.83 0 51.07 21.24Q780-697.52 780-667.69V-580q41.92 0 70.96 29.04Q880-521.92 880-480q0 41.92-29.04 70.96Q821.92-380 780-380v167.69q0 29.83-21.24 51.07Q737.52-140 707.69-140H252.31q-29.83 0-51.07-21.24Q180-182.48 180-212.31V-380Zm179.95-70q20.82 0 35.43-14.57Q410-479.14 410-499.95q0-20.82-14.57-35.43Q380.86-550 360.05-550q-20.82 0-35.43 14.57Q310-520.86 310-500.05q0 20.82 14.57 35.43Q339.14-450 359.95-450Zm240 0q20.82 0 35.43-14.57Q650-479.14 650-499.95q0-20.82-14.57-35.43Q620.86-550 600.05-550q-20.82 0-35.43 14.57Q550-520.86 550-500.05q0 20.82 14.57 35.43Q579.14-450 599.95-450ZM330-290h300v-60H330v60Zm-77.69 90h455.38q5.39 0 8.85-3.46t3.46-8.85v-455.38q0-5.39-3.46-8.85t-8.85-3.46H252.31q-5.39 0-8.85 3.46t-3.46 8.85v455.38q0 5.39 3.46 8.85t8.85 3.46ZM480-440Z" /></svg>
                            </Link>
                        )}
                        <div className="theme-toggle-wrapper">
                            <label className="toggle-switch">
                                {/* // checkbox for theme web */}
                                <input type="checkbox" id='darkmode-toggle' onChange={toggleTheme} defaultChecked={SelectedTheme === "dark"} />
                                <span className="slider">
                                    <div className="clouds">
                                        <svg viewBox="0 0 100 100" className="cloud cloud1">
                                            <path
                                                d="M30,45 Q35,25 50,25 Q65,25 70,45 Q80,45 85,50 Q90,55 85,60 Q80,65 75,60 Q65,60 60,65 Q55,70 50,65 Q45,70 40,65 Q35,60 25,60 Q20,65 15,60 Q10,55 15,50 Q20,45 30,45"
                                            ></path>
                                        </svg>
                                        <svg viewBox="0 0 100 100" className="cloud cloud2">
                                            <path
                                                d="M30,45 Q35,25 50,25 Q65,25 70,45 Q80,45 85,50 Q90,55 85,60 Q80,65 75,60 Q65,60 60,65 Q55,70 50,65 Q45,70 40,65 Q35,60 25,60 Q20,65 15,60 Q10,55 15,50 Q20,45 30,45"
                                            ></path>
                                        </svg>
                                    </div>
                                </span>
                            </label>
                        </div>
                        {isLogin === "true" &&
                            <>
                                <Link to={'login'} style={{ display: 'flex' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="var(--body_text_color)" style={{ opacity: '0.8' }}>
                                        <path d="M202.87-111.87q-37.78 0-64.39-26.61t-26.61-64.39v-554.26q0-37.78 26.61-64.39t64.39-26.61h279.04v91H202.87v554.26h279.04v91H202.87Zm434.02-156.65L574-333.93 674.56-434.5H358.09v-91h316.47L574-626.07l62.89-65.41L848.13-480 636.89-268.52Z" />
                                    </svg>
                                </Link>
                            </>
                        }
                        {/* <img className="Profile" src="https://i.pravatar.cc/40" alt="Profile" /> */}
                    </div>
                </div>
                {/* </GlassSurface> */}
            </div>
        </>
    )
}

export default Navbar
