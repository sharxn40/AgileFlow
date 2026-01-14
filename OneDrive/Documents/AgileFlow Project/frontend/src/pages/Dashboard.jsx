import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTasks, FaProjectDiagram, FaClock, FaCheckCircle, FaSearch, FaBell, FaUserCircle } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();

    // --- Mock Data & State ---
    const [projects, setProjects] = useState([
        { id: 1, name: 'AgileFlow Platform', role: 'Lead', type: 'Software', initials: 'AF', color: 'blue' },
        { id: 2, name: 'Mobile App V2', role: 'Member', type: 'Mobile', initials: 'MA', color: 'green' },
        { id: 3, name: 'Design System', role: 'Admin', type: 'Design', initials: 'DS', color: 'purple' },
    ]);

    const [activities, setActivities] = useState([
        { id: 1, user: 'John Doe', action: 'updated status', target: 'AG-101', time: '2 hours ago', userInitials: 'JD' },
        { id: 2, user: 'Jane Smith', action: 'created project', target: 'Marketing 2024', time: '5 hours ago', userInitials: 'JS' },
        { id: 3, user: 'Mike Ross', action: 'commented on', target: 'Design Review', time: '1 day ago', userInitials: 'MR' },
    ]);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');

    // --- Actions ---
    const handleCreateProject = () => {
        if (!newProjectName.trim()) return;
        const newProj = {
            id: projects.length + 1,
            name: newProjectName,
            role: 'Admin',
            type: 'New Project',
            initials: newProjectName.substring(0, 2).toUpperCase(),
            color: 'orange' // Default color for new projects
        };
        setProjects([newProj, ...projects]);
        setActivities([{
            id: Date.now(),
            user: 'You',
            action: 'created project',
            target: newProjectName,
            time: 'Just now',
            userInitials: 'ME'
        }, ...activities]);
        setNewProjectName('');
        setShowCreateModal(false);
    };

    return (
        <main className="dashboard-container">
            {/* Header Section */}
            <header className="dashboard-header">
                <div className="header-title">
                    <h1>Dashboard</h1>
                    <p>Welcome back, here's what's happening today.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaSearch /> Find
                    </button>
                    <button
                        className="btn-primary"
                        onClick={() => setShowCreateModal(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <FaPlus /> Create Project
                    </button>
                </div>
            </header>

            <div className="dashboard-grid">

                {/* Left Column */}
                <div className="dashboard-column">

                    {/* Quick Stats Row */}
                    <div className="stats-row">
                        <StatCard icon={<FaTasks />} label="My Open Tasks" value="8" color="#0052CC" />
                        <StatCard icon={<FaClock />} label="Hours Logged" value="32.5" color="#36B37E" />
                        <StatCard icon={<FaProjectDiagram />} label="Active Projects" value={projects.length} color="#FF991F" />
                    </div>

                    {/* Projects Section */}
                    <div className="glass-panel">
                        <div className="panel-header">
                            <h3 className="panel-title">Recent Projects</h3>
                            <span className="panel-link">View all projects</span>
                        </div>

                        <div className="projects-grid">
                            {projects.map(project => (
                                <div
                                    key={project.id}
                                    className="project-card-interactive"
                                    onClick={() => navigate(`/project/${project.id}`)}
                                >
                                    <div className="project-initials" style={{ background: getProjectColor(project.color) }}>
                                        {project.initials}
                                    </div>
                                    <div className="project-details">
                                        <h4 className="project-name">{project.name}</h4>
                                        <span className="project-meta">{project.type} • {project.role}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="dashboard-column">

                    {/* Activity Stream */}
                    <div className="glass-panel">
                        <h3 className="panel-title" style={{ marginBottom: '1.5rem' }}>Activity Stream</h3>
                        <div className="activity-list">
                            {activities.map(activity => (
                                <div key={activity.id} className="activity-item">
                                    <div className="activity-avatar">
                                        {activity.userInitials}
                                    </div>
                                    <div>
                                        <p className="activity-text">
                                            <strong>{activity.user}</strong> {activity.action} <span className="activity-target">{activity.target}</span>
                                        </p>
                                        <span className="activity-time">{activity.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Assigned to Me (Empty State) */}
                    <div className="glass-panel">
                        <h3 className="panel-title" style={{ marginBottom: '1rem' }}>Assigned to Me</h3>
                        <div className="empty-state">
                            <FaCheckCircle className="empty-icon" />
                            <p className="empty-text">You have no active tickets assigned to you.</p>
                            <button
                                className="btn-secondary"
                                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                                onClick={() => alert("Navigate to Ticket Creation")}
                            >
                                Create Ticket
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Project Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0, marginBottom: '24px', color: '#172B4D', fontSize: '1.5rem' }}>Create New Project</h3>
                        <div className="form-group">
                            <label style={{ fontSize: '0.9rem', fontWeight: '700', color: '#5E6C84', marginBottom: '8px', display: 'block' }}>Project Name</label>
                            <input
                                type="text"
                                className="input-field"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                placeholder="e.g., Marketing Campaign 2024"
                                autoFocus
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                            <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleCreateProject}>Create Project</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

// Helper Components & Functions
const StatCard = ({ icon, label, value, color }) => (
    <div className="stat-card" style={{ '--stat-color': color, '--stat-bg': `${color}15` }}>
        <div className="stat-icon-wrapper">
            {icon}
        </div>
        <div className="stat-content">
            <h3>{value}</h3>
            <span>{label}</span>
        </div>
    </div>
);

const getProjectColor = (color) => {
    const colors = {
        blue: '#0052CC',
        green: '#36B37E',
        purple: '#6554C0',
        orange: '#FF991F',
        teal: '#00B8D9'
    };
    return colors[color] || colors.blue;
};

export default Dashboard;
