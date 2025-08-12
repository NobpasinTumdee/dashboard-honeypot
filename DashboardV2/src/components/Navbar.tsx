import { Link, useLocation } from 'react-router-dom';
import '../Styles/Navbar.css'
// import logo from '../assets/Honeypot-logo.png';
import GlassSurface from './reactbits/ui/GlassSurface';

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
                <GlassSurface
                    width={"auto"}
                    height={"70px"}
                    borderRadius={50}
                    style={{padding:' 0 20px'}}
                >
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
                                <Link to="socket" className={`Link-button ${isActive('/socket') ? 'active' : ''}`}>Web socket </Link>
                            </>
                        ) : (
                            <>
                                <Link to="login" className={`Link-button ${isActive('/login') ? 'active' : ''}`}>Login</Link>
                            </>
                        )}
                        <Link to="document" className={`Link-button ${isActive('/document') ? 'active' : ''}`}> Document </Link>
                        <Link to="login" className={`Link-button-mobile ${isActive('/login') ? 'active' : ''}`}>Login </Link>
                        <Link to="chatbot" className={`Link-button-mobile ${isActive('/chatbot') ? 'active' : ''}`}> chatbot </Link>
                        <div className='group-menu'>
                            {isLogin === "true" && (
                                <>
                                    <Link to="/" className="icon-nav">🔔</Link>
                                    <Link to="chatbot" className="icon-nav">💬</Link>
                                </>
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
                                <Link to={'login'} style={{ display: 'flex' }}><img className="Profile" src="https://images2.alphacoders.com/129/1299701.jpg" alt="Profile" /></Link>
                            }
                        </div>
                        {/* <img className="Profile" src="https://i.pravatar.cc/40" alt="Profile" /> */}
                    </div>
                </GlassSurface>
            </div>
        </>
    )
}

export default Navbar
