import './Doc.css';
import Aos from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';
import TerminalCode from './components/terminalcode';
const DocumentCowrie = () => {
  useEffect(() => { Aos.init({ duration: 1000, once: true, }); }, []);
  return (
    <>
      <div className="doc-container">
        <h1 className="doc-title" data-aos="zoom-in" data-aos-duration="1500">Installing Cowrie in seven steps</h1>
        <h2 data-aos="zoom-in" data-aos-duration="1500">This guide describes how to install Cowrie in shell mode. For proxy mode read PROXY.rst.</h2>
        <a href="https://docs.cowrie.org/en/latest/INSTALL.html" target="_blank" className="doc-button" data-aos="zoom-in-up" data-aos-duration="2000">
          View Full Guide
        </a>
        <a href="#step1" className='scroll-down'>⬇</a>
      </div>

      <div className='move-step'>
        <a href="#step1" data-aos="fade-right" data-aos-duration="1000">1</a>
        <a href="#step2" data-aos="fade-right" data-aos-duration="1200">2</a>
        <a href="#step3" data-aos="fade-right" data-aos-duration="1400">3</a>
        <a href="#step4" data-aos="fade-right" data-aos-duration="1600">4</a>
        <a href="#step5" data-aos="fade-right" data-aos-duration="1800">5</a>
        <a href="#step6" data-aos="fade-right" data-aos-duration="2000">6</a>
        <a href="#step7" data-aos="fade-right" data-aos-duration="2200">7</a>
      </div>

      <h1 className="terminal-title" data-aos="fade-down" id='step1'>Cowrie installation</h1>
      <div className='terminal-container' id='step1'>
        <div className='next-step' data-aos="fade-up" data-aos-duration="2000">
          <h1>Step 1: Install system dependencies</h1>
          <p>First we install system-wide support for Python virtual environments and other dependencies. Actual Python packages are installed later.</p>
          <p>On Debian based systems (last verified on Debian Bookworm):</p>
        </div>
        <div data-aos="fade-up" className='next-step'>
          <TerminalCode headertext='change directory' type='sudo' code="apt-get install git python3-pip python3-venv libssl-dev libffi-dev build-essential libpython3-dev python3-minimal authbind" />
        </div>
      </div>


      <div className='terminal-container' id='step2'>
        <div className='next-step' data-aos="fade-up" data-aos-duration="2000">
          <h1>Step 2: Create a user account</h1>
          <p>It’s strongly recommended to run with a dedicated non-root user id:</p>
        </div>
        <div data-aos="fade-up" className='next-step'>
          <TerminalCode headertext='adduser cowrie' type='sudo' code="adduser --disabled-password cowrie" />
          <TerminalCode headertext='su cowrie' type='sudo' code="su - cowrie" />
        </div>
      </div>

      <div className='terminal-container' id='step3'>
        <div className='next-step' data-aos="fade-up" data-aos-duration="2000">
          <h1>Step 3: Checkout the code</h1>
          <p>Check out the code from GitHub:</p>
        </div>
        <div data-aos="fade-up" className='next-step'>
          <TerminalCode headertext='clone repository from github' type='git' code="clone http://github.com/cowrie/cowrie" />
          <TerminalCode headertext='change directory' type='cd' code="cowrie" />
        </div>
      </div>


      <div className='terminal-container'id='step4'>
        <div className='next-step' data-aos="fade-up" data-aos-duration="2000">
          <h1>Step 4: Setup Virtual Environment</h1>
          <p>Next you need to create your virtual environment:</p>
        </div>
        <div data-aos="fade-up" className='next-step'>
          <TerminalCode headertext='pwd /home/cowrie/cowrie' type='python3' code="-m venv cowrie-env" />
          <TerminalCode headertext='active cowrie-env' type='source' code="cowrie-env/bin/activate" />
        </div>
      </div>


      <div className='terminal-container' id='step5'>
        <div className='next-step' data-aos="fade-up" data-aos-duration="2000">
          <h1>Step 5: Install configuration file</h1>
          <p>The configuration for Cowrie is stored in cowrie.cfg.dist and cowrie.cfg (Located in cowrie/etc). Both files are read on startup, where entries from cowrie.cfg take precedence. The .dist file can be overwritten by upgrades, cowrie.cfg will not be touched. To run with a standard configuration, there is no need to change anything. To enable telnet, for example, create cowrie.cfg and input only the following:</p>
        </div>
        <div data-aos="fade-up" className='next-step'>
          <TerminalCode headertext='[telnet]' type='[telnet]' code="enabled = true" />
          <TerminalCode headertext='[ssh]' type='[ssh]' code="enabled = true" />
        </div>
      </div>


      <div className='terminal-container' id='step6'>
        <div className='next-step' data-aos="fade-up" data-aos-duration="2000">
          <h1>Step 6: Starting Cowrie</h1>
          <p>Start Cowrie with the cowrie command. You can add the cowrie/bin directory to your path if desired. An existing virtual environment is preserved if activated, otherwise Cowrie will attempt to load the environment called “cowrie-env”:</p>
        </div>
        <div data-aos="fade-up" className='next-step'>
          <TerminalCode headertext='Start cowrie' type='bin/cowrie' code="start" />
          <TerminalCode headertext='Status cowrie' type='bin/cowrie' code="status" />
          <TerminalCode headertext='Stop cowrie' type='bin/cowrie' code="stop" />
        </div>
      </div>

      <div className='terminal-container' id='step7'>
        <div className='next-step' data-aos="fade-up" data-aos-duration="2000">
          <h1>Step 7: Listening on port 22 (OPTIONAL)</h1>
          <p>There are three methods to make Cowrie accessible on the default SSH port (22): iptables, authbind and setcap.</p>
        </div>
        <div data-aos="fade-up" className='next-step'>
          <p>The following firewall rule will forward incoming traffic on port 22 to port 2222 on Linux:</p>
          <TerminalCode headertext='[ssh]' type='sudo' code="iptables -t nat -A PREROUTING -p tcp --dport 22 -j REDIRECT --to-port 2222" />
          <p>Or for telnet:</p>
          <TerminalCode headertext='[telnet]' type='sudo' code="iptables -t nat -A PREROUTING -p tcp --dport 23 -j REDIRECT --to-port 2223" />
        </div>
      </div>
    </>
  )
}

export default DocumentCowrie
