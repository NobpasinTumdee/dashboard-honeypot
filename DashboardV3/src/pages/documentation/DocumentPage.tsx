import { useEffect } from 'react';
import TerminalCode from './components/terminalcode';
import './Doc.css';
import Aos from 'aos';
import 'aos/dist/aos.css';
// import { GetstartDocumentation } from './docs/mockDocumentation';
// import DocumentationSectionComponent from './docs/DocumentationSectionComponent';

const DocumentPage = () => {
    // const doc = GetstartDocumentation;
    useEffect(() => { Aos.init({ duration: 1000, once: true, }); }, []);
    return (
        <>
            <div className="doc-container">
                <h1 className="doc-title" data-aos="zoom-in" data-aos-duration="1500">Honeypot Deployment & Dashboard Guide</h1>
                <h2 data-aos="zoom-in" data-aos-duration="1500">Your Complete Honeypot Setup Guide</h2>
                <p className="doc-subtitle" data-aos="zoom-in" data-aos-duration="2000">
                    Learn how to deploy a fully functional honeypot system from scratch. This guide covers everything from installing and configuring the honeypot backend, building a real-time monitoring dashboard, to integrating alerts and data visualization. Whether you’re a beginner or experienced in cybersecurity, you’ll find step-by-step instructions to set up, customize, and secure your honeypot environment.
                </p>
                <a href="#target" className="doc-button" data-aos="zoom-in-up" data-aos-duration="2000">
                    View Full Guide
                </a>
                <a href="#step1" className='scroll-down'>⬇</a>
            </div>



            {/* <div style={{ fontFamily: 'Arial, sans-serif', padding: '2rem' }}>
                <h1>{doc.name}</h1>
                <p>{doc.description}</p>
                <div style={{ marginTop: '3rem' }}>
                    {doc.sections.map((section) => (
                        <DocumentationSectionComponent key={section.id} section={section} />
                    ))}
                </div>
            </div> */}


            <div className='move-step'>
                <a href="#step1" data-aos="fade-right" data-aos-duration="1000">I</a>
                <a href="#step2" data-aos="fade-right" data-aos-duration="1200">II</a>
                <a href="#step3" data-aos="fade-right" data-aos-duration="1400">III</a>
                <a href="#step4" data-aos="fade-right" data-aos-duration="1600">IV</a>
            </div>

            <h1 className="terminal-title" data-aos="fade-down" id='step1'>Quick Start</h1>
            <div className='terminal-container'>
                <div className='next-step' data-aos="fade-up" data-aos-duration="2000">
                    <h1>Step 1 - Clone the Dashboard Repository</h1>
                    <p>Before we can start building our honeypot dashboard, we need the source code. Think of this step as downloading the “blueprint” for your entire system. Run the command below to pull the project straight from GitHub. Once it’s done, move into the project folder — that’s where all the magic will happen in the next steps.</p>
                    <p>By the end of this step, you’ll have the complete dashboard code sitting on your machine, ready for customization, configuration, and a bit of hacking fun.</p>
                </div>
                <div data-aos="fade-up" className='next-step'>
                    <TerminalCode headertext='clone repository from github' type='git' code="clone https://github.com/NobpasinTumdee/dashboard-honeypot.git" />
                    <TerminalCode headertext='change directory' type='cd' code=".\dashboard-honeypot" />
                </div>
            </div>


            <div className='terminal-container' id='step2'>
                <div className='next-step' data-aos="fade-up" data-aos-duration="2000">
                    <h1>Step 2 - Install and Launch the Frontend</h1>
                    <p>Now that you’ve got the main dashboard project, it’s time to fire up the frontend — the part that you’ll actually see and interact with in your browser.</p>
                    <p>First, head into the DashboardV2 directory. This is where all the frontend code lives. Then, run npm install to grab all the packages and dependencies it needs (think of it as stocking your toolbox with the right tools).</p>
                    <p>Once that’s done, launch the development server with npm run dev. This will spin up your dashboard locally so you can see changes in real time as we build things out.</p>
                </div>
                <div data-aos="fade-up" className='next-step'>
                    <TerminalCode headertext='change directory' type='cd' code=".\DashboardV2" />
                    <TerminalCode headertext='install libraries' type='npm' code="install" />
                    <TerminalCode headertext='run frontend' type='npm' code="run dev" />
                </div>
            </div>


            <div className='terminal-container' id='step3'>
                <div className='next-step' data-aos="fade-up" data-aos-duration="2000">
                    <h1>Step 3 - Install and Run the Backend</h1>
                    <p>With the frontend up and running,<br />it’s time to give it a brain — the backend.<br />This is where all the data handling, authentication, and socket connections happen. Without it, your dashboard is just a pretty face with no substance.<br /><br />First, navigate into the backend directory</p>
                    <p>Next, install all the required packages in one go. Here’s what you’re getting:<br /><br />
                        🟢 express – Your web server framework<br />
                        🟢 cors – To handle cross-origin requests (frontend ↔ backend)<br />
                        🟢 morgan – Request logger for easier debugging<br />
                        🟢 bcryptjs – For password hashing and security<br />
                        🟢 jsonwebtoken – For authentication via JWT<br />
                        🟢 prisma – Your database toolkit<br />
                        🟢 socket.io – Real-time communication between server and dashboard<br />
                        🟢 dotenv – Manage environment variables<br />
                        🟢 nodemon – Auto-restart the server on changes<br />
                        🟢 sqlite3 – The lightweight database engine
                    </p>
                    <p>After that, sync Prisma with your existing database and generate the client.</p>
                    <p>Finally, start your backend in development mode.</p>
                </div>
                <div data-aos="fade-up" className='next-step'>
                    <p>set up backend</p>
                    <TerminalCode headertext='change directory' type='cd' code=".\server\API\socket" />
                    <TerminalCode headertext='install libraries' type='npm' code="install express cors morgan bcryptjs jsonwebtoken prisma socket.io dotenv nodemon sqlite3" />
                    <p>prisma</p>
                    <TerminalCode headertext='prisma library (pull database)' type='npx' code="prisma db pull" />
                    <TerminalCode headertext='prisma library (generate)' type='npx' code="prisma generate" />
                    <TerminalCode headertext='run backend' type='npm' code="run dev" />
                </div>
            </div>


            <div className='terminal-container' id='step4'>
                <div className='next-step' data-aos="fade-up" data-aos-duration="2000">
                    <h1>Step 4 - run python script</h1>
                    <p>Now that both your frontend and backend are ready, it’s time to process some honeypot log data!</p>
                    <p>Navigate into the folder where the Python script lives</p>
                    <p>This script, Honeypot_Log_Processor.py, is responsible for converting raw honeypot logs into a format your dashboard can understand and display. Running it will prepare your data so you can visualize attacks and sessions more clearly.</p>
                    <p>Next, run the Python script to process the data.</p>
                </div>
                <div data-aos="fade-up" className='next-step'>
                    <TerminalCode headertext='change directory' type='cd' code=".\server\plugin\convertData" />
                    <TerminalCode headertext='run python script' type='python3' code=".\Honeypot_Log_Processor.py" />
                </div>
            </div>
        </>
    );
}

export default DocumentPage;

