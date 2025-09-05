import React from 'react';

const HeroPage: React.FC = () => {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Hero</h1>
        <p className="page-subtitle">Welcome to HoneyPot Monitoring System</p>
      </div>

      <section className="hero-section">
        <h1 className="hero-title">Advanced Honeypot Monitoring</h1>
        <p className="hero-subtitle">
          Real-time threat detection and analysis across multiple honeypot systems. 
          Monitor, analyze, and respond to security threats with comprehensive 
          visibility into your network's attack surface.
        </p>

        <div className="hero-features">
          <div className="hero-feature">
            <div className="hero-feature-icon">🔍</div>
            <h3 className="hero-feature-title">Real-time Monitoring</h3>
            <p className="hero-feature-description">
              Continuous monitoring of honeypot activities with instant alerts
            </p>
          </div>

          <div className="hero-feature">
            <div className="hero-feature-icon">📊</div>
            <h3 className="hero-feature-title">Advanced Analytics</h3>
            <p className="hero-feature-description">
              Comprehensive data analysis with interactive charts and reports
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
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="stat-card primary">
          <div className="stat-header">
            <div className="stat-title">System Overview</div>
            <div className="stat-icon">🖥️</div>
          </div>
          <div style={{ color: '#94a3b8', marginBottom: '1rem' }}>
            Our honeypot monitoring system provides comprehensive visibility into network threats.
          </div>
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>3 Systems Active</div>
        </div>

        <div className="stat-card success">
          <div className="stat-header">
            <div className="stat-title">Coverage</div>
            <div className="stat-icon">🌐</div>
          </div>
          <div style={{ color: '#94a3b8', marginBottom: '1rem' }}>
            Full spectrum coverage across SSH, HTTP/HTTPS, and network protocols.
          </div>
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>100% Coverage</div>
        </div>

        <div className="stat-card warning">
          <div className="stat-header">
            <div className="stat-title">Performance</div>
            <div className="stat-icon">⚡</div>
          </div>
          <div style={{ color: '#94a3b8', marginBottom: '1rem' }}>
            High-performance monitoring with minimal latency and maximum uptime.
          </div>
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>99.9% Uptime</div>
        </div>
      </div>
    </div>
  );
};

export default HeroPage;