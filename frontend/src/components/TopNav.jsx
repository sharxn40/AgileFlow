import React, { useState } from 'react';
import { MdSearch, MdNotificationsNone, MdHelpOutline, MdExpandMore, MdMenu } from 'react-icons/md';
import NotificationBell from './NotificationBell';
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

    const toggleDropdown = (name) => {
        if (activeDropdown === name) {
            setActiveDropdown(null);
        } else {
            setActiveDropdown(name);
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
                <h2 className="current-view-title">
                    {currentView === 'overview' && 'Dashboard Overview'}
                    {currentView === 'board' && 'Kanban Board'}
                    {currentView === 'analytics' && 'Analytics & Reports'}
                    {currentView === 'backlog' && 'Sprint Backlog'}
                    {currentView === 'calendar' && 'Calendar'}
                </h2>
            </div>

            <div className="topnav-search-wrapper">
                <MdSearch className="search-icon" />
                <input
                    type="text"
                    className="topnav-search-input"
                    placeholder="Search tasks, projects, people..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <div className="topnav-actions">
                <div className="action-wrapper">
                    <button
                        className={`icon-btn ${activeDropdown === 'help' ? 'active' : ''}`}
                        title="Help"
                        onClick={() => toggleDropdown('help')}
                    >
                        <MdHelpOutline />
                    </button>
                    {activeDropdown === 'help' && (
                        <div className="dropdown-menu help-menu">
                            {helpLinks.map((link, i) => (
                                <a key={i} href={link.url} className="dropdown-item">{link.label}</a>
                            ))}
                        </div>
                    )}
                </div>

                <div className="action-wrapper">
                    <NotificationBell />
                </div>

                <div className="divider-vertical"></div>

                <div className="user-profile-trigger" onClick={onOpenProfile}>
                    <div className="user-avatar-small">
                        {user.picture ? (
                            <img src={user.picture} alt="profile" />
                        ) : (
                            <span>{user.username ? user.username.charAt(0).toUpperCase() : 'U'}</span>
                        )}
                    </div>
                    <span className="user-name">{user.username}</span>
                    <MdExpandMore className="dropdown-icon" />
                </div>
            </div>
        </header >
    );
};

export default TopNav;
