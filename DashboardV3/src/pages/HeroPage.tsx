import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
// import mc1 from '../assets/mc/MC4-Photoroom.png'
// import mc2 from '../assets/mc/MC3-Photoroom.png'

const HeroPage: React.FC = () => {
  return (
    <>
      {/* <section className="hero-section">
        <h1 className="hero-title" style={{ fontSize: '2rem' }}>Advanced Honeypot Monitoring</h1>
        <h1 className="hero-title" style={{ fontSize: '5rem' }}>Smart Tiny HoneyPot</h1>
        <p className="hero-subtitle">
          Real-time threat detection and analysis across multiple honeypot systems.
          Monitor, analyze, and respond to security threats with comprehensive
          visibility into your network's attack surface.
        </p>
        <img src={mc1} alt="mc1" className="hero-image1" />
        <img src={mc2} alt="mc2" className="hero-image2" />
      </section> */}
      {/* Hero Content */}
      <div className="hero-container">
        {/* Navigation Header */}
        <nav className="hero-nav">
          <div className="hero-nav-content">
            <div className="hero-logo">
              <span className="hero-logo-text">HoneyPot</span>
            </div>

            <div className="hero-nav-links">
              <Link to="/home" className="hero-nav-link">Dashboard</Link>
              <Link to="/home/cowrie" className="hero-nav-link">Cowrie</Link>
              <Link to="/home/open-canary" className="hero-nav-link">OpenCanary</Link>
              <Link to="/home/wireshark" className="hero-nav-link">Wireshark</Link>
              <Link to="/home/users" className="hero-nav-link">User Management</Link>
              <Link to="/document" className="hero-nav-link">Document</Link>
              <ThemeToggle />
            </div>

            <button className="hero-open-btn">
              <Link to="/home/login" style={{ textDecoration: 'none', color: 'inherit' }}>Login</Link>
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <main className="hero-main">
          <div className="hero-content">
            <div className="hero-left">
              <h1 className="hero-title-new">
                <span className="hero-title-new-line">Monitoring</span>
                <span className="hero-title-new-line">Smart Tiny</span>
                <span className="hero-title-new-line">HoneyPot</span>
              </h1>

              <p className="hero-description">
                Real-time threat detection and analysis across multiple honeypot systems.
                Monitor, analyze, and respond to security threats with comprehensive
                visibility into your network's attack surface.
              </p>

              <div className="hero-buttons">
                <button className="hero-btn hero-btn-primary" onClick={() => { window.location.href = 'https://github.com/NobpasinTumdee/dashboard-honeypot' }}>
                  GitHub Repository
                </button>
                <button className="hero-btn hero-btn-secondary" onClick={() => { window.location.href = '/xss' }}>
                  Create Qr Code
                </button>
              </div>
            </div>

            <div className="hero-right">
              <div className="hero-illustration">
                <div className="hero-mockup">
                  <div className="hero-mockup-window">
                    <div className="hero-mockup-header">
                      <div className="hero-mockup-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                    <div className="hero-mockup-content">
                      <div className="hero-mockup-sidebar"></div>
                      <div className="hero-mockup-main">
                        <div className="hero-mockup-messages">
                          <div className="hero-mockup-message"></div>
                          <div className="hero-mockup-message"></div>
                          <div className="hero-mockup-message"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hero-character hero-character-1">
                  <div className="hero-character-body"></div>
                  <div className="hero-character-head"></div>
                </div>

                <div className="hero-character hero-character-2">
                  <div className="hero-character-body"></div>
                  <div className="hero-character-head"></div>
                </div>

                <div className="hero-floating-element hero-floating-1"></div>
                <div className="hero-floating-element hero-floating-2"></div>
                <div className="hero-floating-element hero-floating-3"></div>
              </div>
            </div>
          </div>

          {/* Animated Background Elements */}
          <div className="hero-stars">
            <div className="hero-star hero-star-1"></div>
            <div className="hero-star hero-star-2"></div>
            <div className="hero-star hero-star-3"></div>
            <div className="hero-star hero-star-4"></div>
            <div className="hero-star hero-star-5"></div>
            <div className="hero-star hero-star-6"></div>
          </div>

          <div className="hero-gradient-orbs">
            <div className="hero-orb hero-orb-1"></div>
            <div className="hero-orb hero-orb-2"></div>
            <div className="hero-orb hero-orb-3"></div>
          </div>
        </main>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', margin: '5% 0' }}>
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


        {/* Footer */}
        <footer className="hero-footer">
          <div className="hero-footer-content">
            <div className="hero-footer-main">
              <div className="hero-footer-brand">
                <div className="hero-footer-logo">
                  <svg xmlns="http://www.w3.org/2000/svg" className="hero-footer-logo-icon" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffffff"><path d="M520-600v-240h320v240H520ZM120-440v-400h320v400H120Zm400 320v-400h320v400H520Zm-400 0v-240h320v240H120Zm80-400h160v-240H200v240Zm400 320h160v-240H600v240Zm0-480h160v-80H600v80ZM200-200h160v-80H200v80Zm160-320Zm240-160Zm0 240ZM360-280Z" /></svg>
                </div>

                <div className="hero-footer-language">
                  <h4 className="hero-footer-section-title">Language</h4>
                  <select className="hero-footer-select">
                    <option>English</option>
                  </select>
                </div>

                <div className="hero-footer-social">
                  <h4 className="hero-footer-section-title">Social</h4>
                  <div className="hero-footer-social-links">
                    <a href="#" className="hero-footer-social-link">
                      {/* <Twitter className="hero-footer-social-icon" /> */}
                    </a>
                    <a href="#" className="hero-footer-social-link">
                    </a>
                    <a href="#" className="hero-footer-social-link">
                    </a>
                    <a href="#" className="hero-footer-social-link">
                    </a>
                  </div>
                </div>
              </div>

              <div className="hero-footer-links">
                <div className="hero-footer-column">
                  <h4 className="hero-footer-column-title">Product</h4>
                  <ul className="hero-footer-link-list">
                    <li><a href="#" className="hero-footer-link">Download</a></li>
                    <li><a href="#" className="hero-footer-link">Status</a></li>
                    <li><a href="#" className="hero-footer-link">App Directory</a></li>
                  </ul>
                </div>

                <div className="hero-footer-column">
                  <h4 className="hero-footer-column-title">Company</h4>
                  <ul className="hero-footer-link-list">
                    <li><a href="#" className="hero-footer-link">About</a></li>
                    <li><a href="#" className="hero-footer-link">Jobs</a></li>
                    <li><a href="#" className="hero-footer-link">Brand</a></li>
                    <li><a href="#" className="hero-footer-link">Newsroom</a></li>
                  </ul>
                </div>

                <div className="hero-footer-column">
                  <h4 className="hero-footer-column-title">Resources</h4>
                  <ul className="hero-footer-link-list">
                    <li><a href="#" className="hero-footer-link">College</a></li>
                    <li><a href="#" className="hero-footer-link">Support</a></li>
                    <li><a href="#" className="hero-footer-link">Safety</a></li>
                    <li><a href="#" className="hero-footer-link">Blog</a></li>
                    <li><a href="#" className="hero-footer-link">StreamKit</a></li>
                    <li><a href="#" className="hero-footer-link">Creators</a></li>
                    <li><a href="#" className="hero-footer-link">Community</a></li>
                    <li><a href="#" className="hero-footer-link">Developers</a></li>
                    <li><a href="#" className="hero-footer-link">Quests</a></li>
                    <li><a href="#" className="hero-footer-link">Official 3rd Party Merch</a></li>
                    <li><a href="#" className="hero-footer-link">Feedback</a></li>
                  </ul>
                </div>

                <div className="hero-footer-column">
                  <h4 className="hero-footer-column-title">Policies</h4>
                  <ul className="hero-footer-link-list">
                    <li><a href="#" className="hero-footer-link">Terms</a></li>
                    <li><a href="#" className="hero-footer-link">Privacy</a></li>
                    <li><a href="#" className="hero-footer-link">Cookie Settings</a></li>
                    <li><a href="#" className="hero-footer-link">Guidelines</a></li>
                    <li><a href="#" className="hero-footer-link">Acknowledgements</a></li>
                    <li><a href="#" className="hero-footer-link">Licenses</a></li>
                    <li><a href="#" className="hero-footer-link">Company Information</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>






    </>
  );
};

export default HeroPage;