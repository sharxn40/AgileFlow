import API_BASE_URL from '../config.js';
import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import './NotificationBell.css';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [toastQueue, setToastQueue] = useState([]); // Store transient toast alerts

    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        let lastNotifsMap = new Map();

        const fetchNotifs = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await fetch(`${API_BASE_URL}/api/notifications`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const fetched = await res.json();

                    // Check for new, unseen notifications to trigger a toast
                    if (lastNotifsMap.size > 0) {
                        const newNotifs = fetched.filter(n => !n.isRead && !lastNotifsMap.has(n.id));
                        if (newNotifs.length > 0) {
                            setToastQueue(prev => [...prev, ...newNotifs]);

                            // Auto-remove toasts after 5 seconds
                            newNotifs.forEach(n => {
                                setTimeout(() => {
                                    setToastQueue(current => current.filter(t => t.id !== n.id));
                                }, 5000);
                            });
                        }
                    }

                    // Update memory maps
                    lastNotifsMap = new Map(fetched.map(n => [n.id, n]));
                    setNotifications(fetched);
                }
            } catch (e) { console.error(e); }
        };

        fetchNotifs();
        const interval = setInterval(fetchNotifs, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const markRead = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
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

            {/* Global Toasts Container - Rendered absolutely */}
            <div className="notif-toast-container">
                {toastQueue.map((toast) => (
                    <div key={toast.id} className="notif-toast slide-in-right">
                        <div className="notif-toast-icon">
                            <FaBell />
                        </div>
                        <div className="notif-toast-content">
                            <strong>New Alert</strong>
                            <p>{toast.message}</p>
                        </div>
                        <button className="notif-toast-close" onClick={() => setToastQueue(q => q.filter(t => t.id !== toast.id))}>
                            &times;
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationBell;


