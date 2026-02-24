import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { MdDashboard, MdTask, MdViewKanban, MdAnalytics, MdSettings, MdLogout, MdDashboard as MdDashIcon, MdAttachMoney } from 'react-icons/md';
import { FaHome, FaProjectDiagram, FaCalendarAlt, FaCog, FaSignOutAlt, FaLeaf, FaUsers } from 'react-icons/fa';
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
                    className={`nav-item ${location.pathname === '/dashboard/teams' ? 'active' : ''}`}
                    onClick={() => handleNavigation('teams', '/dashboard/teams')}
                    title="Teams"
                    style={{ cursor: 'pointer' }}
                >
                    <span className="nav-icon"><FaUsers /></span>
                    <span className="nav-label">Teams</span>
                </div>

                <div
                    className={`nav-item ${location.pathname === '/dashboard/earnings' ? 'active' : ''}`}
                    onClick={() => handleNavigation('earnings', '/dashboard/earnings')}
                    title="My Earnings"
                    style={{ cursor: 'pointer' }}
                >
                    <span className="nav-icon"><MdAttachMoney /></span>
                    <span className="nav-label">My Earnings</span>
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
                    className={`nav-item ${location.pathname === '/dashboard/calendar' ? 'active' : ''}`}
                    onClick={() => handleNavigation('calendar', '/dashboard/calendar')}
                    title="Calendar"
                    style={{ cursor: 'pointer' }}
                >
                    <span className="nav-icon"><FaCalendarAlt /></span>
                    <span className="nav-label">Calendar</span>
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

                <div
                    className={`nav-item ${currentView === 'timeline' && location.pathname === '/dashboard' ? 'active' : ''}`}
                    onClick={() => handleNavigation('timeline', '/dashboard')}
                    title="Timeline"
                    style={{ cursor: 'pointer' }}
                >
                    <span className="nav-icon"><MdDashboard /></span>
                    <span className="nav-label">Timeline</span>
                </div>



                <div className="nav-section-label" style={{ marginTop: '20px' }}>PROJECTS</div>

                {projects.map(p => {
                    const isActiveProject = location.pathname.startsWith(`/project/${p.id}`);
                    return (
                        <div key={p.id} className="project-group">
                            <NavLink
                                to={`/project/${p.id}/board`}
                                className={({ isActive }) => `nav-item project-link ${isActiveProject ? 'active' : ''}`}
                                title={p.name}
                            >
                                <span className="nav-icon" style={{ fontSize: '0.8rem', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid currentColor' }}>
                                    {p.key ? p.key.substring(0, 1) : 'P'}
                                </span>
                                <span className="nav-label">{p.name}</span>
                            </NavLink>

                            {isActiveProject && (
                                <div className="project-sub-nav">
                                    <NavLink to={`/project/${p.id}/board`} className={({ isActive }) => `sub-item ${isActive ? 'active' : ''}`}>
                                        <span className="sub-icon"><MdViewKanban /></span>
                                        <span className="sub-label">Board</span>
                                    </NavLink>
                                    <NavLink to={`/project/${p.id}/backlog`} className={({ isActive }) => `sub-item ${isActive ? 'active' : ''}`}>
                                        <span className="sub-icon"><MdTask /></span>
                                        <span className="sub-label">Backlog</span>
                                    </NavLink>
                                    <NavLink to={`/project/${p.id}/settings`} className={({ isActive }) => `sub-item ${isActive ? 'active' : ''}`}>
                                        <span className="sub-icon"><MdSettings /></span>
                                        <span className="sub-label">Settings</span>
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    );
                })}

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
