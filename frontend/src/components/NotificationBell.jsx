import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import './NotificationBell.css';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        const fetchNotifs = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await fetch('http://localhost:3000/api/notifications', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setNotifications(await res.json());
            } catch (e) { console.error(e); }
        };

        fetchNotifs();
        const interval = setInterval(fetchNotifs, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const markRead = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await fetch(`http://localhost:3000/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (e) { console.error(e); }
    };

    return (
        <div className="notif-wrapper">
            <div className="notif-icon-box" onClick={() => setShowDropdown(!showDropdown)}>
                <FaBell className="notif-bell" />
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </div>

            {showDropdown && (
                <div className="notif-dropdown">
                    <h4>Notifications</h4>
                    {notifications.length === 0 ? (
                        <p className="no-notifs">No notifications</p>
                    ) : (
                        notifications.map(n => (
                            <div key={n.id} className={`notif-item ${!n.isRead ? 'unread' : ''}`} onClick={() => {
                                markRead(n.id);
                                if (n.metadata && n.metadata.inviteUrl) {
                                    window.location.href = n.metadata.inviteUrl;
                                }
                            }}>
                                <p>{n.message}</p>
                                <span className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
