import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectLeadDashboard.css';
import { FaUsers, FaChartLine, FaExclamationTriangle, FaExchangeAlt, FaBriefcase, FaCheckCircle, FaClock, FaUserPlus, FaFireAlt, FaExclamationCircle, FaProjectDiagram, FaChevronDown, FaPlus } from 'react-icons/fa';
import CreateProjectModal from '../components/dashboard/CreateProjectModal';
import CreateTaskModal from '../components/dashboard/CreateTaskModal';
import MemberDetailModal from '../components/dashboard/MemberDetailModal';

const ProjectLeadDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [team, setTeam] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isNewUser, setIsNewUser] = useState(false);

    // Modal States
    const [selectedMemberId, setSelectedMemberId] = useState(null); // For Drilldown
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [targetProjectForInvite, setTargetProjectForInvite] = useState(null); // Specific project context
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);

    // Assign Task States
    const [assignTaskModalOpen, setAssignTaskModalOpen] = useState(false);
    const [assigneeEmail, setAssigneeEmail] = useState('');

    // Search/Invite State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    // --- Fetch Logic ---
    useEffect(() => {
        const fetchProjectsAndData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const headers = { 'Authorization': `Bearer ${token}` };

                // 1. Fetch Projects List First
                const projectsRes = await fetch('http://localhost:3000/api/project-lead/projects', { headers });
                if (projectsRes.ok) {
                    const projectsData = await projectsRes.json();
                    setProjects(projectsData);

                    if (projectsData.length === 0) {
                        setIsNewUser(true);
                        setLoading(false);
                        return;
                    }

                    setIsNewUser(false);
                    // Determine Active Project (Default to first if none selected)
                    const activeProjectId = selectedProjectId || projectsData[0].id;
                    if (!selectedProjectId) setSelectedProjectId(activeProjectId);

                    // 2. Fetch Stats & Team for Active Project
                    const [statsRes, teamRes] = await Promise.all([
                        fetch(`http://localhost:3000/api/project-lead/stats?projectId=${activeProjectId}`, { headers }),
                        fetch(`http://localhost:3000/api/project-lead/team?projectId=${activeProjectId}`, { headers })
                    ]);

                    if (statsRes.ok) setStats(await statsRes.json());
                    if (teamRes.ok) setTeam(await teamRes.json());
                } else {
                    setIsNewUser(true);
                }
            } catch (error) {
                console.error("Dashboard Load Error", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjectsAndData();
    }, [navigate, selectedProjectId]);

    // --- Handlers ---
    const handleProjectSwitch = (e) => {
        setSelectedProjectId(e.target.value);
        setLoading(true);
    };

    const handleOpenInvite = (project) => {
        setTargetProjectForInvite(project);
        setInviteModalOpen(true);
    };

    const handleSearch = async (query) => {
        try {
            const token = localStorage.getItem('token');
            const url = `http://localhost:3000/api/project-lead/search?query=${query || ''}`;
            const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) setSearchResults(await res.json());
        } catch (error) { console.error("Search Error", error); }
    };

    const handleInvite = async (userId) => {
        // Use specifically targeted project (from tile) OR currently selected project (global)
        const projectIdToInvite = targetProjectForInvite?.id || selectedProjectId;

        if (!projectIdToInvite) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3000/api/project-lead/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ userId, projectId: projectIdToInvite })
            });

            if (res.ok) {
                // Refresh data
                const teamRes = await fetch(`http://localhost:3000/api/project-lead/team?projectId=${selectedProjectId || projectIdToInvite}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (teamRes.ok) setTeam(await teamRes.json());

                // Refresh projects to update member count
                const projectsRes = await fetch('http://localhost:3000/api/project-lead/projects', { headers: { 'Authorization': `Bearer ${token}` } });
                if (projectsRes.ok) setProjects(await projectsRes.json());

                setInviteModalOpen(false);
                setSearchQuery('');
                setTargetProjectForInvite(null);
            } else {
                alert("Failed to invite user");
            }
        } catch (error) { console.error("Invite Error", error); }
    };

    const handleProjectCreated = (newProject) => {
        setStats({ projectName: newProject.name, leadName: 'Me', activeSprint: null, teamMemberCount: 1, blockedTaskCount: 0 });
        setIsNewUser(false);
    };

    const handleAssignTask = (email) => {
        setAssigneeEmail(email);
        setAssignTaskModalOpen(true);
        // Optional: Close Member Detail if you want, but keeping it open might be better context.
        // actually, CreateTaskModal is a portal on top, so it fits.
    };

    const handleTaskCreated = async (taskData) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3000/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(taskData)
            });

            if (res.ok) {
                // Refresh team data to show new task count/workload
                const teamRes = await fetch('http://localhost:3000/api/project-lead/team', { headers: { 'Authorization': `Bearer ${token}` } });
                if (teamRes.ok) setTeam(await teamRes.json());

                setAssignTaskModalOpen(false);
                // If MemberDetailModal is open, we ideally want to refresh IT too.
                // But MemberDetailModal fetches its own data on open/change. 
                // A simplified trick: close and reopen or force update. 
                // For now, the user manually refreshing or re-opening is acceptable V1.
                // Or better: Pass a "refreshTrigger" to Modal? 

                // Let's close the assign modal. The user can see the updated data when they interact again.
                // But specifically for MemberDetailModal, it won't auto-update without a trigger.
                // We'll leave it simple for now.
            }
        } catch (error) {
            console.error("Task Create Error", error);
        }
    };

    if (loading) return <div className="pld-loading-container"><div className="spinner"></div><p>Loading Dashboard...</p></div>;

    if (isNewUser) {
        return (
            <div className="pl-dashboard-container centered-empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', textAlign: 'center' }}>
                <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', maxWidth: '500px' }}>
                    <FaBriefcase style={{ fontSize: '4rem', color: '#0052CC', marginBottom: '20px' }} />
                    <h1 style={{ fontSize: '2rem', marginBottom: '10px', color: '#172B4D' }}>Welcome, Project Lead!</h1>
                    <p style={{ color: '#5E6C84', fontSize: '1.1rem', marginBottom: '30px' }}>You don't have a project yet. Create your first project to start managing your team.</p>
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

    const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];

    // Handle tile click to navigate to project dashboard
    const handleProjectClick = (projectId) => {
        navigate(`/project/${projectId}`);
    };

    return (
        <div className="pl-dashboard-container" style={{ animation: 'fadeIn 0.6s ease-out' }}>
            {/* Header */}
            <div className="pl-header-section" style={{ background: 'white', padding: '24px 32px', borderRadius: '16px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <div className="pl-header-content">
                    <h5 style={{ color: '#0052CC', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '0.5px' }}>PROJECT LEAD CONSOLE</h5>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h1 style={{ margin: 0, fontSize: '2rem', color: '#172B4D' }}>{currentProject?.name || 'Overview'}</h1>
                    </div>
                    <p className="pl-lead-name" style={{ marginTop: '8px', color: '#6B778C' }}>Lead: {stats?.leadName || 'Me'}</p>
                </div>
                <div className="pl-header-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                        className="pl-btn-primary"
                        onClick={() => setShowCreateProjectModal(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <FaPlus /> New Project
                    </button>
                </div>
            </div>

            {/* Top Metrics */}
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

            {/* Projects Grid */}
            <div className="pl-section">
                <div className="section-header">
                    <h2><FaProjectDiagram /> Your Projects</h2>
                </div>
                <div className="projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                    {/* Safe check for projects array */}
                    {(projects || []).map(project => (
                        <div
                            key={project.id}
                            className="pl-card project-tile"
                            style={{ padding: '20px', position: 'relative', cursor: 'pointer', transition: 'all 0.2s' }}
                            onClick={() => handleProjectClick(project.id)}
                        >
                            <div className="project-tile-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#172B4D' }}>{project.name}</h3>
                                    <span style={{ fontSize: '0.9rem', color: '#6B778C', background: '#EBECF0', padding: '2px 8px', borderRadius: '4px' }}>{project.key}</span>
                                </div>
                                <div className="project-role-badge" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#0052CC', background: '#DEEBFF', padding: '4px 8px', borderRadius: '4px' }}>LEAD</div>
                            </div>

                            <p style={{ color: '#5E6C84', fontSize: '0.9rem', marginBottom: '20px', minHeight: '40px' }}>
                                {project.description || 'No description provided.'}
                            </p>

                            <div className="project-tile-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #EBECF0', paddingTop: '16px' }}>
                                <div className="member-stack" style={{ display: 'flex' }}>
                                    <div className="member-avatar-sm" style={{ width: 24, height: 24, background: '#0052CC', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', border: '2px solid white' }}>
                                        {stats?.leadName?.charAt(0) || 'M'}
                                    </div>
                                    <span style={{ marginLeft: '8px', fontSize: '0.9rem', color: '#6B778C' }}>
                                        {project.members ? project.members.length : 1} Members
                                    </span>
                                </div>
                                <button
                                    className="pl-btn-sm"
                                    onClick={(e) => { e.stopPropagation(); handleOpenInvite(project); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <FaUserPlus /> Add Member
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Team Analysis Grid */}
            <div className="pl-section">
                <div className="section-header">
                    <h2><FaBriefcase /> Team Workload & Risks</h2>
                </div>

                <div className="team-workload-grid">
                    {team.map(member => {
                        // Extract New Backend Metrics
                        const metrics = member.metrics || { workloadStatus: 'Low', overdueCount: 0, riskCount: 0, activeCount: 0 };

                        // Determine Visual Classes
                        const isOverloaded = metrics.workloadStatus === 'Overloaded';
                        const hasRisks = metrics.riskCount > 0 || metrics.overdueCount > 0;

                        return (
                            <div
                                key={member.id}
                                className={`pl-card member-card ${isOverloaded ? 'card-overload' : ''}`}
                                onClick={() => setSelectedMemberId(member.id)} // Drilldown
                            >
                                <div className="member-card-header">
                                    <div className="member-avatar-large">
                                        {member.username.charAt(0).toUpperCase()}
                                        {hasRisks && <div className="risk-dot-indicator"></div>}
                                    </div>
                                    <div className="member-info">
                                        <h4>{member.username}</h4>
                                        <span className="member-role">Developer</span>
                                    </div>
                                    {/* Workload Badge */}
                                    <div className={`workload-badge ${metrics.workloadStatus.toLowerCase()}`}>
                                        {metrics.workloadStatus}
                                    </div>
                                </div>

                                {/* Risk Summary Row */}
                                <div className="member-risk-row">
                                    <div className="risk-item" title="Active Tasks">
                                        <FaBriefcase /> {metrics.activeCount} Active
                                    </div>
                                    {metrics.overdueCount > 0 && (
                                        <div className="risk-item risk-critical">
                                            <FaExclamationCircle /> {metrics.overdueCount} Overdue
                                        </div>
                                    )}
                                    {metrics.riskCount > 0 && (
                                        <div className="risk-item risk-warning">
                                            <FaFireAlt /> {metrics.riskCount} At Risk
                                        </div>
                                    )}
                                </div>

                                <div className="member-tasks-preview">
                                    <span className="preview-label">Recent Activity</span>
                                    {member.tasks && member.tasks.length > 0 ? (
                                        member.tasks.slice(0, 3).map(task => (
                                            <div key={task.id} className="mini-preview-task">
                                                <div className={`preview-dot ${task.priority.toLowerCase()}`}></div>
                                                <span className="preview-title">{task.title}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="preview-empty">- No active tasks -</span>
                                    )}
                                    {member.tasks?.length > 3 && <span className="more-tasks">+{member.tasks.length - 3} more</span>}
                                </div>
                            </div>
                        );
                    })}


                </div>
            </div>

            {/* Modals */}
            <MemberDetailModal
                isOpen={!!selectedMemberId}
                userId={selectedMemberId}
                onClose={() => setSelectedMemberId(null)}
                leadToken={localStorage.getItem('token')}
                onAssignTask={handleAssignTask}
            />

            {assignTaskModalOpen && (
                <CreateTaskModal
                    isOpen={assignTaskModalOpen}
                    onClose={() => setAssignTaskModalOpen(false)}
                    onCreate={handleTaskCreated}
                    projects={stats ? [{ id: stats.projectId, name: stats.projectName }] : []}
                    initialAssignee={assigneeEmail}
                />
            )}

            {inviteModalOpen && (
                <div className="pl-modal-overlay">
                    <div className="pl-modal">
                        <div className="pl-modal-header"><h3>Invite Team Member</h3></div>
                        <div className="pl-modal-body">
                            <input
                                type="text"
                                className="pl-input"
                                placeholder="Search email..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); handleSearch(e.target.value); }}
                            />
                            <div className="search-results">
                                {searchResults.map(u => (
                                    <div key={u.id} className="search-result-item">
                                        <span>{u.username} ({u.email})</span>
                                        <button className="pl-btn-sm" onClick={() => handleInvite(u.id)}>Add</button>
                                    </div>
                                ))}
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
