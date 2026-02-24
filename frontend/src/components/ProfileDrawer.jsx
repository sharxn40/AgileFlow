import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaCamera, FaUser, FaShieldAlt, FaEnvelope, FaMapMarkerAlt, FaBriefcase, FaSave, FaPen } from 'react-icons/fa';
import './ProfileDrawer.css';

const ProfileDrawer = ({ isOpen, onClose, user, onUpdateUser }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...user });
    const avatarInputRef = useRef(null);

    // Sync formData with user prop
    useEffect(() => {
        setFormData({
            username: user.username || '',
            title: user.title || 'Team Member',
            bio: user.bio || '',
            email: user.email || '',
            location: user.location || '',
            picture: user.picture || '',
        });
    }, [user]);

    // Lock body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, picture: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        onUpdateUser({ ...user, ...formData });
        setIsEditing(false);
    };

    return (
        <div className="profile-drawer-overlay" onClick={onClose}>
            <div className="profile-drawer" onClick={e => e.stopPropagation()}>
                <div className="drawer-header">
                    <h3>Profile</h3>
                    <button className="close-btn" onClick={onClose}><FaTimes /></button>
                </div>

                <div className="drawer-body">
                    {/* Compact Header Section */}
                    <div className="profile-summary">
                        <div className="avatar-wrapper" onClick={() => isEditing && avatarInputRef.current.click()}>
                            {formData.picture ? (
                                <img src={formData.picture} alt="Profile" className="profile-avatar" />
                            ) : (
                                <div className="profile-avatar-placeholder">{formData.username?.charAt(0).toUpperCase()}</div>
                            )}
                            {isEditing && <div className="avatar-edit-overlay"><FaCamera /></div>}
                            <input type="file" ref={avatarInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
                        </div>
                        <div className="summary-text">
                            <h2>{formData.username}</h2>
                            <p className="role-badge">{formData.title}</p>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="drawer-tabs">
                        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                            Overview
                        </button>
                        <button className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
                            Security
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="drawer-content">
                        {activeTab === 'overview' ? (
                            <div className="form-stack">
                                <div className="section-header">
                                    <h4>Details</h4>
                                    {!isEditing ? (
                                        <button className="icon-btn-text" onClick={() => setIsEditing(true)}>
                                            <FaPen size={12} /> Edit
                                        </button>
                                    ) : (
                                        <button className="icon-btn-text save" onClick={handleSave}>
                                            <FaSave size={12} /> Save
                                        </button>
                                    )}
                                </div>

                                <FormRow label="Full Name" name="username" value={formData.username} isEditing={isEditing} onChange={handleChange} icon={<FaUser />} />
                                <FormRow label="Job Title" name="title" value={formData.title} isEditing={isEditing} onChange={handleChange} icon={<FaBriefcase />} />
                                <FormRow label="Email" name="email" value={formData.email} isEditing={isEditing} onChange={handleChange} icon={<FaEnvelope />} />
                                <FormRow label="Location" name="location" value={formData.location} isEditing={isEditing} onChange={handleChange} icon={<FaMapMarkerAlt />} />

                                <div className="form-group">
                                    <label>Bio</label>
                                    {isEditing ? (
                                        <textarea name="bio" className="drawer-input textarea" rows="4" value={formData.bio} onChange={handleChange} />
                                    ) : (
                                        <p className="bio-text">{formData.bio || 'No bio added yet.'}</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="security-view">
                                <div className="security-card">
                                    <FaShieldAlt className="security-icon" />
                                    <h4>Two-Factor Authentication</h4>
                                    <p>Add an extra layer of security to your account.</p>
                                    <button className="btn-secondary">Enable 2FA</button>
                                </div>
                                <div className="form-stack mt-4">
                                    <h4>Change Password</h4>
                                    <input type="password" placeholder="Current Password" disabled className="drawer-input" value="********" />
                                    <input type="password" placeholder="New Password" disabled={!isEditing} className="drawer-input" />
                                    <input type="password" placeholder="Confirm Password" disabled={!isEditing} className="drawer-input" />
                                    {isEditing && <button className="btn-primary mt-2">Update Password</button>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Component
const FormRow = ({ label, name, value, isEditing, onChange, icon }) => (
    <div className="form-row">
        <label>{label}</label>
        {isEditing ? (
            <input type="text" name={name} value={value} onChange={onChange} className="drawer-input" />
        ) : (
            <div className="value-display">
                <span className="field-icon">{icon}</span>
                <span className="field-value">{value || 'Not set'}</span>
            </div>
        )}
    </div>
);

export default ProfileDrawer;
