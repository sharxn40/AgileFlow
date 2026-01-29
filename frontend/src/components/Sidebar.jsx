import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { MdDashboard, MdTask, MdViewKanban, MdAnalytics, MdSettings, MdLogout, MdDashboard as MdDashIcon } from 'react-icons/md';
import { FaProjectDiagram, FaPlus, FaShieldAlt } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ isOpen, currentView, onViewChange }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [projects, setProjects] = useState([]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [currentUser, setCurrentUser] = useState(user);
    const isProjectLead = currentUser.role === 'project-lead';
    const isAdmin = currentUser.role === 'admin';

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                // Fetch Projects
                const projectsRes = await fetch('http://localhost:3000/api/projects', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (projectsRes.ok) {
                    setProjects(await projectsRes.json());
                }

                // Fetch Fresh Profile to ensure Role is up to date
                const profileRes = await fetch('http://localhost:3000/api/users/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (profileRes.ok) {
                    const profile = await profileRes.json();
                    console.log('Sidebar: Fetched Profile:', profile.username, profile.role); // DEBUG
                    setCurrentUser(profile);
                    // Update local storage to keep it in sync
                    localStorage.setItem('user', JSON.stringify(profile));
                }

            } catch (err) {
                console.error("Sidebar load failed", err);
            }
        };
        fetchUserData();
    }, []);

    console.log('Sidebar Render: Role=', currentUser.role, 'isProjectLead=', isProjectLead); // DEBUG

    const handleNavigation = (view, path) => {
        if (onViewChange) onViewChange(view);
        navigate(path);
    };

    return (
        <aside className={`app-sidebar ${!isOpen ? 'collapsed' : ''}`}>
            <div className="sidebar-header" onClick={() => handleNavigation('overview', '/dashboard')} style={{ cursor: 'pointer' }}>
                <img src="/src/assets/logo.png" alt="AgileFlow Logo" className="logo-image" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                <h2>AgileFlow</h2>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section-label">MENU</div>

                {isAdmin && (
                    <div
                        className={`nav-item ${location.pathname.includes('/admin') ? 'active' : ''}`}
                        onClick={() => handleNavigation('admin', '/admin')}
                        title="Admin Console"
                        style={{ cursor: 'pointer', marginBottom: '10px' }}
                    >
                        <span className="nav-icon" style={{ color: '#ef4444' }}><FaShieldAlt /></span>
                        <span className="nav-label" style={{ color: '#ef4444', fontWeight: 'bold' }}>Admin Console</span>
                    </div>
                )}

                {isProjectLead && (
                    <div
                        className={`nav-item ${location.pathname.includes('/project-lead') ? 'active' : ''}`}
                        onClick={() => handleNavigation('project-lead', '/dashboard/project-lead')}
                        title="Lead Console"
                        style={{ cursor: 'pointer', marginBottom: '10px' }}
                    >
                        <span className="nav-icon" style={{ color: '#0052CC' }}><FaProjectDiagram /></span>
                        <span className="nav-label" style={{ color: '#0052CC', fontWeight: 'bold' }}>Lead Console</span>
                    </div>
                )}

                <div
                    className={`nav-item ${currentView === 'overview' && location.pathname === '/dashboard' ? 'active' : ''}`}
                    onClick={() => handleNavigation('overview', '/dashboard')}
                    title="Overview"
                    style={{ cursor: 'pointer' }}
                >
                    <span className="nav-icon"><MdDashIcon /></span>
                    <span className="nav-label">Overview</span>
                </div>

                <div
                    className={`nav-item ${currentView === 'analytics' && location.pathname === '/dashboard' ? 'active' : ''}`}
                    onClick={() => handleNavigation('analytics', '/dashboard')}
                    title="Analytics"
                    style={{ cursor: 'pointer' }}
                >
                    <span className="nav-icon"><MdAnalytics /></span>
                    <span className="nav-label">Analytics</span>
                </div>

                <div
                    className={`nav-item ${currentView === 'backlog' && location.pathname === '/dashboard' ? 'active' : ''}`}
                    onClick={() => handleNavigation('backlog', '/dashboard')}
                    title="Sprints"
                    style={{ cursor: 'pointer' }}
                >
                    <span className="nav-icon"><MdViewKanban /></span>
                    <span className="nav-label">Sprints</span>
                </div>

                <div className="nav-section-label" style={{ marginTop: '20px' }}>PROJECTS</div>

                {projects.map(p => (
                    <NavLink
                        key={p.id}
                        to={`/project/${p.id}/board`}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        title={p.name}
                    >
                        <span className="nav-icon" style={{ fontSize: '0.8rem', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid currentColor' }}>
                            {p.key ? p.key.substring(0, 1) : 'P'}
                        </span>
                        <span className="nav-label">{p.name}</span>
                    </NavLink>
                ))}

                {projects.length === 0 && <div style={{ fontSize: '0.6rem', color: '#6B778C', textAlign: 'center', marginTop: 10 }}>-</div>}
            </nav>

            <div className="sidebar-footer">
                <button className="nav-item logout-btn" onClick={handleLogout} title="Logout">
                    <span className="nav-icon"><MdLogout /></span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
