import React, { useState } from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM
import { FaTimes, FaProjectDiagram, FaCheck } from 'react-icons/fa';
import './CreateProjectModal.css';

const PROJECT_TYPES = [
    'SaaS Development',
    'Mobile App',
    'Marketing Campaign',
    'Design System',
    'Internal Tool',
    'Other'
];

const COLORS = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Rose', value: '#ef4444' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Cyan', value: '#06b6d4' }
];

const CreateProjectModal = ({ isOpen, onClose, onCreate }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        name: '',
        key: '',
        type: 'SaaS Development',
        description: '',
        color: '#6366f1',
        dueDate: ''
    });

    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null); // Clear error on change
    };

    const handleColorSelect = (color) => {
        setFormData({ ...formData, color: color });
    };

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.name.trim()) {
            setError('Project Name is required');
            return;
        }

        // Validate Key (Alphanumeric)
        const keyRegex = /^[A-Z0-9]+$/;
        if (!keyRegex.test(formData.key)) {
            setError('Project Key must be alphanumeric (A-Z, 0-9)');
            return;
        }

        // Validate Date (Future only if set)
        if (formData.dueDate) {
            const selectedDate = new Date(formData.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                setError('Due Date cannot be in the past');
                return;
            }
        }

        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:3000/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    key: formData.key,
                    description: formData.description,
                    leadId: null,
                    dueDate: formData.dueDate
                })
            });

            if (res.ok) {
                const project = await res.json();
                onCreate(project);
                onClose();
            } else {
                const errData = await res.json();
                setError(errData.message || 'Failed to create project');
            }
        } catch (err) {
            console.error('Modal: Error', err);
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Use Portal to render at document.body level
    return ReactDOM.createPortal(
        <div className="modal-overlay">
            <div className="create-project-modal">
                <div className="modal-header">
                    <h2><FaProjectDiagram style={{ marginRight: '10px', color: 'var(--theme-primary)' }} /> Create New Project</h2>
                    <button className="close-btn" onClick={onClose}><FaTimes /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    {error && <div style={{ background: '#FFEBE6', color: '#BF2600', padding: '10px', borderRadius: '4px', fontSize: '0.9rem' }}>{error}</div>}
                    <div className="form-row">
                        <div className="form-group" style={{ flex: 2 }}>
                            <label>Project Name</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                placeholder="e.g. Q4 Marketing Plan"
                                value={formData.name}
                                onChange={(e) => {
                                    // Auto-generate key if not manually edited
                                    const newName = e.target.value;
                                    const newKey = newName.substring(0, 4).toUpperCase();
                                    setFormData({ ...formData, name: newName, key: newKey });
                                }}
                                autoFocus
                                required
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Key</label>
                            <input
                                type="text"
                                name="key"
                                className="form-input"
                                placeholder="KEY"
                                value={formData.key}
                                onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                                maxLength={6}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Project Type</label>
                            <select name="type" className="form-select" value={formData.type} onChange={handleChange}>
                                {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
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
                    </div>

                    <div className="form-group">
                        <label>Theme Color</label>
                        <div className="color-picker">
                            {COLORS.map(c => (
                                <div
                                    key={c.value}
                                    className={`color-option ${formData.color === c.value ? 'selected' : ''}`}
                                    style={{ backgroundColor: c.value }}
                                    onClick={() => handleColorSelect(c.value)}
                                    title={c.name}
                                >
                                    {formData.color === c.value && <FaCheck style={{ color: 'white', fontSize: '10px' }} />}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description (Optional)</label>
                        <textarea
                            name="description"
                            className="form-textarea"
                            rows="3"
                            placeholder="Brief details about this project..."
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={isLoading}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body // Target container
    );
};

export default CreateProjectModal;
