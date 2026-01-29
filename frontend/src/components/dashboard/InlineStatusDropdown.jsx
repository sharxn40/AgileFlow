import React, { useState, useRef, useEffect } from 'react';
import './InlineStatusDropdown.css';

const InlineStatusDropdown = ({ issue, onStatusChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const statuses = ['To Do', 'In Progress', 'Review', 'Done'];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = async (e, newStatus) => {
        e.stopPropagation(); // Prevent opening drawer
        if (newStatus === issue.status) {
            setIsOpen(false);
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/api/issues/${issue.id || issue._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                onStatusChange(issue.id, newStatus);
            }
        } catch (error) {
            console.error("Failed to update status", error);
        } finally {
            setLoading(false);
            setIsOpen(false);
        }
    };

    return (
        <div className="inline-status-container" ref={dropdownRef} onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}>
            <span className={`status-badge ${issue.status?.replace(' ', '-').toLowerCase()} ${loading ? 'loading' : ''}`}>
                {loading ? '...' : issue.status}
            </span>

            {isOpen && (
                <div className="status-menu">
                    {statuses.map(s => (
                        <div
                            key={s}
                            className={`status-option ${s === issue.status ? 'active' : ''}`}
                            onClick={(e) => handleSelect(e, s)}
                        >
                            <span className={`status-dot ${s.replace(' ', '-').toLowerCase()}`}></span>
                            {s}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InlineStatusDropdown;
