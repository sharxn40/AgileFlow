import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM
import { FaTimes, FaCheck, FaTrash, FaUser, FaTag, FaSave, FaAlignLeft, FaClock, FaList } from 'react-icons/fa';
import './IssueDetailDrawer.css';
import CommentSection from './CommentSection';
import { getDeadlineStatus, formatCountdown, getStatusColor } from '../../utils/deadlineUtils';

const IssueDetailDrawer = ({ issue, isOpen, onClose, onUpdate }) => {
    const [editedIssue, setEditedIssue] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (issue) {
            setEditedIssue({ ...issue });
        }
    }, [issue]);

    if (!isOpen || !editedIssue) return null;

    const handleSave = async () => {
        setLoading(true);
        // Simulate API call for now or pass up to parent
        // await updateIssue(editedIssue);
        onUpdate(editedIssue);
        setLoading(false);
        onClose();
    };

    // Derived Status for Visuals
    const deadlineStatus = getDeadlineStatus(editedIssue.dueDate);
    const deadlineColor = getStatusColor(deadlineStatus);
    const deadlineText = formatCountdown(editedIssue.dueDate);

    // Use Portal to render at document.body level
    return ReactDOM.createPortal(
        <div className={`issue-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className="issue-drawer" onClick={e => e.stopPropagation()}>
                <div className="drawer-header">
                    <div className="drawer-title-group">
                        <span className="drawer-key">{editedIssue.issueId || 'TASK'}</span>
                        <select
                            className={`status-select ${editedIssue.status?.toLowerCase().replace(' ', '-')}`}
                            value={editedIssue.status}
                            onChange={e => setEditedIssue({ ...editedIssue, status: e.target.value })}
                        >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                        </select>
                    </div>
                    <button className="close-btn" onClick={onClose}><FaTimes /></button>
                </div>

                {/* Deadline Alert Banner (New Feature Integration) */}
                {editedIssue.dueDate && deadlineStatus !== 'safe' && deadlineStatus !== 'none' && editedIssue.status !== 'Done' && (
                    <div className="deadline-banner" style={{ backgroundColor: deadlineColor, color: 'white' }}>
                        <FaClock />
                        <span style={{ fontWeight: 600 }}>Deadline Alert:</span> {deadlineText}
                    </div>
                )}

                <div className="drawer-content">
                    <div className="drawer-main">
                        <input
                            className="drawer-input-title"
                            value={editedIssue.title}
                            onChange={e => setEditedIssue({ ...editedIssue, title: e.target.value })}
                        />

                        <div className="drawer-section">
                            <label className="drawer-label"><FaAlignLeft /> Description</label>
                            <textarea
                                className="drawer-textarea"
                                placeholder="Add a description..."
                                value={editedIssue.description || ''}
                                onChange={e => setEditedIssue({ ...editedIssue, description: e.target.value })}
                            />
                        </div>

                        <div className="drawer-section">
                            <label className="drawer-label"><FaList /> Scope & Subtasks</label>
                            <div className="subtasks-container">
                                {/* Progress Bar */}
                                {editedIssue.subtasks && editedIssue.subtasks.length > 0 && (
                                    <div className="subtask-progress">
                                        <div className="progress-bar-bg">
                                            <div
                                                className="progress-bar-fill"
                                                style={{ width: `${(editedIssue.subtasks.filter(t => t.done).length / editedIssue.subtasks.length) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="progress-text">
                                            {Math.round((editedIssue.subtasks.filter(t => t.done).length / editedIssue.subtasks.length) * 100)}% Complete
                                        </span>
                                    </div>
                                )}

                                {/* Subtask List */}
                                <div className="subtask-list">
                                    {(editedIssue.subtasks || []).map((task, index) => (
                                        <div key={index} className="subtask-item">
                                            <input
                                                type="checkbox"
                                                checked={task.done}
                                                onChange={() => {
                                                    const newSubtasks = [...editedIssue.subtasks];
                                                    newSubtasks[index].done = !newSubtasks[index].done;
                                                    setEditedIssue({ ...editedIssue, subtasks: newSubtasks });
                                                }}
                                                className="subtask-checkbox"
                                            />
                                            <input
                                                type="text"
                                                value={task.title}
                                                onChange={(e) => {
                                                    const newSubtasks = [...editedIssue.subtasks];
                                                    newSubtasks[index].title = e.target.value;
                                                    setEditedIssue({ ...editedIssue, subtasks: newSubtasks });
                                                }}
                                                className={`subtask-input ${task.done ? 'completed' : ''}`}
                                            />
                                            <button
                                                className="delete-subtask-btn"
                                                onClick={() => {
                                                    const newSubtasks = editedIssue.subtasks.filter((_, i) => i !== index);
                                                    setEditedIssue({ ...editedIssue, subtasks: newSubtasks });
                                                }}
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Add New Subtask */}
                                <div className="add-subtask-wrapper">
                                    <input
                                        type="text"
                                        placeholder="Add a step (e.g. 'Design Database Schema')"
                                        className="add-subtask-input"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && e.target.value.trim()) {
                                                const newSubtask = { title: e.target.value, done: false };
                                                setEditedIssue({
                                                    ...editedIssue,
                                                    subtasks: [...(editedIssue.subtasks || []), newSubtask]
                                                });
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                    <small style={{ color: '#6B778C', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>Press Enter to add items</small>
                                </div>
                            </div>
                        </div>

                        <CommentSection
                            issueId={editedIssue.id || editedIssue._id}
                            comments={editedIssue.comments}
                            onAddComment={(comment) => setEditedIssue(prev => ({ ...prev, comments: [...(prev.comments || []), comment] }))}
                        />
                    </div>

                    <div className="drawer-sidebar">
                        <div className="sidebar-group">
                            <label className="sidebar-label">Details</label>

                            <div className="sidebar-item">
                                <span className="item-label">Assignee</span>
                                <div className="user-badge">
                                    <FaUser /> {editedIssue.assigneeId || 'Unassigned'}
                                </div>
                            </div>

                            <div className="sidebar-item">
                                <span className="item-label">Priority</span>
                                <select
                                    className="drawer-select"
                                    value={editedIssue.priority}
                                    onChange={e => setEditedIssue({ ...editedIssue, priority: e.target.value })}
                                >
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>

                            <div className="sidebar-item">
                                <span className="item-label">Due Date</span>
                                <input
                                    type="date"
                                    className="drawer-input-sm"
                                    value={editedIssue.dueDate ? new Date(editedIssue.dueDate).toISOString().split('T')[0] : ''}
                                    onChange={e => setEditedIssue({ ...editedIssue, dueDate: e.target.value })}
                                    style={{
                                        borderColor: deadlineStatus === 'critical' || deadlineStatus === 'overdue' ? '#DE350B' : '#DFE1E6',
                                        color: deadlineStatus === 'critical' || deadlineStatus === 'overdue' ? '#DE350B' : 'inherit',
                                        fontWeight: deadlineStatus === 'critical' || deadlineStatus === 'overdue' ? '700' : 'normal'
                                    }}
                                />
                                {editedIssue.dueDate && (
                                    <div style={{ fontSize: '0.8rem', marginTop: '4px', color: deadlineColor }}>
                                        {deadlineText}
                                    </div>
                                )}
                            </div>

                            <div className="sidebar-item">
                                <span className="item-label">Story Points</span>
                                <input
                                    type="number"
                                    className="drawer-input-sm"
                                    value={editedIssue.storyPoints || 0}
                                    onChange={e => setEditedIssue({ ...editedIssue, storyPoints: parseInt(e.target.value) })}
                                />
                            </div>

                            <div className="sidebar-item">
                                <span className="item-label">Payment ($)</span>
                                <input
                                    type="number"
                                    className="drawer-input-sm"
                                    value={editedIssue.paymentAmount || 0}
                                    onChange={e => setEditedIssue({ ...editedIssue, paymentAmount: parseFloat(e.target.value) })}
                                    style={{ fontWeight: 'bold', color: '#00875A' }}
                                />
                            </div>
                        </div>

                        <div className="drawer-actions">
                            <button className="btn-save" onClick={handleSave} disabled={loading}>
                                {loading ? 'Saving...' : <><FaSave /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body // Portal Target
    );
};

export default IssueDetailDrawer;
