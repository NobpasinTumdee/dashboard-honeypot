import { useEffect } from 'react';
import Aos from 'aos';
import 'aos/dist/aos.css';
import './Doc.css';

const DocumentWireshark = () => {
    useEffect(() => { Aos.init({ duration: 1000, once: true, }); }, []);
    return (
        <>
            <div className="doc-container">
                <h1 className="doc-title" data-aos="zoom-in" data-aos-duration="1500">Wireshark</h1>
                <h2 data-aos="zoom-in" data-aos-duration="1500">Welcome to the Wireshark guide.</h2>
                <a href="#step1" className='scroll-down'>⬇</a>
            </div>
        </>
    )
}

export default DocumentWireshark