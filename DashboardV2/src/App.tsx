import { useState } from 'react'
import './App.css'
import './Styles/Sidebar.css'
import './Styles/Header.css'
import './Styles/Dashborad.css'
import Logo from './assets/Honeypot-logo.png'
import { BarChart, LineChart } from '@mui/x-charts'

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
      <div className="hover-wrapper">
        <img
          className="toggle-button"
          src={Logo}
          alt="logo"
          width={70}
          onClick={() => setSidebar(!isSidebar)}
        />
        <span className="hover-text">Open Sidebar</span>
      </div>

      <div className='main'>
        <div className={`sidebar ${isSidebar ? 'open' : 'closed'}`}>
          <img src={Logo} alt="logo" width={70} onClick={() => setSidebar(!isSidebar)} style={{ cursor: 'pointer' }} />
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
            <label className="switch-with-icon">
              <input
                // checkbox for theme web
                type="checkbox"
                id='darkmode-toggle'
                onChange={toggleTheme}
                defaultChecked={SelectedTheme === "dark"}
              />
              <span className="slider">
                <span className="icon sun">☀️</span>
                <span className="icon moon">🌙</span>
              </span>
            </label>
            <img className='Profile-Admin' src="https://i.pravatar.cc/40" alt="Profile" />
            <p>PorGz</p>
          </div>
          <div className='dashborad-main'>
            <h2>Dashborad</h2>
            <div className='overview-in-main'>
              <div className='chart-mini-size'>
                <p>Cowrie</p>
                <LineChart
                  sx={{
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    border: '1px solid var(--line_header)',
                    margin: '10px'
                  }}
                  xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
                  series={[
                    {
                      data: [2, 5.5, 2, 8.5, 1.5, 5],
                    },
                  ]}
                  height={200}
                />
              </div>
              <div className='chart-mini-size'>
                <p>Dionaea</p>
                <LineChart
                  sx={{
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    border: '1px solid var(--line_header)',
                    margin: '10px'
                  }}
                  xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
                  series={[
                    {
                      data: [2, 2, 6, 8.5, 1.5, 5],
                    },
                  ]}
                  height={200}
                />
              </div>
              <div className='chart-mini-size'>
                <p>Wire Shark</p>
                <LineChart
                  sx={{
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    border: '1px solid var(--line_header)',
                    margin: '10px'
                  }}
                  xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
                  series={[
                    {
                      data: [2, 5, 1, 8.5, 15, 5],
                    },
                  ]}
                  height={200}
                />
              </div>
            </div>
            <div className='overview-in-main'>
              <div className='chart-mini-size'>
                <p>Overview</p>
                <BarChart
                  xAxis={[{ data: ['group A', 'group B', 'group C'] }]}
                  series={[{ data: [4, 3, 5] ,color: '#8470FF'}, { data: [1, 6, 3] ,color: '#67BFFF'}, { data: [2, 5, 6] ,color: '#61C8B5'}]}
                />
              </div>
              <div className='chart-mini-size'>
                <p>I don't Know bro.</p>
                <BarChart
                  xAxis={[{ data: ['group A', 'group B', 'group C'] }]}
                  series={[{ data: [4, 3, 5] ,color: '#8470FF'}, { data: [1, 6, 3] ,color: '#67BFFF'}, { data: [2, 5, 6] ,color: '#61C8B5'}]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  )
}

export default App
