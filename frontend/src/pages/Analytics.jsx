import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Analytics = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [velocityData, setVelocityData] = useState([]);
    const [burndownData, setBurndownData] = useState([]);
    const [activityData, setActivityData] = useState([]);
    const [activeSprint, setActiveSprint] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. Fetch Projects on Mount
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:3000/api/projects', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setProjects(data);
                    if (data.length > 0) {
                        setSelectedProjectId(data[0].id);
                    }
                }
            } catch (error) {
                console.error("Failed to load projects", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    // 2. Fetch Data when Project Selected
    useEffect(() => {
        if (!selectedProjectId) return;

        const fetchData = async () => {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            try {
                // A. Velocity Data
                const velocityRes = await fetch(`http://localhost:3000/api/sprints/${selectedProjectId}/velocity`, { headers });
                if (velocityRes.ok) {
                    const vData = await velocityRes.json();
                    setVelocityData(vData);
                }

                // B. Active Sprint & Burndown
                const activeRes = await fetch(`http://localhost:3000/api/sprints/active?projectId=${selectedProjectId}`, { headers });
                if (activeRes.ok) {
                    const sprint = await activeRes.json();
                    if (sprint) {
                        setActiveSprint(sprint);
                        const burndownRes = await fetch(`http://localhost:3000/api/sprints/${sprint.id}/burndown`, { headers });
                        if (burndownRes.ok) {
                            const bData = await burndownRes.json();
                            setBurndownData(bData);
                        }
                    } else {
                        setActiveSprint(null);
                        setBurndownData([]);
                    }
                }

                // C. Recent Activity
                const activityRes = await fetch(`http://localhost:3000/api/projects/${selectedProjectId}/activity`, { headers });
                if (activityRes.ok) {
                    const aData = await activityRes.json();
                    setActivityData(aData);
                }

            } catch (error) {
                console.error("Analytics fetch error", error);
            }
        };

        fetchData();
    }, [selectedProjectId]);

    if (loading) return <div style={{ padding: '2rem' }}>Loading analytics...</div>;

    return (
        <div className="content-scroll">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Project Analytics</h1>

                {/* Project Selector */}
                {projects.length > 0 && (
                    <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: '1px solid #DFE1E6',
                            fontSize: '1rem',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                )}
            </div>

            <div className="dashboard-grid">

                {/* --- TOP ROW STATS --- */}
                <div className="dash-card" style={{ gridColumn: 'span 3', display: 'flex', gap: '2rem', justifyContent: 'space-around', alignItems: 'center', padding: '2rem', minHeight: '140px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ fontSize: '2.5rem', margin: 0, color: '#0052CC' }}>{activeSprint ? activeSprint.stats?.total || 0 : '-'}</h3>
                        <span style={{ color: '#5E6C84' }}>Active Sprint Tasks</span>
                    </div>
                    <div style={{ width: '1px', height: '40px', background: '#DFE1E6' }}></div>
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ fontSize: '2.5rem', margin: 0, color: '#36B37E' }}>{activeSprint ? activeSprint.stats?.completed || 0 : '-'}</h3>
                        <span style={{ color: '#5E6C84' }}>Completed</span>
                    </div>
                    <div style={{ width: '1px', height: '40px', background: '#DFE1E6' }}></div>
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ fontSize: '2.5rem', margin: 0, color: '#FF5630' }}>{activeSprint ? (activeSprint.stats?.total - activeSprint.stats?.completed) : '-'}</h3>
                        <span style={{ color: '#5E6C84' }}>Remaining</span>
                    </div>
                </div>

                {/* Burndown Chart */}
                <div className="dash-card" style={{ gridColumn: 'span 2' }}>
                    <div className="card-title">
                        {activeSprint ? `Burndown: ${activeSprint.name}` : 'No Active Sprint'}
                    </div>

                    {activeSprint && burndownData.length > 0 ? (
                        <div style={{ height: 350, marginTop: '20px', background: '#fff' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={burndownData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DFE1E6" />
                                    <XAxis dataKey="day" stroke="#5E6C84" tick={{ fontSize: 12 }} />
                                    <YAxis stroke="#5E6C84" tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="remaining" name="Remaining Effort" stroke="#FF5630" strokeWidth={3} activeDot={{ r: 8 }} />
                                    <Line type="monotone" dataKey="ideal" name="Ideal Burn" stroke="#0052CC" strokeDasharray="5 5" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B778C' }}>
                            {activeSprint ? 'No data yet for this sprint.' : 'Start a sprint to see the burndown chart.'}
                        </div>
                    )}

                </div>

                {/* Velocity Chart */}
                <div className="dash-card" style={{ gridColumn: 'span 1' }}>
                    <div className="card-title">Velocity Tracking</div>
                    {velocityData.length > 0 ? (
                        <div style={{ height: 300, marginTop: '20px', background: '#fff' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={velocityData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DFE1E6" />
                                    <XAxis dataKey="sprint" stroke="#5E6C84" tick={{ fontSize: 10 }} />
                                    <YAxis stroke="#5E6C84" tick={{ fontSize: 12 }} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '6px' }} />
                                    <Legend />
                                    <Bar dataKey="commitment" name="Commitment" fill="#DFE1E6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="completed" name="Completed" fill="#36B37E" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B778C' }}>
                            No closed sprints yet.
                        </div>
                    )}
                </div>

                {/* Issue Summary Pie Chart Placeholder (Static for now as requested) */}
                <div className="dash-card" style={{ gridColumn: 'span 1' }}>
                    <div className="card-title">Issue Distribution</div>
                    <div style={{ height: 300, marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {/* Simple CSS Donut Chart */}
                        <div style={{
                            width: '180px', height: '180px', borderRadius: '50%',
                            background: 'conic-gradient(#0052CC 0% 40%, #FF5630 40% 70%, #36B37E 70% 100%)',
                            position: 'relative',
                            display: 'flex', justifyContent: 'center', alignItems: 'center'
                        }}>
                            <div style={{
                                width: '120px', height: '120px', background: 'white', borderRadius: '50%',
                                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
                            }}>
                                <h2 style={{ margin: 0, fontSize: '2rem' }}>42</h2>
                                <span style={{ fontSize: '0.8rem', color: '#6B778C' }}>Issues</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 8, height: 8, background: '#0052CC', borderRadius: '50%' }} /> Tasks (40%)</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 8, height: 8, background: '#FF5630', borderRadius: '50%' }} /> Bugs (30%)</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 8, height: 8, background: '#36B37E', borderRadius: '50%' }} /> Stories (30%)</div>
                    </div>
                </div>

                {/* Recent Activity Table */}
                <div className="dash-card" style={{ gridColumn: 'span 2' }}>
                    <div className="card-title">Recent Activity</div>
                    {activityData.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #DFE1E6', textAlign: 'left' }}>
                                    <th style={{ padding: '10px', color: '#5E6C84', fontSize: '0.85rem' }}>User</th>
                                    <th style={{ padding: '10px', color: '#5E6C84', fontSize: '0.85rem' }}>Action</th>
                                    <th style={{ padding: '10px', color: '#5E6C84', fontSize: '0.85rem' }}>Item</th>
                                    <th style={{ padding: '10px', color: '#5E6C84', fontSize: '0.85rem' }}>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activityData.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #EBECF0' }}>
                                        <td style={{ padding: '12px 10px', fontWeight: '500' }}>{row.user}</td>
                                        <td style={{ padding: '12px 10px', color: '#5E6C84' }}>{row.action}</td>
                                        <td style={{ padding: '12px 10px', color: '#0052CC' }}>{row.item}</td>
                                        <td style={{ padding: '12px 10px', color: '#97A0AF', fontSize: '0.85rem' }}>{row.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#6B778C' }}>
                            No recent activity found.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Analytics;
