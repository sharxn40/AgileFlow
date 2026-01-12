import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTasks, FaCheckCircle, FaExclamationCircle, FaRegClock, FaPaperclip, FaComment } from 'react-icons/fa';
import StatCard from '../components/dashboard/StatCard';
import CreateProjectModal from '../components/dashboard/CreateProjectModal';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ username: 'Alex' });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeFilter, setActiveFilter] = useState('assigned'); // assigned, completed, pending, overdue
    const [currentTime, setCurrentTime] = useState(Date.now());

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Mock Data (Deadlines are set relative to "Now" for demo purposes)
    const [myTasks] = useState([
        { id: 101, title: 'Fix Navigation Bug on Mobile', project: 'Mobile App V2', priority: 'High', status: 'In Progress', deadline: Date.now() + 3600000, isActive: true }, // +1 Hour
        { id: 102, title: 'Write API Documentation', project: 'AgileFlow Platform', priority: 'Medium', status: 'To Do', deadline: Date.now() + 86400000, isActive: false }, // +24 Hours
        { id: 103, title: 'Update User Profile Modal', project: 'AgileFlow Platform', priority: 'High', status: 'Review', deadline: Date.now() - 7200000, isActive: false }, // -2 Hours (Overdue)
        { id: 104, title: 'Design System Audit', project: 'Design System', priority: 'Low', status: 'Done', deadline: Date.now() - 172800000, isActive: false }, // Done
        { id: 105, title: 'Prepare Q4 Marketing Assets', project: 'Marketing Campaign', priority: 'Medium', status: 'To Do', deadline: Date.now() + 604800000, isActive: false }, // +1 Week
    ]);

    // Dynamic Stats Calculation
    const assignedCount = myTasks.filter(t => t.status !== 'Done').length;
    const completedCount = myTasks.filter(t => t.status === 'Done').length;
    const pendingCount = myTasks.filter(t => t.status === 'Review').length;
    const overdueCount = myTasks.filter(t => t.deadline < currentTime && t.status !== 'Done').length;

    // Stats - Clickable Filters
    const stats = [
        { key: 'assigned', label: 'Assigned to Me', value: assignedCount, icon: <FaTasks />, color: '#6366f1', trend: 4 },
        { key: 'completed', label: 'Completed Today', value: completedCount, icon: <FaCheckCircle />, color: '#10b981', trend: 2 },
        { key: 'pending', label: 'Pending Review', value: pendingCount, icon: <FaRegClock />, color: '#f59e0b', trend: 1 },
        { key: 'overdue', label: 'Overdue', value: overdueCount, icon: <FaExclamationCircle />, color: '#ef4444', trend: -1 },
    ];

    const upcomingDeadlines = [
        { id: 1, title: 'Sprint Review', time: 'Today, 4:00 PM', type: 'meeting' },
        { id: 101, title: 'Fix Navigation Bug', time: 'Today, 5:00 PM', type: 'task' },
        { id: 102, title: 'API Docs Draft', time: 'Tomorrow, 10:00 AM', type: 'task' },
    ];

    // Global Timer Tick (Updates every second to force re-render of countdowns)
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatCountdown = (deadline) => {
        const diff = deadline - currentTime;

        if (diff <= 0) return "OVERDUE";

        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
    };

    // Filter Logic
    const filteredTasks = myTasks.filter(task => {
        if (activeFilter === 'assigned') return task.status !== 'Done'; // Show all active
        if (activeFilter === 'completed') return task.status === 'Done';
        if (activeFilter === 'pending') return task.status === 'Review';
        if (activeFilter === 'overdue') return task.deadline < currentTime && task.status !== 'Done';
        return true;
    });

    return (
        <div className="dashboard-page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">{user.username}'s Dashboard</h1>
                    <p className="page-subtitle">Focus on your day, {user.username.split(' ')[0]}. Time is ticking.</p>
                </div>
            </header>

            {/* Stats Row with Filters */}
            <div className="stats-grid">
                {stats.map(({ key, ...stat }) => (
                    <StatCard
                        key={key}
                        {...stat}
                        isActive={activeFilter === key}
                        onClick={() => setActiveFilter(key)}
                    />
                ))}
            </div>

            <div className="dashboard-content-grid team-view">
                {/* Main Task List */}
                <div className="section-container main-tasks">
                    <div className="section-header">
                        <h2>{stats.find(s => s.key === activeFilter)?.label} ({filteredTasks.length})</h2>
                    </div>

                    <div className="task-list">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map(task => {
                                const isOverdue = task.deadline < currentTime && task.status !== 'Done';
                                const countdown = formatCountdown(task.deadline);

                                return (
                                    <div key={task.id} className={`task-row ${isOverdue ? 'overdue' : ''}`}>
                                        <div className="task-status-indicator" data-status={task.status}></div>
                                        <div className="task-info">
                                            <h3 className="task-title">{task.title}</h3>
                                            <span className="task-meta">{task.project} • <span className={`priority-tag ${task.priority.toLowerCase()}`}>{task.priority}</span></span>
                                        </div>

                                        <div className="task-execution">
                                            <div className={`timer-display ${isOverdue ? 'text-danger' : ''}`}>
                                                <FaRegClock /> {task.status === 'Done' ? 'Completed' : countdown}
                                            </div>
                                        </div>

                                        <div className="task-meta-right">
                                            <div className="task-collab">
                                                <span><FaComment /> 2</span>
                                                <span><FaPaperclip /> 1</span>
                                            </div>
                                            <span className={`status-badge ${task.status.toLowerCase().replace(' ', '-')}`}>{task.status}</span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="empty-state">No tasks found for this filter.</div>
                        )}
                    </div>
                </div>

                {/* Sidebar: Deadlines & Activity */}
                <div className="sidebar-col">
                    <div className="section-container deadline-panel">
                        <div className="section-header">
                            <h2>Upcoming Deadlines</h2>
                        </div>
                        <div className="deadline-list">
                            {upcomingDeadlines.map((item, i) => (
                                <div key={i} className="deadline-item">
                                    <div className="time-marker">
                                        <span className="time">{item.time.split(',')[1] || item.time}</span>
                                        <div className="line"></div>
                                    </div>
                                    <div className="event-card">
                                        <h4>{item.title}</h4>
                                        <span className="tag">{item.type}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="section-container">
                        <div className="section-header">
                            <h2>My Efficiency</h2>
                        </div>
                        <div className="efficiency-chart-placeholder">
                            <div className="chart-bar"><div className="fill" style={{ height: '60%' }}></div><span>M</span></div>
                            <div className="chart-bar"><div className="fill" style={{ height: '80%' }}></div><span>T</span></div>
                            <div className="chart-bar"><div className="fill" style={{ height: '40%' }}></div><span>W</span></div>
                            <div className="chart-bar"><div className="fill" style={{ height: '90%' }}></div><span>T</span></div>
                            <div className="chart-bar"><div className="fill" style={{ height: '75%' }}></div><span>F</span></div>
                        </div>
                        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--theme-text-muted)', marginTop: '10px' }}>
                            You are 15% more productive than last week!
                        </p>
                    </div>
                </div>
            </div>

            <CreateProjectModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={() => { }}
            />
        </div>
    );
};

export default Dashboard;
