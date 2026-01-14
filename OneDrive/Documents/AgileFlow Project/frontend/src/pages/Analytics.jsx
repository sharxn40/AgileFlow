import React from 'react';
// import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Analytics = () => {

    // Mock Data for Burndown
    const burndownData = [
        { day: 'Day 1', ideal: 100, remaining: 100 },
        { day: 'Day 2', ideal: 90, remaining: 95 },
        { day: 'Day 3', ideal: 80, remaining: 85 },
        { day: 'Day 4', ideal: 70, remaining: 80 },
        { day: 'Day 5', ideal: 60, remaining: 65 },
        { day: 'Day 6', ideal: 50, remaining: 45 },
        { day: 'Day 7', ideal: 40, remaining: 30 },
        { day: 'Day 8', ideal: 30, remaining: 30 },
        { day: 'Day 9', ideal: 20, remaining: 15 },
        { day: 'Day 10', ideal: 10, remaining: 5 },
    ];

    // Mock Data for Velocity
    const velocityData = [
        { sprint: 'Sprint 1', commitment: 40, completed: 35 },
        { sprint: 'Sprint 2', commitment: 45, completed: 42 },
        { sprint: 'Sprint 3', commitment: 50, completed: 48 },
        { sprint: 'Sprint 4', commitment: 50, completed: 25 }, // Current
    ];

    return (
        <div className="content-scroll">
            <div className="dashboard-header">
                <h1>Project Analytics</h1>
            </div>

            <div className="dashboard-grid">

                {/* Burndown Chart */}
                <div className="dash-card" style={{ gridColumn: 'span 2' }}>
                    <div className="card-title">Sprint Burndown Chart</div>
                    <div style={{ height: 350, marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f5f7' }}>
                        <p>Chart Disabled (Recharts not compatible with React 19)</p>
                        {/* <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={burndownData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DFE1E6" />
                                <XAxis dataKey="day" stroke="#5E6C84" tick={{fontSize: 12}} />
                                <YAxis stroke="#5E6C84" tick={{fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} 
                                />
                                <Legend />
                                <Line type="monotone" dataKey="remaining" name="Remaining Effort" stroke="#FF5630" strokeWidth={3} activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="ideal" name="Ideal Burn" stroke="#0052CC" strokeDasharray="5 5" />
                            </LineChart>
                        </ResponsiveContainer> */}
                    </div>
                </div>

                {/* Velocity Chart */}
                <div className="dash-card" style={{ gridColumn: 'span 1' }}>
                    <div className="card-title">Velocity Tracking</div>
                    <div style={{ height: 300, marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f5f7' }}>
                        <p>Chart Disabled</p>
                        {/* <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={velocityData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DFE1E6" />
                                <XAxis dataKey="sprint" stroke="#5E6C84" tick={{fontSize: 10}} />
                                <YAxis stroke="#5E6C84" tick={{fontSize: 12}} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '6px' }} />
                                <Legend />
                                <Bar dataKey="commitment" name="Commitment" fill="#DFE1E6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="completed" name="Completed" fill="#36B37E" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer> */}
                    </div>
                </div>

                {/* Issue Summary Pie Chart Placeholder */}
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

            </div>
        </div>
    );
};

export default Analytics;
