import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheck, FaTrash, FaUser, FaTag, FaSave, FaAlignLeft } from 'react-icons/fa';
import './IssueDetailDrawer.css';
import CommentSection from './CommentSection';
import './IssueDetailDrawer.css';

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

    return (
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
                                <span className="item-label">Story Points</span>
                                <input
                                    type="number"
                                    className="drawer-input-sm"
                                    value={editedIssue.storyPoints || 0}
                                    onChange={e => setEditedIssue({ ...editedIssue, storyPoints: parseInt(e.target.value) })}
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
        </div>
    );
};

export default IssueDetailDrawer;
