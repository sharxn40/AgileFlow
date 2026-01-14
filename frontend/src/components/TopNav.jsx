import React, { useState, useEffect } from 'react';
import { MdSearch, MdNotificationsNone, MdHelpOutline, MdExpandMore } from 'react-icons/md';
import ProfileModal from './ProfileModal';
import './TopNav.css';

const TopNav = () => {
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

    // Close dropdowns when clicking outside (handled by simple overlay or specialized hook, mostly overlay for now or just toggle)
    // For simplicity in this iteration, we rely on toggle.

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
            <div className="topnav-search-wrapper">
                <MdSearch className="search-icon" />
                <input
                    type="text"
                    className="topnav-search-input"
                    placeholder="Search tasks, projects, people..."
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
                    <button
                        className={`icon-btn ${activeDropdown === 'notifications' ? 'active' : ''}`}
                        title="Notifications"
                        onClick={() => toggleDropdown('notifications')}
                    >
                        <MdNotificationsNone />
                        <span className="notif-badge"></span>
                    </button>
                    {activeDropdown === 'notifications' && (
                        <div className="dropdown-menu notif-menu">
                            <div className="dropdown-header">Notifications</div>
                            {notifications.map(notif => (
                                <div key={notif.id} className={`dropdown-item notif-item ${notif.read ? '' : 'unread'}`}>
                                    <p>{notif.text}</p>
                                    <span>{notif.time}</span>
                                </div>
                            ))}
                            <div className="dropdown-footer">View All</div>
                        </div>
                    )}
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
