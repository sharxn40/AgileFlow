import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectLeadDashboard.css';
import { FaUsers, FaChartLine, FaExclamationTriangle, FaExchangeAlt, FaBriefcase, FaCheckCircle, FaClock, FaUserPlus } from 'react-icons/fa';
import CreateProjectModal from '../components/dashboard/CreateProjectModal';

const ProjectLeadDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isNewUser, setIsNewUser] = useState(false); // State for empty dashboard

    // Reassign State
    const [reassignModalOpen, setReassignModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [newAssigneeId, setNewAssigneeId] = useState('');

    // Invite State
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    // Create Project State
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);

    const handleSearch = async (query) => {
        try {
            const token = localStorage.getItem('token');
            // If query is empty, fetch all users (or top 20)
            const url = `http://localhost:3000/api/project-lead/search?query=${query || ''}`;
            const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) {
                setSearchResults(await res.json());
            }
        } catch (error) {
            console.error("Search Error", error);
        }
    };

    const handleInvite = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3000/api/project-lead/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId })
            });

            if (res.ok) {
                // Refresh team list
                const teamRes = await fetch('http://localhost:3000/api/project-lead/team', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (teamRes.ok) setTeam(await teamRes.json());

                // Clear search results or show success
                setInviteModalOpen(false);
                setSearchQuery('');
            } else {
                alert("Failed to invite user");
            }
        } catch (error) {
            console.error("Invite Error", error);
        }
    };

    // Load users when modal opens
    useEffect(() => {
        if (inviteModalOpen) {
            handleSearch('');
        }
    }, [inviteModalOpen]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const headers = { 'Authorization': `Bearer ${token}` };

                // Fetch Stats
                const statsRes = await fetch('http://localhost:3000/api/project-lead/stats', { headers });
                if (statsRes.ok) {
                    setStats(await statsRes.json());
                    setIsNewUser(false);

                    // Only fetch team if project exists
                    const teamRes = await fetch('http://localhost:3000/api/project-lead/team', { headers });
                    if (teamRes.ok) setTeam(await teamRes.json());

                } else if (statsRes.status === 404) {
                    console.log("No project found for this lead.");
                    setIsNewUser(true);
                }
            } catch (error) {
                console.error("Dashboard Load Error", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    // ... existing handlers (reassign) ...

    const handleProjectCreated = (newProject) => {
        // Animate to dashboard instead of reload
        setStats({
            projectName: newProject.name,
            leadName: 'Me', // We know the creator is the lead
            activeSprint: null,
            teamMemberCount: 1, // Just the creator
            blockedTaskCount: 0
        });
        setIsNewUser(false);
    };

    if (loading) return (
        <div className="pld-loading-container">
            <div className="spinner"></div>
            <p>Loading Dashboard...</p>
        </div>
    );

    if (isNewUser) {
        return (
            <div className="pl-dashboard-container centered-empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', textAlign: 'center' }}>
                <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', maxWidth: '500px' }}>
                    <FaBriefcase style={{ fontSize: '4rem', color: '#0052CC', marginBottom: '20px' }} />
                    <h1 style={{ fontSize: '2rem', marginBottom: '10px', color: '#172B4D' }}>Welcome, Project Lead!</h1>
                    <p style={{ color: '#5E6C84', fontSize: '1.1rem', marginBottom: '30px' }}>
                        You don't have a project yet. Create your first project to start managing your team and sprints.
                    </p>
                    <button className="pl-btn-primary" onClick={() => setShowCreateProjectModal(true)} style={{ padding: '12px 24px', fontSize: '1rem' }}>
                        <FaUserPlus style={{ marginRight: '8px' }} /> Create My Project
                    </button>
                    <CreateProjectModal
                        isOpen={showCreateProjectModal}
                        onClose={() => setShowCreateProjectModal(false)}
                        onCreate={handleProjectCreated}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="pl-dashboard-container" style={{ animation: 'fadeIn 0.6s ease-out' }}>
            {/* Header Section */}
            <div className="pl-header-section">
                <div className="pl-header-content">
                    <h5>Project Lead Console</h5>
                    <h1>{stats?.projectName || 'Project Overview'}</h1>
                    <p className="pl-lead-name">Lead: {stats?.leadName || 'Me'}</p>
                </div>
                <div className="pl-header-actions">
                    <div className="current-sprint-badge">
                        <FaClock />
                        <span>{stats?.activeSprint ? stats.activeSprint.name : 'No Active Sprint'}</span>
                    </div>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="pl-metrics-grid">
                <div className="pl-card metric-card blue-gradient">
                    <div className="metric-icon"><FaChartLine /></div>
                    <div className="metric-details">
                        <h3>Sprint Goal</h3>
                        <p className="metric-value-text">{stats?.activeSprint ? stats.activeSprint.goal : '--'}</p>
                    </div>
                </div>
                <div className="pl-card metric-card green-gradient">
                    <div className="metric-icon"><FaUsers /></div>
                    <div className="metric-details">
                        <h3>Team Size</h3>
                        <p className="metric-value">{stats?.teamMemberCount || 0}</p>
                    </div>
                </div>
                <div className="pl-card metric-card red-gradient">
                    <div className="metric-icon"><FaExclamationTriangle /></div>
                    <div className="metric-details">
                        <h3>Blockers</h3>
                        <p className="metric-value">{stats?.blockedTaskCount || 0}</p>
                    </div>
                </div>
            </div>

            {/* Team Workload Section */}
            <div className="pl-section">
                <div className="section-header">
                    <h2><FaBriefcase /> Team Workload</h2>
                    <button className="pl-btn-secondary" onClick={() => setInviteModalOpen(true)}>
                        <FaUserPlus /> Add Member
                    </button>
                </div>

                <div className="team-workload-grid">
                    {team.length > 0 ? (
                        team.map(member => (
                            <div key={member.id} className="pl-card member-card">
                                <div className="member-card-header">
                                    <div className="member-avatar-large">
                                        {member.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="member-info">
                                        <h4>{member.username}</h4>
                                        <span className="member-role">Developer</span>
                                    </div>
                                    <div className="task-count-badge">
                                        {member.tasks?.length || 0}
                                    </div>
                                </div>

                                <div className="member-tasks-scroll">
                                    {member.tasks && member.tasks.length > 0 ? (
                                        member.tasks.map(task => (
                                            <div key={task.id} className={`mini-task-row p-priority-${task.priority.toLowerCase()}`}>
                                                <div className="mini-task-left">
                                                    <FaCheckCircle className="task-status-icon" />
                                                    <span className="mini-task-title">{task.title}</span>
                                                </div>
                                                <button
                                                    className="mini-reassign-btn"
                                                    title="Reassign Task"
                                                    onClick={() => handleReassignClick(task)}
                                                >
                                                    <FaExchangeAlt />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-tasks-placeholder">
                                            <span>No active tasks</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="pl-card no-team-state">
                            <p>No team members found in this project.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Reassign Modal */}
            {reassignModalOpen && (
                <div className="pl-modal-overlay">
                    <div className="pl-modal">
                        <div className="pl-modal-header">
                            <h3>Reassign Task</h3>
                        </div>
                        <div className="pl-modal-body">
                            <p className="reassign-task-name">{selectedTask?.title}</p>
                            <label>Assign To:</label>
                            <select
                                value={newAssigneeId}
                                onChange={(e) => setNewAssigneeId(e.target.value)}
                                className="pl-select"
                            >
                                <option value="">Select Team Member</option>
                                {team.map(m => (
                                    <option key={m.id} value={m.id}>{m.username}</option>
                                ))}
                            </select>
                        </div>
                        <div className="pl-modal-actions">
                            <button onClick={() => setReassignModalOpen(false)} className="pl-btn-secondary">Cancel</button>
                            <button onClick={confirmReassign} className="pl-btn-primary">Confirm Reassign</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invite Modal */}
            {inviteModalOpen && (
                <div className="pl-modal-overlay">
                    <div className="pl-modal">
                        <div className="pl-modal-header">
                            <h3>Invite Team Member</h3>
                        </div>
                        <div className="pl-modal-body">
                            <label>Search User (Email or Name)</label>
                            <input
                                type="text"
                                className="pl-input"
                                placeholder="e.g. john@example.com"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    handleSearch(e.target.value);
                                }}
                            />
                            <div className="search-results">
                                {searchResults.map(u => (
                                    <div key={u.id} className="search-result-item">
                                        <span>{u.username} ({u.email})</span>
                                        <button className="pl-btn-sm" onClick={() => handleInvite(u.id)}>Add</button>
                                    </div>
                                ))}
                                {searchQuery && searchResults.length === 0 && <p className="no-results">No free users found.</p>}
                            </div>
                        </div>
                        <div className="pl-modal-actions">
                            <button onClick={() => setInviteModalOpen(false)} className="pl-btn-secondary">Done</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectLeadDashboard;
