import React, { useState } from 'react';
import CreateTaskModal from '../components/dashboard/CreateTaskModal';
import { FaEllipsisH, FaPlay } from 'react-icons/fa';

const SprintPlanner = () => {
    // Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);

    // Mock Data State
    const [backlog, setBacklog] = useState([
        { id: 'AG-105', summary: 'Update User Profile UI', type: 'Task', priority: 'Medium', assignee: 'Unassigned' },
        { id: 'AG-106', summary: 'Fix Navigation Bug on Mobile', type: 'Bug', priority: 'High', assignee: 'JD' },
        { id: 'AG-107', summary: 'Add Email Notifications', type: 'Story', priority: 'Low', assignee: 'Unassigned' },
        { id: 'AG-108', summary: 'Optimize Database Queries', type: 'Task', priority: 'High', assignee: 'DB' },
    ]);

    const [activeSprint, setActiveSprint] = useState([
        { id: 'AG-101', summary: 'Design Dashboard Mockups', type: 'Task', priority: 'High', status: 'In Progress', assignee: 'JD' },
        { id: 'AG-102', summary: 'Setup React Router', type: 'Task', priority: 'Medium', status: 'To Do', assignee: 'ME' },
    ]);

    const handleCreateIssue = (formData) => {
        const newIssue = {
            id: `AG-${109 + backlog.length + activeSprint.length}`, // Simple ID generation
            summary: formData.title,
            type: formData.tag || 'Task',
            priority: formData.priority,
            assignee: formData.assignee || 'Unassigned',
            status: 'To Do'
        };
        setBacklog([...backlog, newIssue]);
        setIsCreateModalOpen(false);
    };

    const handleMoveToSprint = (issueId) => {
        const issueToMove = backlog.find(i => i.id === issueId);
        if (issueToMove) {
            setBacklog(backlog.filter(i => i.id !== issueId));
            setActiveSprint([...activeSprint, { ...issueToMove, status: 'To Do' }]);
        }
        setOpenMenuId(null);
    };

    const handleMoveToBacklog = (issueId) => {
        const issueToMove = activeSprint.find(i => i.id === issueId);
        if (issueToMove) {
            setActiveSprint(activeSprint.filter(i => i.id !== issueId));
            setBacklog([...backlog, issueToMove]);
        }
        setOpenMenuId(null);
    };

    const handleStartSprint = () => {
        alert(`Starting Sprint with ${activeSprint.length} issues!`);
    };

    const toggleMenu = (id) => {
        if (openMenuId === id) {
            setOpenMenuId(null);
        } else {
            setOpenMenuId(id);
        }
    };

    // Close menu when clicking outside could be added here, 
    // but for simplicity we'll just toggle.

    return (
        <div className="content-scroll" onClick={() => setOpenMenuId(null)}>
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Sprint Planning</h1>
                <button
                    className="btn-primary"
                    style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={handleStartSprint}
                >
                    <FaPlay style={{ fontSize: '0.8rem' }} /> Start Sprint
                </button>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr)', gap: '24px' }}>

                {/* Active Sprint Section */}
                <div className="dash-card">
                    <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Active Sprint: Sprint 4</span>
                        <span style={{ fontSize: '0.8rem', color: '#5E6C84', fontWeight: 'normal' }}>Ends in 4 days</span>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px', tableLayout: 'auto' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #DFE1E6', textAlign: 'left' }}>
                                    <th style={{ padding: '8px', fontSize: '0.8rem', color: '#5E6C84', width: '80px' }}>Key</th>
                                    <th style={{ padding: '8px', fontSize: '0.8rem', color: '#5E6C84' }}>Summary</th>
                                    <th style={{ padding: '8px', fontSize: '0.8rem', color: '#5E6C84', width: '100px' }}>Status</th>
                                    <th style={{ padding: '8px', fontSize: '0.8rem', color: '#5E6C84', width: '80px' }}>Assignee</th>
                                    <th style={{ padding: '8px', width: '40px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeSprint.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#6B778C' }}>
                                            Sprint is empty. Move issues from backlog here.
                                        </td>
                                    </tr>
                                ) : (
                                    activeSprint.map(issue => (
                                        <tr key={issue.id} style={{ borderBottom: '1px solid #DFE1E6' }}>
                                            <td style={{ padding: '12px 8px', color: '#0052CC', fontWeight: '600', fontSize: '0.9rem' }}>{issue.id}</td>
                                            <td style={{ padding: '12px 8px', fontSize: '0.9rem' }}>{issue.summary}</td>
                                            <td style={{ padding: '12px 8px' }}><span className="badge">{issue.status}</span></td>
                                            <td style={{ padding: '12px 8px' }}>
                                                <div className="avatar a1" style={{ width: '24px', height: '24px', fontSize: '0.7rem', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
                                                    {issue.assignee?.substring(0, 2).toUpperCase()}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 8px', position: 'relative' }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleMenu(issue.id); }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5E6C84' }}
                                                >
                                                    <FaEllipsisH />
                                                </button>
                                                {openMenuId === issue.id && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        right: '10px',
                                                        top: '35px',
                                                        background: 'white',
                                                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                                        borderRadius: '4px',
                                                        zIndex: 10,
                                                        border: '1px solid #DFE1E6',
                                                        minWidth: '140px'
                                                    }}>
                                                        <div
                                                            onClick={() => handleMoveToBacklog(issue.id)}
                                                            style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.9rem', color: '#172B4D' }}
                                                            className="menu-item"
                                                        >
                                                            Move to Backlog
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Backlog Section */}
                <div className="dash-card">
                    <div className="card-title">Backlog <span style={{ color: '#5E6C84', fontWeight: 'normal' }}>({backlog.length} issues)</span></div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                        {backlog.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#6B778C', border: '2px dashed #DFE1E6', borderRadius: '6px' }}>
                                Backlog is empty. Create new issues to get started.
                            </div>
                        ) : (
                            backlog.map(issue => (
                                <div key={issue.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px',
                                    background: 'white',
                                    borderRadius: '6px',
                                    border: '1px solid #DFE1E6',
                                    position: 'relative'
                                }}>
                                    <span style={{ width: '80px', color: '#5E6C84', fontWeight: '600', fontSize: '0.85rem' }}>{issue.id}</span>
                                    <span style={{ flex: 1, fontWeight: '500', color: '#172B4D' }}>{issue.summary}</span>

                                    <span className={`badge ${issue.priority === 'High' ? 'red' : 'blue'}`} style={{
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        background: issue.priority === 'High' ? '#FFEBE6' : '#DEEBFF',
                                        color: issue.priority === 'High' ? '#DE350B' : '#0052CC',
                                        marginRight: '12px'
                                    }}>
                                        {issue.priority}
                                    </span>

                                    <div style={{ position: 'relative' }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleMenu(issue.id); }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#5E6C84',
                                                cursor: 'pointer',
                                                fontSize: '1rem',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <FaEllipsisH />
                                        </button>

                                        {openMenuId === issue.id && (
                                            <div style={{
                                                position: 'absolute',
                                                right: '0',
                                                top: '100%',
                                                marginTop: '4px',
                                                background: 'white',
                                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                                borderRadius: '4px',
                                                zIndex: 10,
                                                border: '1px solid #DFE1E6',
                                                minWidth: '140px'
                                            }}>
                                                <div
                                                    onClick={() => handleMoveToSprint(issue.id)}
                                                    style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.9rem', color: '#172B4D' }}
                                                    className="menu-item"
                                                >
                                                    Move to Sprint
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div style={{ marginTop: '16px' }}>
                        <button
                            className="btn-secondary"
                            style={{ width: '100%' }}
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            + Create Issue
                        </button>
                    </div>
                </div>

            </div>

            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateIssue}
            />
        </div>
    );
};

export default SprintPlanner;
