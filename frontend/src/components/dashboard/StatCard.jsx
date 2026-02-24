import React from 'react';
import './StatCard.css';

const StatCard = ({ icon, label, value, trend, trendLabel, trendUp, color, onClick, isActive }) => {
    return (
        <div
            className={`stat-card ${isActive ? 'active' : ''}`}
            onClick={onClick}
            style={{ '--card-accent': color }} // Using a variable we can use in CSS if needed, though mostly using theme vars now
        >
            <div className="stat-header">
                <span className="stat-label">{label}</span>
                <div className="stat-icon-bg">
                    {icon}
                </div>
            </div>
            <div className="stat-value">{value}</div>

            {(trend || label) && (
                <div className={`stat-trend ${trendUp ? 'positive' : 'negative'}`}>
                    <span style={{ fontWeight: 600 }}>{trend}</span>
                    {trendLabel && <span className="trend-label" style={{ marginLeft: '4px', opacity: 0.8 }}>{trendLabel}</span>}
                </div>
            )}
        </div>
    );
};

export default StatCard;
