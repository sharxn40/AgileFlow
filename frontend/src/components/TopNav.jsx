import React, { useState, useEffect } from 'react';
import { MdSearch, MdNotificationsNone, MdHelpOutline, MdExpandMore, MdMenu } from 'react-icons/md';
import ProfileModal from './ProfileModal';
import NotificationBell from './NotificationBell';
import './TopNav.css';

const TopNav = ({ onToggleSidebar, searchTerm, onSearchChange, currentView = 'overview', onViewChange }) => {
    const [user, setUser] = useState({ username: 'User', picture: '' });
    const [activeDropdown, setActiveDropdown] = useState(null); // 'help', 'notifications', or null
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            // Seed a realistic initial user for the "Original Site Look"
            const initialUser = {
                username: 'Alex Morgan',
                title: 'Senior Product Designer',
                email: 'alex.morgan@agileflow.team',
                bio: 'Passionate about creating intuitive user experiences and clean functional interfaces. Based in San Francisco.',
                picture: '', // Empty initially, user can upload
                banner: '',
                location: 'San Francisco, CA',
                joinDate: 'Joined January 2024'
            };
            setUser(initialUser);
            localStorage.setItem('user', JSON.stringify(initialUser));
        }
    }, []);

    const handleUpdateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const toggleDropdown = (name) => {
        if (activeDropdown === name) {
            setActiveDropdown(null);
        } else {
            setActiveDropdown(name);
        }
    };

    const notifications = [
        { id: 1, text: "Task 'Design System' is overdue", time: "2m ago", read: false },
        { id: 2, text: "New comment from Sarah", time: "1h ago", read: true },
        { id: 3, text: "Project 'Alpha' created", time: "5h ago", read: true }
    ];

    const helpLinks = [
        { label: "Documentation", url: "#" },
        { label: "Keyboard Shortcuts", url: "#" },
        { label: "Contact Support", url: "#" }
    ];

    return (
        <header className="app-topnav">
            <div className="topnav-center-nav">
                <button
                    className={`nav-pill ${currentView === 'overview' ? 'active' : ''}`}
                    onClick={() => onViewChange && onViewChange('overview')}
                >
                    Overview
                </button>
                <button
                    className={`nav-pill ${currentView === 'board' ? 'active' : ''}`}
                    onClick={() => onViewChange && onViewChange('board')}
                >
                    Board
                </button>
                <button
                    className={`nav-pill ${currentView === 'analytics' ? 'active' : ''}`}
                    onClick={() => onViewChange && onViewChange('analytics')}
                >
                    Analytics
                </button>
                <button
                    className={`nav-pill ${currentView === 'backlog' ? 'active' : ''}`}
                    onClick={() => onViewChange && onViewChange('backlog')}
                >
                    Sprints
                </button>
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

                <div className="user-profile-trigger" onClick={() => setIsProfileOpen(true)}>
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

            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={user}
                onUpdateUser={handleUpdateUser}
            />
        </header>
    );
};

export default TopNav;
