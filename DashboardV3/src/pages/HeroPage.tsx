import React from 'react';

const HeroPage: React.FC = () => {
  return (
    <div>

      <section className="hero-section">
        <h1 className="hero-title" style={{ fontSize: '2rem' }}>Advanced Honeypot Monitoring</h1>
        <h1 className="hero-title" style={{ fontSize: '5rem' }}>Smart Tiny HoneyPot</h1>
        <p className="hero-subtitle">
          Real-time threat detection and analysis across multiple honeypot systems. 
          Monitor, analyze, and respond to security threats with comprehensive 
          visibility into your network's attack surface.
        </p>

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