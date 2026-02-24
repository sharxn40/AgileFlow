import React from 'react';
import { FaChartPie, FaUsers, FaShieldAlt, FaCog, FaHistory, FaSignOutAlt, FaCreditCard } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminSidebar.css';

const AdminSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { path: '/admin', icon: <FaChartPie />, label: 'Dashboard' },
        { path: '/admin/users', icon: <FaUsers />, label: 'User Management' },
        { path: '/admin/payments', icon: <FaCreditCard />, label: 'Payments' },
        { path: '/admin/roles', icon: <FaShieldAlt />, label: 'Roles & Permissions' },
        { path: '/admin/logs', icon: <FaHistory />, label: 'Audit Logs' },
        { path: '/admin/settings', icon: <FaCog />, label: 'Settings' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/admin/login');
    };

    return (
        <div className="admin-sidebar">
            <div className="sidebar-header">
                <div className="logo-icon">A</div>
                <span className="logo-text">AgileFlow <span className="admin-badge">ADMIN</span></span>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <div
                        key={item.path}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                    >
                        <div className="nav-icon">{item.icon}</div>
                        <span className="nav-label">{item.label}</span>
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="nav-item logout" onClick={handleLogout}>
                    <div className="nav-icon"><FaSignOutAlt /></div>
                    <span className="nav-label">Logout</span>
                </div>
            </div>
        </div>
    );
};

export default AdminSidebar;
