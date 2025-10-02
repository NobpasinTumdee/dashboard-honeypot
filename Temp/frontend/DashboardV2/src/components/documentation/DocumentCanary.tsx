import './Doc.css';
import Aos from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';
import TerminalCode from './components/terminalcode';

const DocumentCanary = () => {
    useEffect(() => { Aos.init({ duration: 1000, once: true, }); }, []);
    return (
        <>
            <div className="doc-container">
                <h1 className="doc-title" data-aos="zoom-in" data-aos-duration="1500">OpenCanary</h1>
                <h2 data-aos="zoom-in" data-aos-duration="1500">Welcome to the OpenCanary guide.</h2>
                <p data-aos="zoom-in" data-aos-duration="1500">OpenCanary is a daemon that runs canary services,<br />which trigger alerts when (ab) is used. The alerts can be sent to a variety of sources,<br /> including Syslog, emails, and a companion daemon opencanary-correlator.</p>
                <a href="https://opencanary.readthedocs.io/en/latest/" target="_blank" className="doc-button" data-aos="zoom-in-up" data-aos-duration="2000">
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
                <a href="#step8" data-aos="fade-right" data-aos-duration="2200">8</a>
            </div>

            <h1 className="terminal-title" data-aos="fade-down" id='step1'>OpenCanary installation</h1>
            <div className='terminal-container' id='step1'>
                <div className='next-step' data-aos="fade-up" data-aos-duration="2000">
                    <h1>Step 1: อัพเดท และ ติดตั้งไลบารีที่จำเป็น</h1>
                    <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quos distinctio officiis ut fugit reiciendis laborum iusto ducimus voluptatem? Aliquam libero temporibus sunt quae qui tempore mollitia, eum est? Maxime neque nisi nemo dolorum cumque dolores, inventore qui eligendi animi quia harum in mollitia aliquid perferendis odit natus repellat enim rem!</p>
                </div>
                <div data-aos="fade-up" className='next-step'>
                    <TerminalCode headertext='update' type='sudo' code="apt update && apt upgrade -y" />
                    <TerminalCode headertext='install' type='sudo' code="apt-get install python3-dev python3-pip python3-virtualenv python3-venv python3-scapy libssl-dev libpcap-dev" />
                </div>
            </div>

            <div className='terminal-container' id='step2'>
                <div className='next-step' data-aos="fade-up" data-aos-duration="2000">
                    <h1>Step 2: สร้าง Python Virtual Environment</h1>
                    <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quos distinctio officiis ut fugit reiciendis laborum iusto ducimus voluptatem? Aliquam libero temporibus sunt quae qui tempore mollitia, eum est? Maxime neque nisi nemo dolorum cumque dolores, inventore qui eligendi animi quia harum in mollitia aliquid perferendis odit natus repellat enim rem!</p>
                </div>
                <div data-aos="fade-up" className='next-step'>
                    <p>pwd to /home/cpe27</p>
                    <TerminalCode headertext='virtual env' type='virtualenv' code="env/" />
                    <TerminalCode headertext='source' type='source' code="env/bin/activate" />
                </div>
            </div>

            <div className='terminal-container' id='step3'>
                <div className='next-step' data-aos="fade-up" data-aos-duration="2000">
                    <h1>Step 3: ติดตั้ง OpenCanary</h1>
                    <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quos distinctio officiis ut fugit reiciendis laborum iusto ducimus voluptatem? Aliquam libero temporibus sunt quae qui tempore mollitia, eum est? Maxime neque nisi nemo dolorum cumque dolores, inventore qui eligendi animi quia harum in mollitia aliquid perferendis odit natus repellat enim rem!</p>
                </div>
                <div data-aos="fade-up" className='next-step'>
                    <TerminalCode headertext='install' type='pip' code="install opencanary" />
                </div>
            </div>

            <div className='terminal-container' id='step4'>
                <div className='next-step' data-aos="fade-up" data-aos-duration="2000">
                    <h1>Step 4: ติดตั้งโมดูลเสริม</h1>
                    <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quos distinctio officiis ut fugit reiciendis laborum iusto ducimus voluptatem? Aliquam libero temporibus sunt quae qui tempore mollitia, eum est? Maxime neque nisi nemo dolorum cumque dolores, inventore qui eligendi animi quia harum in mollitia aliquid perferendis odit natus repellat enim rem!</p>
                </div>
                <div data-aos="fade-up" className='next-step'>
                    <TerminalCode headertext='install' type='sudo' code="apt install samba" />
                    <TerminalCode headertext='pip' type='pip' code="install scapy pcapy-ng" />
                </div>
            </div>

            <div className='terminal-container' id='step5'>
                <div className='next-step' data-aos="fade-up" data-aos-duration="2000">
                    <h1>Step 5: สร้างไฟล์คอนฟิก</h1>
                    <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quos distinctio officiis ut fugit reiciendis laborum iusto ducimus voluptatem? Aliquam libero temporibus sunt quae qui tempore mollitia, eum est? Maxime neque nisi nemo dolorum cumque dolores, inventore qui eligendi animi quia harum in mollitia aliquid perferendis odit natus repellat enim rem!</p>
                </div>
                <div data-aos="fade-up" className='next-step'>
                    <p>(/etc/opencanaryd/opencanary.conf)</p>
                    <TerminalCode headertext='config file' type='opencanaryd' code="--copyconfig" />
                </div>
            </div>

            <div className='terminal-container' id='step6'>
                <div className='next-step' data-aos="fade-up" data-aos-duration="2000">
                    <h1>Step 6: แก้ไข config</h1>
                    <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quos distinctio officiis ut fugit reiciendis laborum iusto ducimus voluptatem? Aliquam libero temporibus sunt quae qui tempore mollitia, eum est? Maxime neque nisi nemo dolorum cumque dolores, inventore qui eligendi animi quia harum in mollitia aliquid perferendis odit natus repellat enim rem!</p>
                </div>
                <div data-aos="fade-up" className='next-step'>
                    <TerminalCode headertext='edit config file' type='sudo' code="nano /etc/opencanaryd/opencanary.conf" />
                    <p>
                        "http.enabled": true,<br />
                        "https.enabled": true,<br />
                        "ftp.enabled": true,
                    </p>
                </div>
            </div>

            <div className='terminal-container' id='step7'>
                <div className='next-step' data-aos="fade-up" data-aos-duration="2000">
                    <h1>Step 7: รัน OpenCanary</h1>
                    <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quos distinctio officiis ut fugit reiciendis laborum iusto ducimus voluptatem? Aliquam libero temporibus sunt quae qui tempore mollitia, eum est? Maxime neque nisi nemo dolorum cumque dolores, inventore qui eligendi animi quia harum in mollitia aliquid perferendis odit natus repellat enim rem!</p>
                </div>
                <div data-aos="fade-up" className='next-step'>
                    <TerminalCode headertext='evironment' type='.' code="env/bin/activate" />
                    <p>run opencanaryd</p>
                    <TerminalCode headertext='run' type='opencanaryd' code="--start --uid=nobody --gid=nogroup" />
                    <p>stop opencanaryd</p>
                    <TerminalCode headertext='stop' type='opencanaryd' code="--stop" />
                </div>
            </div>

            <div className='terminal-container' id='step8'>
                <div className='next-step' data-aos="fade-up" data-aos-duration="2000">
                    <h1>Step 8: เปิดไฟล์ log</h1>
                    <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quos distinctio officiis ut fugit reiciendis laborum iusto ducimus voluptatem? Aliquam libero temporibus sunt quae qui tempore mollitia, eum est? Maxime neque nisi nemo dolorum cumque dolores, inventore qui eligendi animi quia harum in mollitia aliquid perferendis odit natus repellat enim rem!</p>
                </div>
                <div data-aos="fade-up" className='next-step'>
                    <TerminalCode headertext='cd' type='cd' code="/var/tmp" />
                    <TerminalCode headertext='open log' type='nano' code="opencanary.log" />
                </div>
            </div>

        </>
    )
}

export default DocumentCanary
