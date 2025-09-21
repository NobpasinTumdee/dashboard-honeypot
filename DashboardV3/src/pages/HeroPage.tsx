import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
// import mc1 from '../assets/mc/MC4-Photoroom.png'
// import mc2 from '../assets/mc/MC3-Photoroom.png'

import { useTranslation } from 'react-i18next';
import '../i18n';

const HeroPage: React.FC = () => {
  // TypeScript จะรู้จักประเภทข้อมูลของ t และ i18n โดยอัตโนมัติ
  const { t, i18n } = useTranslation();

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };
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
              <span className="hero-logo-text">{t('title2')}</span>
            </div>

            <div className="hero-nav-links">
              <Link to="/home" className="hero-nav-link">{t('sidebar_munu_title2')}</Link>
              <Link to="/home/cowrie" className="hero-nav-link">{t('sidebar_munu_title3')}</Link>
              <Link to="/home/open-canary" className="hero-nav-link">{t('sidebar_munu_title4')}</Link>
              <Link to="/home/wireshark" className="hero-nav-link">{t('sidebar_munu_title5')}</Link>
              <Link to="/home/users" className="hero-nav-link">{t('sidebar_munu_title6')}</Link>
              <Link to="/document" className="hero-nav-link">{t('sidebar_munu_title7')}</Link>
              <ThemeToggle />
              <div className="hero-lang-toggle" style={{ cursor: 'pointer' }}>
                <span className="hero-lang-toggle-text" onClick={() => i18n.language === 'en' ? i18n.changeLanguage('th') : i18n.changeLanguage('en')}>
                  {i18n.language === 'en' ? 'TH' : 'EN'}
                </span>
              </div>
            </div>

            <button className="hero-open-btn">
              <Link to="/home/login" style={{ textDecoration: 'none', color: 'inherit' }}>{t('login_button')}</Link>
            </button>
          </div>
        </nav>

        {/* Hero Content {t('')} */}
        <main className="hero-main">
          <div className="hero-content">
            <div className="hero-left">
              <h1 className="hero-title-new">
                <span className="hero-title-new-line">{t('title1')}</span>
                <span className="hero-title-new-line">{t('title2')}</span>
                <span className="hero-title-new-line">{t('title3')}</span>
              </h1>

              <p className="hero-description">
                {t('description')}
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
            <div className="hero-star hero-star-7"></div>
            <div className="hero-star hero-star-8"></div>
            <div className="hero-star hero-star-9"></div>
            <div className="hero-star hero-star-10"></div>
            <div className="hero-star hero-star-11"></div>
            <div className="hero-star hero-star-12"></div>
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
              <h3 className="hero-feature-title">{t('section1_title')}</h3>
              <p className="hero-feature-description">
                {t('section1_desc')}
              </p>
            </div>

            <div className="hero-feature">
              <div className="hero-feature-icon">🛡️</div>
              <h3 className="hero-feature-title">{t('section2_title')}</h3>
              <p className="hero-feature-description">
                {t('section2_desc')}
              </p>
            </div>

            <div className="hero-feature">
              <div className="hero-feature-icon">⚡</div>
              <h3 className="hero-feature-title">{t('section3_title')}</h3>
              <p className="hero-feature-description">
                {t('section3_desc')}
              </p>
            </div>

            <div className="hero-feature">
              <div className="hero-feature-icon">🤖</div>
              <h3 className="hero-feature-title">{t('section4_title')}</h3>
              <p className="hero-feature-description">
                {t('section4_desc')}
              </p>
            </div>

            <div className="hero-feature">
              <div className="hero-feature-icon">📚</div>
              <h3 className="hero-feature-title">{t('section5_title')}</h3>
              <p className="hero-feature-description">
                {t('section5_desc')}
              </p>
            </div>

            <div className="hero-feature">
              <div className="hero-feature-icon">✨</div>
              <h3 className="hero-feature-title">{t('section6_title')}</h3>
              <p className="hero-feature-description">
                {t('section6_desc')}
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
                  <h4 className="hero-footer-section-title">{t('footer_Language')}</h4>
                  <h4 className="hero-footer-section-title">{t('welcome_message')}</h4>
                  <select
                    className="hero-footer-select"
                    onChange={changeLanguage}
                    value={i18n.language}
                  >
                    <option value="en">English</option>
                    <option value="th">ภาษาไทย</option>
                    <option value="ja">日本語</option>
                    <option value="zh">中文</option>
                    <option value="ko">한국어</option>
                    <option value="fr">Français</option>
                    <option value="cat">Cat 😸</option>
                  </select>
                </div>

                <div className="hero-footer-social">
                  <h4 className="hero-footer-section-title">{t('footer_Social')}</h4>
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
                  <h4 className="hero-footer-column-title">{t('footer_Product')}</h4>
                  <ul className="hero-footer-link-list">
                    <li><a href="#" className="hero-footer-link">{t('footer_Download')}</a></li>
                    <li><a href="#" className="hero-footer-link">{t('footer_Status')}</a></li>
                    <li><a href="#" className="hero-footer-link">{t('footer_App_Directory')}</a></li>
                  </ul>
                </div>

                <div className="hero-footer-column">
                  <h4 className="hero-footer-column-title">{t('footer_Company')}</h4>
                  <ul className="hero-footer-link-list">
                    <li><a href="#" className="hero-footer-link">{t('footer_About')}</a></li>
                    <li><a href="#" className="hero-footer-link">{t('footer_Jobs')}</a></li>
                    <li><a href="#" className="hero-footer-link">{t('footer_Brand')}</a></li>
                    <li><a href="#" className="hero-footer-link">{t('footer_Newsroom')}</a></li>
                  </ul>
                </div>

                <div className="hero-footer-column">
                  <h4 className="hero-footer-column-title">{t('footer_Resources')}</h4>
                  <ul className="hero-footer-link-list">
                    <li><a href="#" className="hero-footer-link">{t('footer_College')}</a></li>
                    <li><a href="#" className="hero-footer-link">{t('footer_Support')}</a></li>
                    <li><a href="#" className="hero-footer-link">{t('footer_Safety')}</a></li>
                    <li><a href="#" className="hero-footer-link">{t('footer_Blog')}</a></li>
                    <li><a href="#" className="hero-footer-link">{t('footer_StreamKit')}</a></li>
                    <li><a href="#" className="hero-footer-link">{t('footer_Creators')}</a></li>
                    <li><a href="#" className="hero-footer-link">{t('footer_Community')}</a></li>
                    <li><a href="#" className="hero-footer-link">{t('footer_Developers')}</a></li>
                    <li><a href="#" className="hero-footer-link">{t('footer_Quests')}</a></li>
                    <li><a href="#" className="hero-footer-link">{t('footer_Official_3rd_Party_Merch')}</a></li>
                    <li><a href="#" className="hero-footer-link">{t('footer_Feedback')}</a></li>
                  </ul>
                </div>

                <div className="hero-footer-column">
                  <h4 className="hero-footer-column-title">{t('footer_Policies')}</h4>
                  <ul className="hero-footer-link-list">
                    <li><a href="#" className="hero-footer-link">{t('footer_Terms')}</a></li>
                    <li><a href="#" className="hero-footer-link">{t('footer_Privacy')}</a></li>
                    <li><a href="#" className="hero-footer-link">{t('footer_Cookie_Settings')}</a></li>
                    <li><a href="#" className="hero-footer-link">{t('footer_Guidelines')}</a></li>
                    <li><a href="#" className="hero-footer-link">{t('footer_Acknowledgements')}</a></li>
                    <li><a href="#" className="hero-footer-link">{t('footer_Licenses')}</a></li>
                    <li><a href="#" className="hero-footer-link">{t('footer_Company_Information')}</a></li>
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