import React, { useState } from 'react';
import { MdSearch, MdExpandMore, MdMenu, MdCalendarToday, MdAdd } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import CreateProjectModal from './dashboard/CreateProjectModal';
import './TopNav.css';

const TopNav = ({
    onToggleSidebar,
    searchTerm,
    onSearchChange,
    currentView = 'overview',
    onViewChange,
    user = { username: 'Guest' }, // Default prop
    onOpenProfile
}) => {
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
    const navigate = useNavigate();

    const toggleDropdown = (name) => {
        if (activeDropdown === name) {
            setActiveDropdown(null);
        } else {
            setActiveDropdown(name);
        }
    };

    const handleCreateProject = (newProject) => {
        setIsDeployModalOpen(false);
        // Dispatch event so Sidebar can refresh projects list if needed
        window.dispatchEvent(new Event('projectCreated'));
        if (newProject && newProject.id) {
            navigate(`/project/${newProject.id}/board`);
        }
    };

    const helpLinks = [
        { label: "Documentation", url: "#" },
        { label: "Keyboard Shortcuts", url: "#" },
        { label: "Contact Support", url: "#" }
    ];

    return (
        <header className="app-topnav">
            <div className="topnav-center-nav">
                <div className="topnav-breadcrumb">
                    <MdMenu
                        style={{ marginRight: '16px', fontSize: '1.4rem', cursor: 'pointer', color: '#172B4D' }}
                        onClick={onToggleSidebar}
                    />
                    OPERATIONAL INTEL
                </div>
            </div>

            <div className="topnav-search-wrapper">
                <MdSearch className="search-icon" />
                <input
                    type="text"
                    className="topnav-search-input"
                    placeholder="Deep Search... (⌘K)"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <div className="topnav-actions">
                <button className="deploy-btn" title="Create New Project" onClick={() => setIsDeployModalOpen(true)}>
                    <MdAdd style={{ fontSize: '1.2rem' }} /> DEPLOY
                </button>

                <div className="action-wrapper" style={{ marginLeft: '8px' }}>
                    <button className="icon-btn" title="Calendar">
                        <MdCalendarToday />
                    </button>
                </div>

                <div className="action-wrapper">
                    <NotificationBell />
                </div>

                <div className="divider-vertical"></div>

                <div className="user-profile-trigger" onClick={onOpenProfile}>
                    <div className="user-avatar-small">
                        <img
                            src={user.picture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.username || 'U') + '&background=2a3455&color=fff'}
                            alt="profile"
                        />
                    </div>
                    <div className="user-info-stack">
                        <span className="user-name">{user.username}</span>
                        <span className="user-role-mini">{user.role === 'admin' ? 'SUPER_ADMIN' : 'USER'}</span>
                    </div>
                    <MdExpandMore className="dropdown-icon" />
                </div>
            </div>

            <CreateProjectModal
                isOpen={isDeployModalOpen}
                onClose={() => setIsDeployModalOpen(false)}
                onCreate={handleCreateProject}
            />
        </header >
    );
};

export default TopNav;
