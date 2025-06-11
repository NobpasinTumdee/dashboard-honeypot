import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  //theme web
  const setDarkMode = () => {
    document.querySelector("body")?.setAttribute("data-theme","dark");
    localStorage.setItem("SelectedTheme","dark")
  }
  const setLightMode = () => {
    document.querySelector("body")?.setAttribute("data-theme","light");
    localStorage.setItem("SelectedTheme","light")
  }
  const SelectedTheme = localStorage.getItem("SelectedTheme");
  if (SelectedTheme === "dark") {
    setDarkMode();
  }
  const toggleTheme = (e : any) => {
    if (e.target.checked) setDarkMode();
    else setLightMode();
  }

  return (
    <>
      <input
        // checkbox for theme web
        type="checkbox"
        id='darkmode-toggle'
        onChange={toggleTheme}
        defaultChecked={SelectedTheme === "dark"}
      />


      <h1>Vite + React</h1>
      <div>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p>
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
