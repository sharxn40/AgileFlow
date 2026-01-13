import React from 'react';
import { FaTimes, FaCalendarAlt, FaFlag, FaUser, FaTag } from 'react-icons/fa';
import './TaskDetailModal.css';

const TaskDetailModal = ({ isOpen, onClose, task }) => {
    if (!isOpen || !task) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="task-detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{task.title}</h2>
                    <button className="close-btn" onClick={onClose}><FaTimes /></button>
                </div>

                <div className="modal-body">
                    <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <span className={`status-badge ${task.status.toLowerCase().replace(' ', '-')}`}>{task.status}</span>
                        <span className={`priority-tag ${task.priority.toLowerCase()}`}>{task.priority}</span>
                        <span className="tag" style={{ background: '#F4F5F7', color: '#5E6C84' }}>{task.project}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#42526E' }}>
                            <FaCalendarAlt />
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#6B778C' }}>Due Date</div>
                                <div style={{ fontWeight: '500' }}>{new Date(task.deadline).toLocaleString()}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#42526E' }}>
                            <FaFlag />
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#6B778C' }}>Priority</div>
                                <div style={{ fontWeight: '500' }}>{task.priority}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#42526E' }}>
                            <FaUser />
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#6B778C' }}>Assignee</div>
                                <div style={{ fontWeight: '500' }}>Alex Morgan</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#42526E' }}>
                            <FaTag />
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#6B778C' }}>Project</div>
                                <div style={{ fontWeight: '500' }}>{task.project}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ color: '#172B4D', marginBottom: '8px' }}>Description</h4>
                        <p style={{ color: '#42526E', lineHeight: '1.5' }}>
                            This is a placeholder description for the task. In a real application, this would fetch detailed content from the backend.
                            Currently tracking <b>{task.title}</b> under <b>{task.project}</b>.
                        </p>
                    </div>

                    <div className="modal-actions" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn-secondary" onClick={onClose}>Close</button>
                        <button className="btn-primary">Edit Task</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailModal;
