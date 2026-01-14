import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../index.css'; // Ensure animations are loaded
import taskBoardImg from '../assets/ui_task_board.png';
import sprintPlanImg from '../assets/ui_sprint_plan.png';
import analyticsDashImg from '../assets/ui_analytics_dash.png';

const Landing = () => {
    console.log('Landing component rendering');


    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.2 });

        const elements = document.querySelectorAll('.scroll-reveal');
        elements.forEach(el => observer.observe(el));

        return () => elements.forEach(el => observer.unobserve(el));
    }, []);

    return (
        <div className="landing-page">

            {/* Navigation */}
            <nav className="landing-nav">
                <div className="nav-logo">
                    <div className="logo-icon"></div>
                    AgileFlow
                </div>
                <div className="nav-links">
                    <Link to="/login" className="nav-link">Log In</Link>
                    <Link to="/register" className="nav-cta">Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="landing-hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Move fast, stay aligned, and <span className="highlight">build better.</span>
                    </h1>
                    <p className="hero-subtitle">
                        The #1 software development tool used by high-performing teams. Plan, track, and release world-class software.
                    </p>
                </div>

                {/* Animated Visual: "The Living Board" */}
                <div className="hero-visual">
                    <div className="board-mockup">
                        {/* Column 1: Todo */}
                        <div className="board-column">
                            <div className="column-header">To Do <span className="col-count">3</span></div>
                            <div className="task-card card-1">
                                <div className="card-tag red"></div>
                                <div className="card-text">Update Architecture</div>
                                <div className="card-meta">
                                    <span className="task-id">AG-101</span>
                                    <div className="avatar a1"></div>
                                </div>
                            </div>
                            <div className="task-card card-2">
                                <div className="card-tag blue"></div>
                                <div className="card-text">Design System</div>
                                <div className="card-meta">
                                    <span className="task-id">AG-102</span>
                                    <div className="avatar a2"></div>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: In Progress */}
                        <div className="board-column">
                            <div className="column-header">In Progress <span className="col-count">1</span></div>
                            <div className="task-card card-3 moving-card">
                                <div className="card-tag orange"></div>
                                <div className="card-text">Auth Integration</div>
                                <div className="card-lines">
                                    <div className="card-line long"></div>
                                    <div className="card-line short"></div>
                                </div>
                                <div className="card-meta">
                                    <span className="task-id">AG-105</span>
                                    <div className="avatar a3"></div>
                                </div>
                            </div>
                        </div>

                        {/* Column 3: Done */}
                        <div className="board-column">
                            <div className="column-header">Done <span className="col-count">12</span></div>
                            <div className="task-card card-4 completed-card">
                                <div className="card-tag green"></div>
                                <div className="card-text">Landing Page</div>
                                <div className="card-meta">
                                    <span className="task-id">AG-99</span>
                                    <div className="avatar a4"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating Elements */}
                    <div className="float-icon icon-1">🚀</div>
                    <div className="float-icon icon-2">✅</div>
                    <div className="float-icon icon-3">🔥</div>
                </div>
            </main>

            {/* About Section */}
            <section className="about-section">
                <div className="about-header">
                    <h2>Empowering Teams to <span className="highlight">Build Better</span></h2>
                    <p>AgileFlow brings your team's work together in one shared space. From planning to release, stay aligned and move fast.</p>
                </div>
                <div className="about-grid">
                    <div className="value-card">
                        <div className="value-icon">⚡</div>
                        <h3>Streamlined Workflows</h3>
                        <p>Customize your Scrum or Kanban boards to fit your team's unique style. No more rigid processes.</p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon">🤝</div>
                        <h3>Team Collaboration</h3>
                        <p>Real-time updates, comments, and mentions keep everyone in the loop, wherever they are.</p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon">📊</div>
                        <h3>Data-Driven Insights</h3>
                        <p>Unblock bottlenecks and track team velocity with powerful, built-in reporting tools.</p>
                    </div>
                </div>
            </section>


            {/* Visual Title Cards Section */}
            <section className="title-cards-section">
                <div className="title-header">
                    <h2>Experience the <span className="highlight">Power of Clarity</span></h2>
                </div>

                <div className="cards-container">
                    {/* Card 1: Tasks */}
                    <div className="feature-card scroll-reveal">
                        <div className="card-image">
                            <img src={taskBoardImg} alt="Task Board Interface" />
                        </div>
                        <div className="card-content">
                            <h3>Total Visibility</h3>
                            <p>Manage tasks with a stunning Kanban board.</p>
                        </div>
                    </div>

                    {/* Card 2: Sprint */}
                    <div className="feature-card scroll-reveal">
                        <div className="card-content">
                            <h3>Seamless Planning</h3>
                            <p>Drag, drop, and deploy sprints in minutes.</p>
                        </div>
                        <div className="card-image">
                            <img src={sprintPlanImg} alt="Sprint Planning Interface" />
                        </div>
                    </div>

                    {/* Card 3: Analytics */}
                    <div className="feature-card scroll-reveal">
                        <div className="card-image">
                            <img src={analyticsDashImg} alt="Analytics Dashboard" />
                        </div>
                        <div className="card-content">
                            <h3>Real-time Insights</h3>
                            <p>Data that drives decisions, instantly available.</p>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Landing;
