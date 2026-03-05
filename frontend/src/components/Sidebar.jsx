import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { MdDashboard, MdTask, MdViewKanban, MdAnalytics, MdSettings, MdLogout, MdDashboard as MdDashIcon, MdAttachMoney } from 'react-icons/md';
import { FaHome, FaProjectDiagram, FaCalendarAlt, FaCog, FaSignOutAlt, FaLeaf, FaUsers } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ isOpen, currentView, onViewChange }) => {
    const navigate = useNavigate();
    const location = useLocation();

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

                // Removed bulk project/team fetches since they are now in the Registry Hub.

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
                <img src="/src/assets/logo.png" alt="AgileFlow Logo" className="logo-image" />
                <div>
                    <h2>AgileFlow</h2>
                    <div className="sidebar-header-subtitle">MARK III OS</div>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section-label">CORE OPERATIONS</div>



                <div
                    className={`nav-item ${currentView === 'overview' && location.pathname === '/dashboard' ? 'active' : ''}`}
                    onClick={() => handleNavigation('overview', '/dashboard')}
                    title="Command Center"
                >
                    <span className="nav-icon"><MdDashIcon /></span>
                    <span className="nav-label">Command Center</span>
                </div>



                <div
                    className={`nav-item ${currentView === 'timeline' && location.pathname === '/dashboard' ? 'active' : ''}`}
                    onClick={() => handleNavigation('timeline', '/dashboard')}
                    title="Tasks"
                >
                    <span className="nav-icon"><MdTask /></span>
                    <span className="nav-label">Tasks</span>
                </div>

                <div
                    className={`nav-item ${location.pathname === '/dashboard/calendar' ? 'active' : ''}`}
                    onClick={() => handleNavigation('calendar', '/dashboard/calendar')}
                    title="Scheduler"
                >
                    <span className="nav-icon"><FaCalendarAlt /></span>
                    <span className="nav-label">Scheduler</span>
                </div>

                <div
                    className={`nav-item ${location.pathname === '/dashboard/teams' ? 'active' : ''}`}
                    onClick={() => handleNavigation('teams', '/dashboard/teams')}
                    title="Registry"
                >
                    <span className="nav-icon"><FaUsers /></span>
                    <span className="nav-label">Registry</span>
                </div>

                <div
                    className={`nav-item ${currentView === 'analytics' && location.pathname === '/dashboard' ? 'active' : ''}`}
                    onClick={() => handleNavigation('analytics', '/dashboard')}
                    title="Tracker"
                >
                    <span className="nav-icon"><MdAnalytics /></span>
                    <span className="nav-label">Tracker</span>
                </div>

                <div
                    className={`nav-item ${location.pathname === '/dashboard/vault' ? 'active' : ''}`}
                    onClick={() => handleNavigation('vault', '/dashboard/vault')}
                    title="Vault"
                >
                    <span className="nav-icon"><MdAttachMoney /></span>
                    <span className="nav-label">Vault</span>
                </div>
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-profile-card">
                    <img
                        src={currentUser.picture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.username || 'U') + '&background=2a3455&color=fff'}
                        alt="Profile"
                        className="profile-card-avatar"
                    />
                    <div className="profile-card-info">
                        <div className="profile-card-name" title={currentUser.username}>{currentUser.username || 'User'}</div>
                        <div className="profile-card-role">{isAdmin ? 'SUPER_ADMIN' : 'USER'}</div>
                    </div>
                </div>

                <div className="logout-btn-container">
                    <button className="terminate-btn" onClick={handleLogout} title="Logout">
                        <MdLogout style={{ transform: 'rotate(180deg)' }} /> Terminate Session
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
