import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import { FaTasks, FaCheckCircle, FaExclamationCircle, FaRegClock, FaProjectDiagram, FaPlus, FaCalendarAlt, FaUserPlus } from 'react-icons/fa';
import StatCard from '../components/dashboard/StatCard';
import CreateProjectModal from '../components/dashboard/CreateProjectModal';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import './Dashboard.css';

import IssueDetailDrawer from '../components/dashboard/IssueDetailDrawer';
import CreateTaskModal from '../components/dashboard/CreateTaskModal';
import InlineStatusDropdown from '../components/dashboard/InlineStatusDropdown';
import InviteMemberModal from '../components/project/InviteMemberModal';
import PersonalKanban from '../components/dashboard/PersonalKanban';
import Analytics from './Analytics'; // Import Analytics
import BacklogView from '../components/BacklogView'; // Import BacklogView
import TimelineView from '../components/dashboard/TimelineView';
import MyEarnings from './MyEarnings';

const Dashboard = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [myIssues, setMyIssues] = useState([]);
    const [filteredIssues, setFilteredIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
    const [showCreateIssueModal, setShowCreateIssueModal] = useState(false);

    // Invite Modal State
    const [inviteProject, setInviteProject] = useState(null);

    // Drawer State
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Filters State
    const [filters, setFilters] = useState({ priority: [], status: [], projectId: [] });
    // Board View State
    const [selectedBoardProject, setSelectedBoardProject] = useState('');

    const { currentView } = useOutletContext(); // Provided by Layout

    const [user] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('user')) || { username: 'User' };
        } catch {
            return { username: 'User' };
        }
    });


    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { 'Authorization': `Bearer ${token}` };

                // Force fresh fetch by adding timestamp
                const [projectsRes, tasksRes] = await Promise.all([
                    fetch(`http://localhost:3000/api/projects?t=${Date.now()}`, { headers }),
                    fetch(`http://localhost:3000/api/issues/my-issues?t=${Date.now()}`, { headers })
                ]);

                if (projectsRes.ok) {
                    const data = await projectsRes.json();
                    setProjects(data);
                    if (data.length > 0 && !selectedBoardProject) {
                        setSelectedBoardProject(data[0].id);
                    }
                }

                if (tasksRes.ok) {
                    const tasks = await tasksRes.json();
                    setMyIssues(tasks);
                    setFilteredIssues(tasks);
                }

            } catch (error) {
                console.error("Dashboard load failed", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [currentView, selectedBoardProject]);

    // Filter Logic
    useEffect(() => {
        let result = myIssues;
        if (filters.priority.length > 0) {
            result = result.filter(issue => filters.priority.includes(issue.priority));
        }
        if (filters.status.length > 0) {
            result = result.filter(issue => filters.status.includes(issue.status));
        }
        setFilteredIssues(result);
    }, [filters, myIssues]);

    const handleIssueClick = (issue) => {
        setSelectedIssue(issue);
        setIsDrawerOpen(true);
    };

    const handleIssueUpdate = async (updatedIssue) => {
        const updatedList = myIssues.map(i => i.id === updatedIssue.id ? updatedIssue : i);
        setMyIssues(updatedList);
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:3000/api/issues/${updatedIssue.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(updatedIssue)
            });
        } catch (error) {
            console.error("Failed to save issue update:", error);
        }
    };

    const handleFilterChange = (newFilters) => setFilters(newFilters);

    const handleKanbanDrag = async (id, newStatus) => {
        setMyIssues(prev => prev.map(issue => issue.id === id ? { ...issue, status: newStatus } : issue));
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:3000/api/issues/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (error) {
            console.error("Status update failed:", error);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        setMyIssues(prev => prev.map(issue => issue.id === id ? { ...issue, status: newStatus } : issue));
    };

    const handleCreateProject = async (newProject) => setProjects(prev => [newProject, ...prev]);

    const handleCreateGlobalIssue = async (taskData) => {
        try {
            const token = localStorage.getItem('token');
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const assigneeId = taskData.assigneeId || currentUser.id || currentUser._id;
            const payload = { ...taskData, assigneeId, reporterId: currentUser.id || currentUser._id, status: 'To Do' };
            const res = await fetch('http://localhost:3000/api/issues', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const newIssue = await res.json();
                if (assigneeId === (currentUser.id || currentUser._id)) {
                    setMyIssues(prev => [{ ...newIssue, assignee: { username: currentUser.username } }, ...prev]);
                }
                setShowCreateIssueModal(false);
            }
        } catch (error) {
            console.error("Failed to create issue:", error);
        }
    };

    const doneIssues = myIssues.filter(i => i.status === 'Done');
    const dueSoonIssues = myIssues.filter(i => {
        if (!i.dueDate || i.status === 'Done') return false;
        const diffDays = Math.ceil((new Date(i.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 3;
    });

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const doneThisWeek = myIssues.filter(i => i.status === 'Done' && new Date(i.updatedAt) >= oneWeekAgo).length;
    const doneLastWeek = myIssues.filter(i => i.status === 'Done' && new Date(i.updatedAt) >= twoWeeksAgo && new Date(i.updatedAt) < oneWeekAgo).length;
    const weeklyDiff = doneThisWeek - doneLastWeek;
    const weeklyTrend = weeklyDiff >= 0 ? `+${weeklyDiff}` : `${weeklyDiff}`;
    const pendingCount = myIssues.length - doneIssues.length;


    return (
        <div className="dashboard-page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">
                        My Workspace
                        <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#6B778C', marginLeft: '12px' }}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </span>
                    </h1>
                    <p className="page-subtitle">Welcome back, {user.username.split(' ')[0]}. Here is your daily overview.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary" onClick={() => setShowCreateIssueModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '8px', border: 'none', background: 'white', color: '#0052CC', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <FaPlus /> Create Issue
                    </button>
                    <button className="btn-primary" onClick={() => setShowCreateProjectModal(true)}>
                        <FaPlus /> Create Project
                    </button>
                </div>
            </header>

            {currentView === 'overview' && (
                <div className="stats-overview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                    <StatCard
                        label="Total Tasks"
                        value={myIssues.length}
                        icon={<FaTasks />}
                        color="blue"
                        trend={`${pendingCount} Pending`}
                        trendLabel="remaining"
                        trendUp={true}
                    />
                    <StatCard
                        label="Completed (7 Days)"
                        value={doneThisWeek}
                        icon={<FaCheckCircle />}
                        color="green"
                        trend={`${weeklyTrend}`}
                        trendLabel="vs previous week"
                        trendUp={weeklyDiff >= 0}
                    />
                    <StatCard
                        label="Due Soon"
                        value={dueSoonIssues.length}
                        icon={<FaCalendarAlt />}
                        color="orange"
                        trend={dueSoonIssues.length > 0 ? "Action Required" : "On Track"}
                        trendLabel={dueSoonIssues.length > 0 ? "deadlines approaching" : "no urgent issues"}
                        trendUp={dueSoonIssues.length === 0}
                    />
                </div>
            )}

            {currentView === 'overview' && <DashboardFilters projects={projects} onFilterChange={handleFilterChange} />}

            {currentView === 'analytics' ? (
                <Analytics />
            ) : currentView === 'earnings' ? (
                <MyEarnings />
            ) : (
                <div className="dashboard-content-grid">
                    {/* Main Content Area */}
                    <div className="section-container" style={{ flex: 2 }}>
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2>
                                {currentView === 'board' ? 'Project Board' :
                                    currentView === 'backlog' ? 'Project Backlog' :
                                        `Workspace Activity (${filteredIssues.length})`}
                            </h2>

                            {(currentView === 'board' || currentView === 'backlog') && projects.length > 0 && (
                                <select
                                    value={selectedBoardProject}
                                    onChange={(e) => setSelectedBoardProject(e.target.value)}
                                    className="project-select"
                                >
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="task-content-area" style={{ minHeight: '400px' }}>
                            {currentView === 'board' ? (
                                <PersonalKanban
                                    issues={filteredIssues.filter(i => i.projectId === selectedBoardProject)}
                                    onStatusChange={handleKanbanDrag}
                                />
                            ) : currentView === 'backlog' ? (
                                <BacklogView projectId={selectedBoardProject} />
                            ) : currentView === 'timeline' ? (
                                <TimelineView
                                    issues={filteredIssues}
                                    startDate={new Date()}
                                    endDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                                />
                            ) : (
                                <div className="task-list">
                                    {filteredIssues.length > 0 ? (
                                        filteredIssues.map(issue => {
                                            const project = projects.find(p => p.id === issue.projectId);
                                            return (
                                                <div key={issue.id} className="task-row" onClick={() => handleIssueClick(issue)}>
                                                    <div className="task-info">
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span className="task-key">{issue.issueId || 'TASK'}</span>
                                                            {project && <span className="project-badge-mini" style={{ fontSize: '0.7rem', background: '#EAE6FF', color: '#403294', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>{project.key || project.name.substring(0, 3).toUpperCase()}</span>}
                                                        </div>
                                                        <span className="task-title">{issue.title}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                        <span className={`priority-badge ${issue.priority?.toLowerCase()}`}>{issue.priority}</span>
                                                        <InlineStatusDropdown issue={issue} onStatusChange={handleStatusChange} />
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="empty-state">No issues match your filters.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="section-container" style={{ flex: 1, display: currentView === 'board' ? 'none' : 'block' }}>
                        <div className="section-header"><h2>Quick Access</h2></div>
                        <div className="projects-list-mini">
                            {projects.slice(0, 5).map(project => (
                                <div key={project.id} className="project-item-mini" onClick={() => navigate(`/project/${project.id}`)} style={{ padding: '12px', borderBottom: '1px solid #ebecf0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div className="project-icon-mini" style={{ width: 32, height: 32, background: '#0052CC', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem' }}>{project.key.substring(0, 2)}</div>
                                        <div>
                                            <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#172B4D' }}>{project.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#6B778C' }}>{project.key}</div>
                                        </div>
                                    </div>
                                    <button
                                        className="btn-icon-only"
                                        title="Invite Member"
                                        onClick={(e) => { e.stopPropagation(); setInviteProject(project); }}
                                    >
                                        <FaUserPlus />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <CreateProjectModal
                isOpen={showCreateProjectModal}
                onClose={() => setShowCreateProjectModal(false)}
                onCreate={handleCreateProject}
            />

            <CreateTaskModal
                isOpen={showCreateIssueModal}
                onClose={() => setShowCreateIssueModal(false)}
                onCreate={handleCreateGlobalIssue}
                projects={projects}
            />

            <IssueDetailDrawer
                isOpen={isDrawerOpen}
                issue={selectedIssue}
                onClose={() => setIsDrawerOpen(false)}
                onUpdate={handleIssueUpdate}
            />

            <InviteMemberModal
                isOpen={!!inviteProject}
                onClose={() => setInviteProject(null)}
                projectId={inviteProject?.id}
            />
        </div>
    );
};

export default Dashboard;
