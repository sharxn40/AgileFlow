import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-icon" style={{ transform: 'none' }}></div>
                AgileFlow
            </div>

            <nav className="sidebar-menu">
                <NavLink
                    to="/dashboard"
                    end
                    className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
                >
                    <span>📊</span> Your Work
                </NavLink>
                <NavLink
                    to="/dashboard/board"
                    className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
                >
                    <span>📋</span> Task Board
                </NavLink>
                <NavLink
                    to="/dashboard/sprint"
                    className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
                >
                    <span>🏃</span> Sprint Planning
                </NavLink>
                <NavLink
                    to="/dashboard/analytics"
                    className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
                >
                    <span>📈</span> Analytics
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <div className="menu-item" onClick={handleLogout}>
                    <span>🚪</span> Logout
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
