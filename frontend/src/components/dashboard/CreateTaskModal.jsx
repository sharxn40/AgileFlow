import React, { useState } from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM
import { FaTimes, FaPlus, FaCheck } from 'react-icons/fa';
import './CreateTaskModal.css';

const PRIORITIES = ['High', 'Medium', 'Low'];
const COLORS = {
    'High': '#FF5630',
    'Medium': '#FFAB00',
    'Low': '#36B37E'
};

const CreateTaskModal = ({ isOpen, onClose, onCreate, projects = [], initialDate, initialAssignee = '' }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        title: '',
        tag: '',
        priority: 'Medium',
        assignee: initialAssignee,
        projectId: projects.length > 0 ? projects[0].id : '',
        dueDate: initialDate ? initialDate.toISOString().split('T')[0] : '',
        storyPoints: 0,
        paymentAmount: 0
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePrioritySelect = (p) => {
        setFormData({ ...formData, priority: p });
    };

    const [error, setError] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.title.trim()) {
            setError('Task Title is required');
            return;
        }

        if (projects.length > 0 && !formData.projectId) {
            setError('Please select a project');
            return;
        }

        // Date Validation
        if (formData.dueDate) {
            const selectedDate = new Date(formData.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                setError('Due Date cannot be in the past');
                return;
            }
        }

        // Assignee Email Validation
        if (formData.assignee && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.assignee)) {
            setError('Invalid email format for Assignee');
            return;
        }

        onCreate(formData);

        setFormData({
            title: '',
            tag: '',
            priority: 'Medium',
            assignee: '',
            projectId: projects.length > 0 ? projects[0].id : '',
            dueDate: '',
            storyPoints: 0,
            paymentAmount: 0
        });
    };

    // Use Portal to render at document.body level, bypassing parent stacking contexts
    return ReactDOM.createPortal(
        <div className="modal-overlay">
            <div className="create-task-modal">
                <div className="modal-header">
                    <h2><FaPlus style={{ marginRight: '10px', color: '#0052CC' }} /> New Issue</h2>
                    <button className="close-btn" onClick={onClose}><FaTimes /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    {error && <div style={{ background: '#FFEBE6', color: '#BF2600', padding: '10px', borderRadius: '4px', fontSize: '0.9rem' }}>{error}</div>}
                    {projects.length > 0 && (
                        <div className="form-group">
                            <label>Project</label>
                            <select
                                name="projectId"
                                className="form-input"
                                value={formData.projectId}
                                onChange={handleChange}
                            >
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Task Title</label>
                        <input
                            type="text"
                            name="title"
                            className="form-input"
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
                                value={formData.assignee}
                                onChange={handleChange}
                                placeholder="Assignee Email (e.g. user@test.com)"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Due Date</label>
                        <input
                            type="date"
                            name="dueDate"
                            className="form-input"
                            value={formData.dueDate}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Story Points</label>
                            <input
                                type="number"
                                name="storyPoints"
                                className="form-input"
                                value={formData.storyPoints}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                        <div className="form-group">
                            <label>Payment Amount ($)</label>
                            <input
                                type="number"
                                name="paymentAmount"
                                className="form-input"
                                value={formData.paymentAmount}
                                onChange={handleChange}
                                min="0"
                                placeholder="0.00"
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
        </div>,
        document.body // Target container
    );
};

export default CreateTaskModal;
