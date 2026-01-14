import React, { useState } from 'react';

const SprintPlanner = () => {
    // Mock Data
    const [backlog] = useState([
        { id: 'AG-105', summary: 'Update User Profile UI', type: 'Task', priority: 'Medium' },
        { id: 'AG-106', summary: 'Fix Navigation Bug on Mobile', type: 'Bug', priority: 'High' },
        { id: 'AG-107', summary: 'Add Email Notifications', type: 'Story', priority: 'Low' },
        { id: 'AG-108', summary: 'Optimize Database Queries', type: 'Task', priority: 'High' },
    ]);

    const [activeSprint] = useState([
        { id: 'AG-101', summary: 'Design Dashboard Mockups', status: 'In Progress', assignee: 'JD' },
        { id: 'AG-102', summary: 'Setup React Router', status: 'To Do', assignee: 'ME' },
    ]);

    return (
        <div className="content-scroll">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Sprint Planning</h1>
                <button className="btn-primary" style={{ width: 'auto' }}>Start Sprint</button>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr', gap: '24px' }}>

                {/* Active Sprint Section */}
                <div className="dash-card">
                    <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Active Sprint: Sprint 4</span>
                        <span style={{ fontSize: '0.8rem', color: '#5E6C84', fontWeight: 'normal' }}>Ends in 4 days</span>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #DFE1E6', textAlign: 'left' }}>
                                <th style={{ padding: '8px', fontSize: '0.8rem', color: '#5E6C84' }}>Key</th>
                                <th style={{ padding: '8px', fontSize: '0.8rem', color: '#5E6C84' }}>Summary</th>
                                <th style={{ padding: '8px', fontSize: '0.8rem', color: '#5E6C84' }}>Status</th>
                                <th style={{ padding: '8px', fontSize: '0.8rem', color: '#5E6C84' }}>Assignee</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeSprint.map(issue => (
                                <tr key={issue.id} style={{ borderBottom: '1px solid #DFE1E6' }}>
                                    <td style={{ padding: '12px 8px', color: '#0052CC', fontWeight: '600', fontSize: '0.9rem' }}>{issue.id}</td>
                                    <td style={{ padding: '12px 8px', fontSize: '0.9rem' }}>{issue.summary}</td>
                                    <td style={{ padding: '12px 8px' }}><span className="badge">{issue.status}</span></td>
                                    <td style={{ padding: '12px 8px' }}>
                                        <div className="avatar a1" style={{ width: '24px', height: '24px', fontSize: '0.7rem', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
                                            {issue.assignee}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Backlog Section */}
                <div className="dash-card">
                    <div className="card-title">Backlog <span style={{ color: '#5E6C84', fontWeight: 'normal' }}>({backlog.length} issues)</span></div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                        {backlog.map(issue => (
                            <div key={issue.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px',
                                background: '#f4f5f7',
                                borderRadius: '6px',
                                border: '1px solid #DFE1E6'
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
                                <button style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#5E6C84',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '1.2rem'
                                }}>...</button>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: '16px' }}>
                        <button className="btn-secondary" style={{ width: '100%' }}>+ Create Issue</button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SprintPlanner;
