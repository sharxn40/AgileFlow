import React, { useState } from 'react';
import { FaTimes, FaPlus, FaCheck } from 'react-icons/fa';
import './CreateTaskModal.css';

const PRIORITIES = ['High', 'Medium', 'Low'];
const COLORS = {
    'High': '#FF5630',
    'Medium': '#FFAB00',
    'Low': '#36B37E'
};

const CreateTaskModal = ({ isOpen, onClose, onCreate }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        title: '',
        tag: 'General',
        priority: 'Medium',
        assignee: 'Me'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePrioritySelect = (p) => {
        setFormData({ ...formData, priority: p });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        onCreate(formData);
        // Reset form slightly but keep some defaults
        setFormData({ title: '', tag: 'General', priority: 'Medium', assignee: 'Me' });
    };

    return (
        <div className="modal-overlay">
            <div className="create-task-modal">
                <div className="modal-header">
                    <h2><FaPlus style={{ marginRight: '10px', color: '#0052CC' }} /> New Issue</h2>
                    <button className="close-btn" onClick={onClose}><FaTimes /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label>Task Title</label>
                        <input
                            type="text"
                            name="title"
                            className="form-input"
                            placeholder="What needs to be done?"
                            value={formData.title}
                            onChange={handleChange}
                            autoFocus
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Type / Tag</label>
                            <input
                                type="text"
                                name="tag"
                                className="form-input"
                                placeholder="e.g. Frontend, Bug, Design"
                                value={formData.tag}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Assignee</label>
                            <input
                                type="text"
                                name="assignee"
                                className="form-input"
                                placeholder="Initials (e.g. JD)"
                                value={formData.assignee}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Priority</label>
                        <div className="priority-selector">
                            {PRIORITIES.map(p => (
                                <div
                                    key={p}
                                    className={`priority-option ${formData.priority === p ? 'selected' : ''}`}
                                    onClick={() => handlePrioritySelect(p)}
                                    style={{ borderColor: formData.priority === p ? COLORS[p] : 'transparent' }}
                                >
                                    <div className="dot" style={{ backgroundColor: COLORS[p] }}></div>
                                    <span>{p}</span>
                                    {formData.priority === p && <FaCheck className="check-icon" style={{ color: COLORS[p] }} />}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">Create Issue</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;
