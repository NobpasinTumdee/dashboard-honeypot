import { useState } from 'react'
import './App.css'
import './Styles/Sidebar.css'
import Logo from './assets/Honeypot-logo.png'

function App() {

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


  //side bar
  const [isSidebar, setSidebar] = useState(true)

  return (
    <>
      {/* <img src={Logo} alt="logo" width={70} onClick={() => setSidebar(!isSidebar)} /> */}
      <div className='main'>
        <div className={`sidebar ${isSidebar ? 'open' : 'closed'}`}>
          <img src={Logo} alt="logo" width={70} onClick={() => setSidebar(!isSidebar)} />
          <p>PAGES</p>
          <ul>
            <li className='side-menu'>🏠 Overview</li>
            <li className='side-menu'>🐚 Cowrie</li>
            <li className='side-menu'>🦖 Dionaea</li>
            <li className='side-menu'>🦈 Wire Shark</li>
          </ul>
          <p>Chat bot AI</p>
          <ul>
            <li className='side-menu'>Chat GPT</li>
            <li className='side-menu'>Gemini</li>
            <li className='side-menu'>Ollama</li>
            <li className='side-menu'>Foundry</li>
            <li className='side-menu'>PorGz</li>
          </ul>
        </div>
        <div className='main-dashbord'>
          <div className='header'>
            <input
              // checkbox for theme web
              type="checkbox"
              id='darkmode-toggle'
              onChange={toggleTheme}
              defaultChecked={SelectedTheme === "dark"}
            />
            header
          </div>
          <div>
            dashbord
          </div>
        </div>
      </div>

    </>
  )
}

export default App
