import React, { useState } from 'react';
import { FaTimes, FaPlus, FaCheck } from 'react-icons/fa';
import './CreateTaskModal.css';

const PRIORITIES = ['High', 'Medium', 'Low'];
const COLORS = {
    'High': '#FF5630',
    'Medium': '#FFAB00',
    'Low': '#36B37E'
};

const CreateTaskModal = ({ isOpen, onClose, onCreate, projects = [] }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        title: '',
        tag: '',
        priority: 'Medium',
        assignee: '',
        projectId: projects.length > 0 ? projects[0].id : ''
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

        // If projects are required/available but none selected, handle that (though default selected)
        if (projects.length > 0 && !formData.projectId) {
            alert('Please select a project');
            return;
        }

        onCreate(formData);
        // Reset form slightly but keep some defaults
        setFormData({
            title: '',
            tag: '',
            priority: 'Medium',
            assignee: '',
            projectId: projects.length > 0 ? projects[0].id : ''
        });
    };

    return (
        <div className="modal-overlay">
            <div className="create-task-modal">
                <div className="modal-header">
                    <h2><FaPlus style={{ marginRight: '10px', color: '#0052CC' }} /> New Issue</h2>
                    <button className="close-btn" onClick={onClose}><FaTimes /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
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
