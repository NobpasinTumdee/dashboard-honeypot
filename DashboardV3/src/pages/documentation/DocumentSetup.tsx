import './Doc.css';
import Aos from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';
import { HardwareDocumentation } from './docs/mockDocumentation';
import DocumentationSectionComponent from './docs/DocumentationSectionComponent';

const DocumentSetup = () => {
  const doc = HardwareDocumentation;
  useEffect(() => { Aos.init({ duration: 1000, once: true, }); }, []);
  return (
    <>
      <div className="doc-container">
        <h1 className="doc-title" data-aos="zoom-in" data-aos-duration="1500">SetUp Hardware</h1>
        <h2 data-aos="zoom-in" data-aos-duration="1500">นี่คือขั้นตอนการเซตค่า Hardware บน ubuntu ให้แต่ละเซอร์วิสทำงานได้</h2>
        <a href="https://github.com/NobpasinTumdee/dashboard-honeypot/blob/main/docs/Dashboard/AutoRun.md" target="_blank" className="doc-button" data-aos="zoom-in-up" data-aos-duration="2000">
          View Full Guide
        </a>
        <a href="#step1" className='scroll-down'>⬇</a>
      </div>

      <div style={{ fontFamily: 'Arial, sans-serif', margin: '10px 15% 10%' }} id='step1'>
        <h1 data-aos="zoom-in">{doc.name}</h1>
        <p data-aos="fade-up">{doc.description}</p>
        <div style={{ marginTop: '3rem' }} data-aos="fade-up">
          {doc.sections.map((section) => (
            <DocumentationSectionComponent key={section.id} section={section} />
          ))}
        </div>
      </div>
    </>
  )
}

export default DocumentSetup