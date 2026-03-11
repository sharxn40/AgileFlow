import API_BASE_URL from '../config.js';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import { FaTasks, FaCheckCircle, FaExclamationCircle, FaRegClock, FaProjectDiagram, FaPlus, FaCalendarAlt, FaUserPlus } from 'react-icons/fa';
import { MdArrowForward, MdVideocam, MdAdjust, MdChevronLeft, MdChevronRight } from 'react-icons/md';
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

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [calendarMonth, setCalendarMonth] = useState(new Date());

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
                    fetch(`${API_BASE_URL}/api/projects?t=${Date.now()}`, { headers }),
                    fetch(`${API_BASE_URL}/api/issues/my-issues?t=${Date.now()}`, { headers })
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

    const handleIssueClick = async (issue) => {
        setIsDrawerOpen(true);
        setSelectedIssue(issue); // Set immediately for fast UI response

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/issues/${issue.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const fullIssue = await res.json();
                setSelectedIssue(fullIssue); // Override with full details (including resolved assignee)
            }
        } catch (error) {
            console.error("Failed to fetch full issue details:", error);
        }
    };

    const handleIssueUpdate = async (updatedIssue) => {
        const updatedList = myIssues.map(i => i.id === updatedIssue.id ? updatedIssue : i);
        setMyIssues(updatedList);
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_BASE_URL}/api/issues/${updatedIssue.id}`, {
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
            await fetch(`${API_BASE_URL}/api/issues/${id}`, {
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
            const res = await fetch(`${API_BASE_URL}/api/issues`, {
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

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Calculate Agenda and Current Focus based on real issues
    const upcomingIssues = filteredIssues
        .filter(i => i.status !== 'Done')
        .sort((a, b) => {
            const dateA = a.dueDate ? new Date(a.dueDate).getTime() : new Date(a.createdAt).getTime();
            const dateB = b.dueDate ? new Date(b.dueDate).getTime() : new Date(b.createdAt).getTime();
            return dateA - dateB;
        });

    const currentFocusIssue = upcomingIssues.length > 0 ? upcomingIssues[0] : null;

    const selectedDateStr = selectedDate.toDateString();
    const agendaIssues = filteredIssues.filter(i => {
        const issueDate = i.dueDate ? new Date(i.dueDate) : new Date(i.createdAt || Date.now());
        return issueDate.toDateString() === selectedDateStr;
    }).sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : new Date(a.createdAt).getTime();
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : new Date(b.createdAt).getTime();
        return dateA - dateB;
    });

    const renderCalendarDays = () => {
        const days = [];
        const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        labels.forEach(l => days.push(<div key={`label-${l}`} className="mini-calendar-day-label">{l}</div>));

        const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
        const firstDayOfMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay();

        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`}></div>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), i).toDateString();
            const isSelected = selectedDate.toDateString() === dateStr;
            const isToday = new Date().toDateString() === dateStr;
            days.push(
                <div
                    key={`day-${i}`}
                    className={`mini-calendar-date ${isSelected ? 'active' : ''}`}
                    style={isToday && !isSelected ? { border: '2px solid #5d5fef', color: '#5d5fef' } : {}}
                    onClick={() => setSelectedDate(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), i))}
                >
                    {i}
                </div>
            );
        }
        return days;
    };


    return (
        <div className="dashboard-page">
            {currentView === 'overview' ? (
                <>
                    <header className="greeting-header">
                        <div>
                            <div className="greeting-date">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </div>
                            <h1 className="greeting-title">
                                {getGreeting()}, <span>{user.username.split(' ')[0]}</span>
                            </h1>
                        </div>
                    </header>

                    <div className="incial-dashboard-grid">
                        <div className="incial-main-column">
                            {/* Current Focus Widget */}
                            <div className="incial-glass-card" style={{ position: 'relative' }}>
                                <div className="meeting-soon-badge">{currentFocusIssue ? (currentFocusIssue.priority || 'Action Info') : 'All Clear'}</div>
                                <div className="focus-header">
                                    <MdAdjust className="focus-header-icon" /> Current Focus
                                </div>
                                <div className="current-focus-card">
                                    {currentFocusIssue ? (
                                        <>
                                            <div className="focus-details-wrapper">
                                                <div className="focus-icon-box">
                                                    <FaTasks style={{ fontSize: '1.2rem' }} />
                                                </div>
                                                <div className="focus-info">
                                                    <h4 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>{currentFocusIssue.title}</h4>
                                                    <p><FaRegClock /> {currentFocusIssue.dueDate
                                                        ? new Date(currentFocusIssue.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                        : 'No deadline set'} &nbsp;&bull;&nbsp; {currentFocusIssue.status}</p>
                                                </div>
                                            </div>
                                            <button className="join-now-btn" onClick={() => handleIssueClick(currentFocusIssue)}>
                                                View Task <MdArrowForward />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="focus-details-wrapper">
                                            <div className="focus-info">
                                                <h4>No immediate tasks pending!</h4>
                                                <p>Take a break or review your backlog.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="incial-glass-card">
                                <div className="focus-header">Your Queue</div>
                                <div className="queue-list">
                                    {filteredIssues.length > 0 ? (
                                        filteredIssues.slice(0, 5).map(issue => {
                                            const isDone = issue.status === 'Done';
                                            const badgeClass =
                                                issue.status === 'In Review' ? 'queue-badge-review' :
                                                    issue.priority === 'High' ? 'queue-badge-high' :
                                                        issue.priority === 'Medium' ? 'queue-badge-medium' :
                                                            'queue-badge-low';
                                            const displayBadge = issue.status === 'In Review' ? 'In Review' : issue.priority || 'Low';

                                            // Format due date or created date
                                            const displayTime = issue.dueDate
                                                ? new Date(issue.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : new Date(issue.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                            return (
                                                <div key={issue.id} className="queue-item" onClick={() => handleIssueClick(issue)}>
                                                    <div className="queue-item-left">
                                                        <div
                                                            className={`queue-item-radio ${isDone ? 'done' : ''}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleKanbanDrag(issue.id, isDone ? 'To Do' : 'Done');
                                                            }}
                                                        ></div>
                                                        <div className="queue-item-info">
                                                            <h5>{issue.title}</h5>
                                                            <p>{displayTime}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`queue-item-badge ${badgeClass}`}>
                                                        {displayBadge}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="empty-state" style={{ background: 'transparent', border: 'none' }}>Your queue is empty. Relax!</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="incial-right-column">
                            {/* Calendar & Agenda */}
                            <div className="incial-glass-card">
                                <div className="mini-calendar-header">
                                    {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    <div className="mini-calendar-nav">
                                        <MdChevronLeft onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} />
                                        <MdChevronRight onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} />
                                    </div>
                                </div>
                                <div className="mini-calendar-grid">
                                    {renderCalendarDays()}
                                </div>

                                <div className="agenda-section">
                                    <div className="agenda-header">Agenda for {selectedDate.getDate()} {selectedDate.toLocaleString('default', { month: 'short' })}</div>
                                    {agendaIssues.length > 0 ? (
                                        agendaIssues.map(issue => {
                                            const timeStr = issue.dueDate
                                                ? new Date(issue.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : new Date(issue.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                            return (
                                                <div key={issue.id} className="agenda-item" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }} onClick={() => handleIssueClick(issue)}>
                                                    <div className="agenda-time">{timeStr}</div>
                                                    <div className="agenda-details" style={{ overflow: 'hidden', flex: 1 }}>
                                                        <h6 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{issue.title}</h6>
                                                        <p>{issue.status} • {issue.priority}</p>
                                                    </div>
                                                    {issue.type === 'Meeting' && issue.description?.includes('http') && (
                                                        <button
                                                            className="btn-join-meeting"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const urlMatch = issue.description.match(/(https?:\/\/[^\s]+)/);
                                                                if (urlMatch) window.open(urlMatch[0], '_blank');
                                                            }}
                                                            style={{
                                                                padding: '6px 12px',
                                                                background: '#10b981',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '600',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            <MdVideocam size={16} /> Join
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div style={{ color: '#7a869a', fontSize: '0.85rem' }}>No tasks scheduled for this date.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <header className="page-header">
                    <div>
                        <h1 className="page-title">
                            {currentView === 'board' ? 'Project Board' :
                                currentView === 'timeline' ? 'Timeline' :
                                    currentView === 'analytics' ? 'Analytics' :
                                        currentView === 'teams' ? 'Registry' :
                                            currentView === 'earnings' ? 'Earnings Vault' : 'Workspace View'}
                        </h1>
                        <p className="page-subtitle">Manage your workflow and track progress.</p>
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
            )}

            {currentView === 'overview' && <div id="old-filters-injection-point" style={{ display: 'none' }}> <DashboardFilters projects={projects} onFilterChange={handleFilterChange} /> </div>}

            {currentView === 'analytics' ? (
                <Analytics />
            ) : currentView === 'earnings' ? (
                <MyEarnings />
            ) : currentView !== 'overview' && (
                <div className="dashboard-content-grid">
                    {/* Main Content Area */}
                    <div className="section-container" style={{ flex: 2 }}>
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2>
                                {currentView === 'board' ? 'Project Board' :
                                    `Workspace Activity (${filteredIssues.length})`}
                            </h2>

                            {(currentView === 'board') && projects.length > 0 && (
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
                projects={projects}
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


