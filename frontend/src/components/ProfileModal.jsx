import React, { useState, useRef, useEffect } from 'react';
import { FaCamera, FaTimes, FaTrophy, FaLock, FaUser, FaShieldAlt, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';
import './ProfileModal.css';

const ProfileModal = ({ isOpen, onClose, user, onUpdateUser }) => {
    if (!isOpen) return null;

    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);

    // Form State (initialized from user prop)
    const [formData, setFormData] = useState({
        username: user.username || '',
        title: user.title || 'Team Member',
        bio: user.bio || '',
        email: user.email || '',
        location: user.location || '',
        avatar: user.picture || '',
        banner: user.banner || ''
    });

    // Update state when user prop changes (e.g., on first open after seed)
    useEffect(() => {
        setFormData({
            username: user.username || '',
            title: user.title || 'Team Member',
            bio: user.bio || '',
            email: user.email || '',
            location: user.location || '',
            avatar: user.picture || '',
            banner: user.banner || ''
        });
    }, [user]);

    const avatarInputRef = useRef(null);
    const bannerInputRef = useRef(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, [field]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        onUpdateUser({
            ...user,
            username: formData.username,
            title: formData.title,
            bio: formData.bio,
            email: formData.email,
            location: formData.location,
            picture: formData.avatar,
            banner: formData.banner
        });
        setIsEditing(false);
    };

    return (
        <div className="profile-modal-overlay" onClick={onClose}>
            <div className="profile-modal" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}><FaTimes /></button>

                {/* Hidden File Inputs */}
                <input type="file" ref={avatarInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
                <input type="file" ref={bannerInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />

                {/* Banner Section */}
                <div
                    className="profile-header"
                    style={{
                        backgroundImage: formData.banner ? `url(${formData.banner})` : 'linear-gradient(135deg, #1e212b 0%, #0f111a 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    {isEditing && (
                        <div className="banner-overlay" style={{ cursor: 'pointer' }} onClick={() => bannerInputRef.current.click()}>
                            <FaCamera /> <span style={{ marginLeft: '8px' }}>Change Cover</span>
                        </div>
                    )}

                    <div className="profile-avatar-container" onClick={() => isEditing && avatarInputRef.current.click()}>
                        {formData.avatar ? (
                            <img src={formData.avatar} alt="Profile" className="profile-avatar-large" />
                        ) : (
                            <div className="profile-avatar-placeholder">{formData.username?.charAt(0).toUpperCase()}</div>
                        )}
                        {isEditing && <div className="avatar-overlay"><FaCamera /></div>}
                    </div>
                </div>

                <div className="profile-body">
                    <div className="profile-info-header">
                        <div className="user-names">
                            <h2>{formData.username}</h2>
                            <p className="user-role">{formData.title}</p>
                        </div>
                        <div className="actions">
                            {!isEditing ? (
                                <button className="btn-action edit" onClick={() => setIsEditing(true)}>Edit Profile</button>
                            ) : (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn-action" onClick={() => setIsEditing(false)}>Cancel</button>
                                    <button className="btn-action save" onClick={handleSave}>Save Changes</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="profile-tabs">
                        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                            <FaUser style={{ marginRight: '8px' }} /> Overview
                        </button>
                        <button className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
                            <FaShieldAlt style={{ marginRight: '8px' }} /> Security
                        </button>
                    </div>

                    {activeTab === 'overview' ? (
                        <div className="tab-content overview">
                            <div className="profile-form-grid">
                                <FormGroup label="Full Name" value={formData.username} name="username" onChange={handleChange} isEditing={isEditing} />
                                <FormGroup label="Job Title" value={formData.title} name="title" onChange={handleChange} isEditing={isEditing} />
                                <FormGroup label="Email Address" value={formData.email} name="email" onChange={handleChange} isEditing={isEditing} icon={<FaEnvelope />} />
                                <FormGroup label="Location" value={formData.location} name="location" onChange={handleChange} isEditing={isEditing} icon={<FaMapMarkerAlt />} />

                                <div className="form-group full-width">
                                    <label>Bio</label>
                                    {isEditing ? (
                                        <textarea
                                            name="bio"
                                            className="form-textarea"
                                            rows="3"
                                            value={formData.bio}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        <p style={{ color: 'var(--theme-text-muted)', lineHeight: '1.6' }}>{formData.bio || 'No bio provided yet.'}</p>
                                    )}
                                </div>
                            </div>

                            <div className="achievement-section">
                                <h3><FaTrophy style={{ color: '#fbbf24' }} /> Achievements</h3>
                                <div className="badges-row">
                                    <Badge name="Early Adopter" icon="🚀" />
                                    <Badge name="Bug Hunter" icon="🐛" />
                                    <Badge name="Team Player" icon="🤝" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="tab-content security">
                            <div className="profile-form-grid">
                                <div className="form-group full-width">
                                    <label>Current Password</label>
                                    <input type="password" value="********" disabled className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input type="password" placeholder="Enter new password" disabled={!isEditing} className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label>Confirm Password</label>
                                    <input type="password" placeholder="Confirm new password" disabled={!isEditing} className="form-input" />
                                </div>
                            </div>
                            <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                <h4 style={{ color: '#ef4444', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FaLock /> Two-Factor Authentication
                                </h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--theme-text-muted)' }}>
                                    Protect your account with an extra layer of security. <br />
                                    <span style={{ fontWeight: '600', color: 'var(--theme-text-main)' }}>Status: Disabled</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper Components
const FormGroup = ({ label, value, name, onChange, isEditing, icon }) => (
    <div className="form-group">
        <label>{label}</label>
        {isEditing ? (
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                className="form-input"
            />
        ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {icon && <span style={{ color: 'var(--theme-text-muted)' }}>{icon}</span>}
                <span style={{ color: 'var(--theme-text-main)', fontSize: '1rem' }}>{value || 'Not specified'}</span>
            </div>
        )}
    </div>
);

const Badge = ({ name, icon }) => (
    <div className="badge-card">
        <span className="badge-icon">{icon}</span>
        <span className="badge-name">{name}</span>
    </div>
);

export default ProfileModal;
