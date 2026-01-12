import React, { useState } from 'react';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [userData, setUserData] = useState({
        username: 'Admin User',
        email: 'admin@agileflow.com',
        role: 'Administrator'
    });

    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        weeklyReport: true
    });

    return (
        <div className="content-scroll">
            <div className="dashboard-header">
                <h1>Settings</h1>
            </div>

            <div className="dashboard-grid">

                {/* Navigation Tabs */}
                <div className="dash-card" style={{ gridColumn: 'span 3', display: 'flex', gap: '20px', padding: '10px 20px', borderBottom: '1px solid #eee' }}>
                    {['profile', 'account', 'notifications', 'display'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === tab ? '2px solid #0052CC' : 'none',
                                padding: '10px 5px',
                                cursor: 'pointer',
                                fontWeight: activeTab === tab ? '600' : '400',
                                color: activeTab === tab ? '#0052CC' : '#42526E',
                                textTransform: 'capitalize'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="dash-card" style={{ gridColumn: 'span 3', padding: '30px' }}>

                    {activeTab === 'profile' && (
                        <div className="settings-section">
                            <h3 style={{ marginBottom: '20px', color: '#172B4D' }}>Profile Information</h3>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#42526E' }}>Username</label>
                                <input
                                    type="text"
                                    value={userData.username}
                                    onChange={e => setUserData({ ...userData, username: e.target.value })}
                                    style={{ padding: '8px 12px', border: '1px solid #DFE1E6', borderRadius: '4px', width: '300px' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#42526E' }}>Email</label>
                                <input
                                    type="email"
                                    value={userData.email}
                                    readOnly
                                    style={{ padding: '8px 12px', border: '1px solid #DFE1E6', borderRadius: '4px', width: '300px', background: '#F4F5F7' }}
                                />
                            </div>
                            <button style={{ background: '#0052CC', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>
                                Save Changes
                            </button>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="settings-section">
                            <h3 style={{ marginBottom: '20px', color: '#172B4D' }}>Notification Preferences</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={notifications.email} onChange={() => setNotifications({ ...notifications, email: !notifications.email })} />
                                    Email Notifications
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={notifications.push} onChange={() => setNotifications({ ...notifications, push: !notifications.push })} />
                                    Push Notifications (Browser)
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={notifications.weeklyReport} onChange={() => setNotifications({ ...notifications, weeklyReport: !notifications.weeklyReport })} />
                                    Weekly Summary Reports
                                </label>
                            </div>
                        </div>
                    )}

                    {(activeTab === 'account' || activeTab === 'display') && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#6B778C' }}>
                            <p>This settings section is currently under development.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Settings;
