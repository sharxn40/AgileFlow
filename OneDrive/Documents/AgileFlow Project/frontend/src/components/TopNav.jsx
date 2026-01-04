import React, { useState, useEffect } from 'react';

import ProfileModal from './ProfileModal';

const TopNav = () => {
    const [user, setUser] = useState({ username: 'User', picture: '' });
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleUpdateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <header className="top-nav">
            <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input type="text" className="search-input" placeholder="Search projects, tickets, or people..." />
            </div>

            <div className="user-profile" onClick={() => setIsProfileOpen(true)}>
                <div className="user-avatar">
                    {user.picture ? (
                        <img src={user.picture} alt="profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                        user.username ? user.username.charAt(0).toUpperCase() : 'U'
                    )}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user.username}</span>
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
