import React from 'react';
import { Marquee } from '../components/Marquee';
// import mc1 from '../assets/mc/MC4-Photoroom.png'
// import mc2 from '../assets/mc/MC3-Photoroom.png'

const HeroPage: React.FC = () => {
  return (
    <div>
      <Marquee />
      <section className="hero-section">
        <h1 className="hero-title" style={{ fontSize: '2rem' }}>Advanced Honeypot Monitoring</h1>
        <h1 className="hero-title" style={{ fontSize: '5rem' }}>Smart Tiny HoneyPot</h1>
        <p className="hero-subtitle">
          Real-time threat detection and analysis across multiple honeypot systems. 
          Monitor, analyze, and respond to security threats with comprehensive 
          visibility into your network's attack surface.
        </p>
        {/* <img src={mc1} alt="mc1" className="hero-image1" />
        <img src={mc2} alt="mc2" className="hero-image2" /> */}

      </section>
        
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' , marginTop: '5%'}}>
        <div className="hero-features">
          <div className="hero-feature">
            <div className="hero-feature-icon">🔍</div>
            <h3 className="hero-feature-title">Real-time Monitoring</h3>
            <p className="hero-feature-description">
              Continuous monitoring of honeypot activities with instant alerts
            </p>
          </div>

          <div className="hero-feature">
            <div className="hero-feature-icon">🛡️</div>
            <h3 className="hero-feature-title">Threat Intelligence</h3>
            <p className="hero-feature-description">
              Automated threat detection and intelligence gathering
            </p>
          </div>

          <div className="hero-feature">
            <div className="hero-feature-icon">⚡</div>
            <h3 className="hero-feature-title">Rapid Response</h3>
            <p className="hero-feature-description">
              Quick incident response with automated blocking and alerts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroPage;