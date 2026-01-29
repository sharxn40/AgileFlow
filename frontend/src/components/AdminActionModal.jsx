import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FaTimes, FaUserShield, FaTrashAlt } from 'react-icons/fa';
import './AdminActionModal.css';

// Bind modal to root for accessibility
Modal.setAppElement('#root');

const AdminActionModal = ({ isOpen, onClose, type, user, onConfirm }) => {
    const [selectedRole, setSelectedRole] = useState('');

    useEffect(() => {
        if (user) {
            setSelectedRole(user.role);
        }
    }, [user]);

    const handleConfirm = () => {
        if (type === 'edit-role') {
            onConfirm(user.id, selectedRole);
        } else {
            onConfirm(user.id);
        }
        onClose();
    };

    const roleDefinitions = [
        { id: 'user', label: 'User', desc: 'Standard access. Can view and manage own tasks.' },
        { id: 'project-lead', label: 'Project Lead', desc: 'Can manage team tasks and view project analytics.' },
        { id: 'admin', label: 'Admin', desc: 'Full system access. User management and audit logs.' },
    ];

    if (!user) return null;

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="admin-modal-content"
            overlayClassName="admin-modal-overlay"
            closeTimeoutMS={200}
        >
            <div className="modal-header">
                <h3>
                    {type === 'edit-role' ? 'Edit User Role' : 'Confirm Action'}
                </h3>
                <button className="close-btn" onClick={onClose}>
                    <FaTimes />
                </button>
            </div>

            <div className="modal-body">
                {type === 'edit-role' ? (
                    <div className="role-options">
                        <p style={{ marginBottom: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
                            Update role for <strong>{user.username}</strong>
                        </p>
                        {roleDefinitions.map((role) => (
                            <label
                                key={role.id}
                                className={`role-option-label ${selectedRole === role.id ? 'selected' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="role"
                                    value={role.id}
                                    checked={selectedRole === role.id}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="role-radio"
                                />
                                <div className="role-info">
                                    <span className="role-name">{role.label}</span>
                                    <span className="role-desc">{role.desc}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{
                            width: '60px', height: '60px', background: '#fee2e2', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
                            color: '#ef4444', fontSize: '1.5rem'
                        }}>
                            <FaTrashAlt />
                        </div>
                        <h4 style={{ margin: '0 0 0.5rem', color: '#1e293b' }}>Remove User?</h4>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                            Are you sure you want to remove <strong>{user.username}</strong>? <br />
                            This action cannot be undone.
                        </p>
                    </div>
                )}
            </div>

            <div className="modal-footer">
                <button className="modal-btn cancel" onClick={onClose}>
                    Cancel
                </button>
                <button
                    className={`modal-btn ${type === 'delete' ? 'delete' : 'primary'}`}
                    onClick={handleConfirm}
                >
                    {type === 'edit-role' ? 'Save Changes' : 'Delete User'}
                </button>
            </div>
        </Modal>
    );
};

export default AdminActionModal;
