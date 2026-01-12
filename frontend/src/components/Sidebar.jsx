import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { MdDashboard, MdTask, MdViewKanban, MdAnalytics, MdSettings, MdLogout, MdBolt } from 'react-icons/md';
import './Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const navItems = [
        { path: '/dashboard', label: 'Overview', icon: <MdDashboard />, end: true },
        { path: '/dashboard/board', label: 'Kanban Board', icon: <MdViewKanban /> },
        { path: '/dashboard/sprint', label: 'Sprint', icon: <MdBolt /> }, // Sprint
        { path: '/dashboard/analytics', label: 'Analytics', icon: <MdAnalytics /> },
        { path: '/dashboard/settings', label: 'Settings', icon: <MdSettings /> },
    ];

    return (
        <aside className="app-sidebar">
            <div className="sidebar-header">
                <div className="logo-icon"></div>
                <h2>AgileFlow</h2>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section-label">MENU</div>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="nav-item logout-btn" onClick={handleLogout}>
                    <span className="nav-icon"><MdLogout /></span>
                    <span className="nav-label">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
