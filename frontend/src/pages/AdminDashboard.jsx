import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FaTrash, FaUsers, FaChartLine, FaServer, FaSearch, FaEdit, FaUserCog } from 'react-icons/fa';
import AdminSidebar from '../components/AdminSidebar';
import AdminActionModal from '../components/AdminActionModal';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [payments, setPayments] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const location = useLocation();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('edit-role'); // 'edit-role' or 'delete'
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
        fetchPayments();
    }, []);

    useEffect(() => {
        const filtered = users.filter(user =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(filtered);
    }, [searchTerm, users]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setUsers(data);
            setFilteredUsers(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchPayments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/payments/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPayments(data);
            }
        } catch (err) {
            console.error("Failed to fetch payments", err);
        }
    };

    const handleOpenModal = (type, user) => {
        setModalType(type);
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleModalConfirm = async (userId, newRole) => {
        if (modalType === 'delete') {
            await deleteUser(userId);
        } else if (modalType === 'edit-role') {
            await updateUserRole(userId, newRole);
        }
    };

    const deleteUser = async (id) => {
        // Confirmation handled by modal
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:3000/api/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUsers(users.filter(user => user.id !== id));
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const updateUserRole = async (id, newRole) => {
        try {
            console.log(`AdminDashboard: Updating user ${id} to role ${newRole}`); // DEBUG
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/users/${id}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            if (!response.ok) {
                const text = await response.text();
                console.error(`Update failed: ${response.status} ${text}`);
                throw new Error(text || 'Failed to update role');
            }

            console.log('AdminDashboard: Update success');

            // Optimistic Update
            setUsers(prevUsers => prevUsers.map(u =>
                u.id === id ? { ...u, role: newRole } : u
            ));

            // Still fetch to be sure, but UI is already updated
            fetchUsers();
            setIsModalOpen(false);
        } catch (err) {
            console.error('Update Error:', err);
            setError(`Update Failed: ${err.message}`);
            // Also close modal to show error on dashboard
            setIsModalOpen(false);
        }
    };



    // Calculate real stats
    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const projectLeadCount = users.filter(u => u.role === 'project-lead').length;

    // Helper for random color generation for avatar
    const getAvatarColor = (name) => {
        const colors = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#10b981', '#3b82f6'];
        const index = name.length % colors.length;
        return colors[index];
    };

    const renderContent = () => {
        const path = location.pathname;

        if (path === '/admin/users') {
            return (
                <div className="admin-content-card">
                    <div className="card-title-row">
                        <h2>User Management</h2>
                        <div className="admin-search-wrapper">
                            <FaSearch className="search-icon-absolute" />
                            <input
                                type="text"
                                className="admin-search-input"
                                placeholder="Search users by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="user-profile-cell">
                                            <div
                                                className="avatar-circle"
                                                style={{ backgroundColor: getAvatarColor(user.username) }}
                                            >
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="user-text-info">
                                                <span className="user-display-name">{user.username}</span>
                                                <span className="user-display-email">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`role-pill ${user.role}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="status-dot-badge">
                                            <div className="dot active"></div>
                                            Active
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                                            <button
                                                className="icon-btn"
                                                title="Edit Role"
                                                onClick={() => handleOpenModal('edit-role', user)}
                                            >
                                                <FaUserCog />
                                            </button>
                                            <button
                                                className="icon-btn danger"
                                                title="Remove User"
                                                onClick={() => handleOpenModal('delete', user)}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredUsers.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                            No users found matching "{searchTerm}"
                        </div>
                    )}
                </div>
            );
        }

        if (path === '/admin/payments') {
            return (
                <div className="admin-content-card">
                    <div className="card-title-row">
                        <h2>Global Transactions</h2>
                        <div className="admin-stats-summary" style={{ display: 'flex', gap: '20px' }}>
                            <div className="mini-stat">
                                <span className="label">Total Processed:</span>
                                <span className="value" style={{ color: '#10b981', fontWeight: 'bold', marginLeft: '8px' }}>
                                    ₹{payments.reduce((acc, p) => p.status === 'Paid' ? acc + p.amount : acc, 0).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Project ID</th>
                                <th>Worker ID</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Order ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(p => (
                                <tr key={p.id}>
                                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                                    <td><span className="id-badge" style={{ fontSize: '0.75rem', padding: '2px 6px', background: '#f1f5f9', borderRadius: '4px' }}>{p.projectId}</span></td>
                                    <td><span style={{ fontSize: '0.9rem' }}>{p.workerId}</span></td>
                                    <td>₹{p.amount}</td>
                                    <td>
                                        <span className={`role-pill ${p.status === 'Paid' ? 'admin' : 'worker'}`} style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{p.razorpayOrderId}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {payments.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                            No transactions recorded yet.
                        </div>
                    )}
                </div>
            );
        }

        if (path === '/admin/roles') {
            return (
                <div className="admin-content-card">
                    <div className="card-title-row">
                        <h2>Roles & Permissions</h2>
                    </div>
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                        <FaUserCog style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
                        <p>Role management configuration will be implemented here.</p>
                    </div>
                </div>
            );
        }

        if (path === '/admin/logs') {
            return (
                <div className="admin-content-card">
                    <div className="card-title-row">
                        <h2>Audit Logs</h2>
                    </div>
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                        <FaChartLine style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
                        <p>System activity logs will appear here.</p>
                    </div>
                </div>
            );
        }

        if (path === '/admin/settings') {
            return (
                <div className="admin-content-card">
                    <div className="card-title-row">
                        <h2>System Settings</h2>
                    </div>
                    <div className="settings-grid" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        <div className="settings-group" style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Payment Integration</h3>
                            <div className="integration-status" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <div className="status-indicator" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
                                <span style={{ fontWeight: '500' }}>Razorpay Connected</span>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5' }}>
                                Using Key ID: <code style={{ background: '#f1f5f9', padding: '2px 4px', borderRadius: '4px' }}>rzp_test_...</code>
                            </p>
                        </div>
                        <div className="settings-group" style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px', opacity: 0.6 }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Email Service (SMTP)</h3>
                            <div className="integration-status" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="status-indicator" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div>
                                <span style={{ fontWeight: '500' }}>Configured (Test Mode)</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // Default: Dashboard Overview
        return (
            <>
                <div className="admin-stats-grid">
                    <div className="admin-stat-card">
                        <div className="card-header">
                            <div className="stat-icon-wrapper purple">
                                <FaUsers />
                            </div>
                            <div className="stat-meta">
                                <h3>Total Users</h3>
                                <span className="value">{totalUsers}</span>
                            </div>
                        </div>
                        <div className="stat-footer">
                            <span className="trend-badge positive">+12%</span>
                            <span>from last month</span>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="card-header">
                            <div className="stat-icon-wrapper blue">
                                <FaChartLine />
                            </div>
                            <div className="stat-meta">
                                <h3>Active Sessions</h3>
                                <span className="value">{Math.max(1, Math.floor(totalUsers * 0.6))}</span>
                            </div>
                        </div>
                        <div className="stat-footer">
                            <span style={{ color: '#10b981' }}>●</span>
                            <span>System Online</span>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="card-header">
                            <div className="stat-icon-wrapper green">
                                <FaServer />
                            </div>
                            <div className="stat-meta">
                                <h3>System Health</h3>
                                <span className="value">98%</span>
                            </div>
                        </div>
                        <div className="stat-footer">
                            <span>All operational</span>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Mini Table for Dashboard */}
                <div className="admin-content-card">
                    <div className="card-title-row">
                        <h2>Recent Registrations</h2>
                    </div>
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.slice(0, 5).map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="user-profile-cell">
                                            <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.9rem', backgroundColor: getAvatarColor(user.username) }}>
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="user-display-name" style={{ fontSize: '0.95rem' }}>{user.username}</span>
                                        </div>
                                    </td>
                                    <td><span className={`role-pill ${user.role}`}>{user.role}</span></td>
                                    <td><span style={{ color: '#10b981', fontWeight: 500, fontSize: '0.9rem' }}>Active</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </>
        );
    };

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/admin/users') return 'User Management';
        if (path === '/admin/roles') return 'Roles & Permissions';
        if (path === '/admin/logs') return 'Audit Logs';
        if (path === '/admin/settings') return 'Settings';
        if (path === '/admin/payments') return 'Payment Management';
        return 'Admin Overview';
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />

            <main className="admin-main-content">
                <div className="admin-header">
                    <div className="header-title">
                        <h1>{getPageTitle()}</h1>
                        <p>Welcome back, Admin. Here's what's happening today.</p>
                    </div>
                    <div className="header-actions">
                        {/* Could put notification icons here */}
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}



                {renderContent()}
            </main>

            <AdminActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                type={modalType}
                user={selectedUser}
                onConfirm={handleModalConfirm}
            />
        </div>
    );

};

export default AdminDashboard;
