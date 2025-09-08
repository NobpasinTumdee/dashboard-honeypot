import { useEffect } from 'react';
import Aos from 'aos';
import 'aos/dist/aos.css';
import './Doc.css';
import { WiresharkAttckDocumentation, WiresharkDocumentation } from './docs/mockDocumentation';
import DocumentationSectionComponent from './docs/DocumentationSectionComponent';

const DocumentWireshark = () => {
    const doc1 = WiresharkDocumentation;
    const doc2 = WiresharkAttckDocumentation;
    useEffect(() => { Aos.init({ duration: 1000, once: true, }); }, []);
    return (
        <>
            <div className="doc-container">
                <h1 className="doc-title" data-aos="zoom-in" data-aos-duration="1500">Wireshark</h1>
                <p data-aos="zoom-in" data-aos-duration="1500">This guide covers the installation of Wireshark, a popular network protocol analyzer, and PyShark, a Python wrapper for Wireshark's command-line interface, TShark.</p>
                <a href="#step1" className='scroll-down'>⬇</a>
            </div>

            <div style={{ fontFamily: 'Arial, sans-serif', margin: '10px 15% 10%' }} id='step1'>
                <h1 data-aos="zoom-in">{doc1.name}</h1>
                <p data-aos="fade-up">{doc1.description}</p>
                <div style={{ marginTop: '3rem' }} data-aos="fade-up">
                    {doc1.sections.map((section) => (
                        <DocumentationSectionComponent key={section.id} section={section} />
                    ))}
                </div>
            </div>

            <h1 className="terminal-title" data-aos="fade-down" id='step1'>Attack Demo</h1>
            <div style={{ fontFamily: 'Arial, sans-serif', margin: '10px 15% 10%' }} id='step1'>
                <h1 data-aos="zoom-in">{doc2.name}</h1>
                <p data-aos="fade-up">{doc2.description}</p>
                <div style={{ marginTop: '3rem' }} data-aos="fade-up">
                    {doc2.sections.map((section) => (
                        <DocumentationSectionComponent key={section.id} section={section} />
                    ))}
                </div>
            </div>
        </>
    )
}

export default DocumentWireshark