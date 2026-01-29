import React from 'react';
import './StatCard.css';

const StatCard = ({ icon, label, value, trend, color, onClick, isActive }) => {
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

            {trend !== undefined && (
                <div className={`stat-trend ${trend >= 0 ? 'positive' : 'negative'}`}>
                    <span>{trend > 0 ? '+' : ''}{trend}%</span>
                    <span className="trend-label">from last week</span>
                </div>
            )}
        </div>
    );
};

export default StatCard;
