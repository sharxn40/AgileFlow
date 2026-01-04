import React, { useState, useEffect } from 'react';
import { FaCamera, FaSave, FaTimes, FaTrophy, FaLock } from 'react-icons/fa';
import '../pages/Dashboard.css'; // Re-use and append new styles here

const ProfileModal = ({ isOpen, onClose, user, onUpdateUser }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        username: user.username || '',
        title: 'Senior Software Engineer', // Mock default
        bio: 'Passionate about building scalable web applications and agile workflows.',
        email: 'user@example.com',
        avatar: user.picture || '',
        banner: user.banner || '' // Add banner state
    });

    const [isEditing, setIsEditing] = useState(false);

    // Mock Badges Data
    const badges = [
        { id: 1, name: 'Task Master', icon: '✅', description: 'Completed 50 tasks', unlocked: true },
        { id: 2, name: 'Bug Hunter', icon: '🐛', description: 'Resolved 10 critical bugs', unlocked: true },
        { id: 3, name: 'Team Player', icon: '🤝', description: 'Assigned 5 tasks to others', unlocked: true },
        { id: 4, name: 'Sprint Guru', icon: '🏃', description: 'Completed 5 sprints', unlocked: false },
        { id: 5, name: 'Early Bird', icon: '🌅', description: 'Logged in before 8 AM', unlocked: false },
        { id: 6, name: 'Night Owl', icon: '🌙', description: 'Worked after 10 PM', unlocked: false },
    ];

    // Hidden file input refs
    const avatarInputRef = React.useRef(null);
    const bannerInputRef = React.useRef(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        // Simulate API call
        onUpdateUser({
            ...user,
            username: formData.username,
            picture: formData.avatar,
            banner: formData.banner
        });
        setIsEditing(false);
        // In a real app, you'd send formData to backend here
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

    const handleAvatarClick = () => {
        if (!isEditing) return;
        avatarInputRef.current.click();
    };

    const handleBannerClick = () => {
        if (!isEditing) return;
        bannerInputRef.current.click();
    };

    return (
        <div className="profile-modal-overlay" onClick={onClose}>
            <div className="profile-modal" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}><FaTimes /></button>

                {/* Hidden File Inputs */}
                <input
                    type="file"
                    ref={avatarInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'avatar')}
                />
                <input
                    type="file"
                    ref={bannerInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'banner')}
                />

                {/* Header / Cover */}
                <div
                    className="profile-header"
                    onClick={handleBannerClick}
                    style={{
                        backgroundImage: formData.banner ? `url(${formData.banner})` : 'linear-gradient(135deg, #0052CC 0%, #2684FF 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        cursor: isEditing ? 'pointer' : 'default'
                    }}
                >
                    {isEditing && (
                        <div className="banner-overlay">
                            <FaCamera /> <span style={{ marginLeft: '8px', fontSize: '0.9rem' }}>Upload Cover</span>
                        </div>
                    )}
                    <div className="profile-avatar-container" onClick={handleAvatarClick}>
                        {formData.avatar ? (
                            <img src={formData.avatar} alt="Profile" className="profile-avatar-large" />
                        ) : (
                            <div className="profile-avatar-placeholder">{formData.username.charAt(0).toUpperCase()}</div>
                        )}
                        {isEditing && <div className="avatar-overlay"><FaCamera /></div>}
                    </div>
                </div>

                <div className="profile-body">
                    {/* Left: User Details */}
                    <div className="profile-details">
                        <div className="details-header">
                            <div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="edit-input title-input"
                                    />
                                ) : (
                                    <h2>{formData.username}</h2>
                                )}
                                <p className="profile-role">{formData.title}</p>
                            </div>
                            <button
                                className={`btn-edit ${isEditing ? 'active' : ''}`}
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            >
                                {isEditing ? <><FaSave /> Save</> : 'Edit Profile'}
                            </button>
                        </div>

                        <div className="details-form">
                            <div className="form-group">
                                <label>Bio</label>
                                {isEditing ? (
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        className="edit-input bio-input"
                                        rows="3"
                                    />
                                ) : (
                                    <p className="view-text">{formData.bio}</p>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <p className="view-text">{formData.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Badges */}
                    <div className="profile-badges">
                        <h3><FaTrophy style={{ color: '#FF991F' }} /> Achievements</h3>
                        <div className="badges-grid">
                            {badges.map(badge => (
                                <div key={badge.id} className={`badge-item ${badge.unlocked ? 'unlocked' : 'locked'}`}>
                                    <div className="badge-icon">
                                        {badge.unlocked ? badge.icon : <FaLock />}
                                    </div>
                                    <div className="badge-info">
                                        <h4>{badge.name}</h4>
                                        <span>{badge.description}</span>
                                    </div>
                                </div>
                            ))}
                            {/* Empty Slots Visualization */}
                            <div className="badge-item empty">
                                <div className="badge-icon dashed"></div>
                                <div className="badge-info">
                                    <div className="line short"></div>
                                    <div className="line long"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
