import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css'; // New Premium CSS
import { FaRocket, FaChartLine, FaBolt, FaLayerGroup, FaTwitter, FaGithub, FaLinkedin, FaSun, FaMoon } from 'react-icons/fa'; // Icons
import officeTeamImg from '../assets/office_team.png';
import AuthModal from '../components/AuthModal';

const Landing = () => {
    const [scrolled, setScrolled] = useState(false);
    const [theme, setTheme] = useState('dark'); // 'dark' or 'light'
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const openAuthModal = (mode) => {
        setAuthMode(mode);
        setIsAuthModalOpen(true);
    };

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 50;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Simple Intersection Observer for fade-ins
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        const elements = document.querySelectorAll('.scroll-reveal');
        elements.forEach(el => observer.observe(el));

        return () => {
            window.removeEventListener('scroll', handleScroll);
            elements.forEach(el => observer.unobserve(el));
        };
    }, [scrolled]);

    return (
        <div className="landing-page" data-theme={theme}>

            {/* Navigation - Dynamic Scrolled Class */}
            <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
                <div className="landing-nav-content">
                    <div className="nav-logo">
                        <img src="/src/assets/logo.png" alt="Logo" style={{ width: '30px', height: '30px', marginRight: '8px' }} />
                        AgileFlow
                    </div>
                    <div className="nav-links">
                        <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme">
                            {theme === 'dark' ? <FaSun className="theme-icon" /> : <FaMoon className="theme-icon" />}
                        </button>
                        <button onClick={() => openAuthModal('login')} className="nav-link" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Log In</button>
                        <button onClick={() => openAuthModal('register')} className="nav-cta" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Get Started</button>
                    </div>
                </div>
            </nav>

            {/* Background Floating/Playing Shapes */}
            <div className="floating-shape shape-1"></div>
            <div className="floating-shape shape-2"></div>
            <div className="floating-shape shape-3"></div>
            <div className="floating-shape shape-4"></div>
            <div className="floating-shape shape-5"></div>
            <div className="floating-shape shape-6"></div>

            {/* Hero Section */}
            <main className="landing-hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Ship software <br />
                        <span className="highlight-text">at warp speed.</span>
                    </h1>
                    <p className="hero-subtitle">
                        The all-in-one workspace for high-performing engineering teams. Plan, build, and ship world-class software without the chaos.
                    </p>

                    <div className="hero-actions">
                        <button onClick={() => openAuthModal('register')} className="btn-primary-lg" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Start Building Free</button>
                        <a href="#features" className="btn-secondary-lg">See How It Works</a>
                    </div>


                </div>

                {/* Hero Visual - Living Workspace (Animated, Small, Transparent) */}
                <div className="hero-visual">
                    <div className="live-workspace">

                        {/* 1. Code Editor Window */}
                        <div className="workspace-window code-window">
                            <div className="window-header">
                                <div className="win-dot red"></div>
                                <div className="win-dot yellow"></div>
                                <div className="win-dot green"></div>
                                <span className="win-title">shipping.js</span>
                            </div>
                            <div className="code-content">
                                <div className="code-line"><span className="c-pink">const</span> <span className="c-blue">future</span> = <span className="c-yellow">await</span> build();</div>
                                <div className="code-line"><span className="c-blue">team</span>.<span className="c-func">deploy</span>(<span className="c-green">'production'</span>);</div>
                                <div className="code-line typing-cursor">_</div>
                            </div>
                        </div>

                        {/* 2. Floating Kanban Card */}
                        <div className="floating-card kanban-card">
                            <div className="card-header">
                                <span className="status-dot"></span> In Progress
                            </div>
                            <div className="card-title">AI Sprint Planning</div>
                            <div className="card-footer">
                                <div className="avatar-group">
                                    <div className="mini-avatar a1"></div>
                                    <div className="mini-avatar a2"></div>
                                </div>
                                <span className="card-id">AG-105</span>
                            </div>
                        </div>

                        {/* 3. Floating Success Toast */}
                        <div className="floating-card success-toast">
                            <div className="check-circle">✓</div>
                            <span>Deployed successfully</span>
                        </div>

                    </div>
                </div>
            </main>

            {/* Features Glassmorphism Section */}
            <section id="features" className="features-section">
                <div className="section-header">
                    <h2 className="section-title">Everything you need to build better</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Stop wrestling with complex tools. AgileFlow simply works.</p>
                </div>

                <div className="features-grid">
                    <div className="glass-card scroll-reveal">
                        <div className="feature-icon-wrapper"><FaLayerGroup /></div>
                        <h3 className="feature-title">Flexible Workflows</h3>
                        <p className="feature-desc">Customize your Scrum or Kanban boards with a drag-and-drop interface that feels like magic.</p>
                    </div>

                    <div className="glass-card scroll-reveal">
                        <div className="feature-icon-wrapper"><FaBolt /></div>
                        <h3 className="feature-title">Real-time Collab</h3>
                        <p className="feature-desc">See updates instantly. Comments, mentions, and notifications keep the whole team in sync.</p>
                    </div>

                    <div className="glass-card scroll-reveal">
                        <div className="feature-icon-wrapper"><FaChartLine /></div>
                        <h3 className="feature-title">Instant Insights</h3>
                        <p className="feature-desc">Unblock bottlenecks with zero-config burndown charts and velocity reports.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-col">
                        <div className="nav-logo">
                            <img src="/src/assets/logo.png" alt="Logo" style={{ width: '24px', height: '24px', marginRight: '8px' }} /> AgileFlow
                        </div>
                        <p className="footer-tagline">Built for developers, by developers.</p>
                        <div className="social-links">
                            <a href="#"><FaTwitter /></a>
                            <a href="#"><FaGithub /></a>
                            <a href="#"><FaLinkedin /></a>
                        </div>
                    </div>
                    <div className="footer-col">
                        <h4>Product</h4>
                        <a href="#">Features</a>
                        <a href="#">Pricing</a>
                        <a href="#">Enterprise</a>
                    </div>
                    <div className="footer-col">
                        <h4>Resources</h4>
                        <a href="#">Documentation</a>
                        <a href="#">API</a>
                        <a href="#">Community</a>
                    </div>
                    <div className="footer-col">
                        <h4>Company</h4>
                        <a href="#">About</a>
                        <a href="#">Careers</a>
                        <a href="#">Contact</a>
                    </div>
                </div>
                <div className="footer-bottom">
                    &copy; {new Date().getFullYear()} AgileFlow Inc. All rights reserved.
                </div>
            </footer>

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialMode={authMode}
            />

        </div>
    );
};

export default Landing;
