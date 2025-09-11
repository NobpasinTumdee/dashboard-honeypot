import { Marquee } from '../Marquee';
import './Loader.css';

const Loader = () => {
    return (
        <>
            <div className='loader-container'>
                <Marquee />
                <div className="loader-wrapper">
                    <span className="loader-letter">L</span>
                    <span className="loader-letter">o</span>
                    <span className="loader-letter">a</span>
                    <span className="loader-letter">d</span>
                    <span className="loader-letter">i</span>
                    <span className="loader-letter">n</span>
                    <span className="loader-letter">g</span>
                    <span className="loader-letter">.</span>
                    <span className="loader-letter">.</span>
                    <span className="loader-letter">.</span>
                    <div className="loader"></div>
                </div>
                <p className="loader-text">If you wait too long, it is possible that the server is having problems. Please provide the ngrok url.</p>
            </div>
        </>
    )
}

export default Loader
