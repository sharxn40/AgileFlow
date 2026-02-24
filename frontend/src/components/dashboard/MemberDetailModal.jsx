import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { FaTimes, FaChartPie, FaCalendarAlt, FaTasks, FaExclamationTriangle } from 'react-icons/fa';
import TimelineView from './TimelineView';
import './MemberDetailModal.css';

const MemberDetailModal = ({ isOpen, onClose, userId, leadToken, onAssignTask }) => {
    const [activeTab, setActiveTab] = useState('tasks');
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && userId) {
            fetchDetails();
        }
    }, [isOpen, userId]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3000/api/project-lead/user-details/${userId}`, {
                headers: { 'Authorization': `Bearer ${leadToken}` }
            });
            if (res.ok) {
                setUserData(await res.json());
            }
        } catch (error) {
            console.error("Failed to load user details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTask = async (taskId, updates) => {
        try {
            await fetch(`http://localhost:3000/api/project-lead/tasks/${taskId}/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${leadToken}`
                },
                body: JSON.stringify(updates)
            });
            // Update local state
            setUserData(prev => ({
                ...prev,
                tasks: prev.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
            }));
        } catch (error) {
            console.error("Update failed", error);
        }
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="member-modal-overlay" onClick={onClose}>
            <div className="member-modal" onClick={e => e.stopPropagation()}>
                <div className="member-modal-header">
                    <div className="user-header-info">
                        <h2>{userData?.user?.username || 'Loading...'}</h2>
                        <span className="user-email">{userData?.user?.email}</span>
                    </div>
                    <div className="header-actions">
                        <button
                            className="assign-btn-sm"
                            onClick={() => onAssignTask(userData?.user?.email)}
                            disabled={!userData?.user?.email}
                        >
                            <FaTasks /> Assign Task
                        </button>
                        <button className="close-btn" onClick={onClose}><FaTimes /></button>
                    </div>
                </div>

                <div className="member-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tasks')}
                    >
                        <FaTasks /> Tasks
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
                        onClick={() => setActiveTab('timeline')}
                    >
                        <FaCalendarAlt /> Timeline
                    </button>
                </div>

                <div className="member-modal-body">
                    {loading ? (
                        <div className="loading-spinner">Loading data...</div>
                    ) : (
                        <>
                            {activeTab === 'tasks' && (
                                <div className="tasks-table-container">
                                    {userData?.tasks?.length > 0 ? (
                                        <table className="pl-data-table">
                                            <thead>
                                                <tr>
                                                    <th>Task</th>
                                                    <th>Status</th>
                                                    <th>Priority</th>
                                                    <th>Due Date</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {userData?.tasks?.map(task => (
                                                    <tr key={task.id}>
                                                        <td>{task.title}</td>
                                                        <td>
                                                            <span className={`status-badge-sm ${task.status.toLowerCase().replace(' ', '-')}`}>
                                                                {task.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <select
                                                                value={task.priority}
                                                                onChange={(e) => handleUpdateTask(task.id, { priority: e.target.value })}
                                                                className="table-select"
                                                            >
                                                                <option value="High">High</option>
                                                                <option value="Medium">Medium</option>
                                                                <option value="Low">Low</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="date"
                                                                value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                                                                onChange={(e) => handleUpdateTask(task.id, { dueDate: e.target.value })}
                                                                className="table-date-input"
                                                            />
                                                        </td>
                                                        <td></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="empty-tasks-state">
                                            <FaTasks style={{ fontSize: '2rem', marginBottom: '10px' }} />
                                            <p>No active tasks assigned.</p>
                                            <button
                                                className="assign-btn-sm"
                                                style={{ margin: '10px auto' }}
                                                onClick={() => onAssignTask(userData?.user?.email)}
                                            >
                                                + Assign First Task
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'timeline' && (
                                <div className="modal-timeline-wrapper">
                                    {userData?.tasks?.length > 0 ? (
                                        <TimelineView
                                            issues={userData.tasks}
                                            startDate={new Date()} // today
                                            endDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                                            readOnly={true}
                                        />
                                    ) : (
                                        <div className="empty-state">No scheduled tasks for timeline.</div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default MemberDetailModal;
