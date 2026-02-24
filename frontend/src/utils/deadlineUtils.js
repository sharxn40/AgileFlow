/**
 * Utility functions for handling Deadlines and Timelines
 */

/**
 * Calculates time remaining until a due date
 * @param {string|Date} dueDate 
 * @returns {object} { days, hours, minutes, totalSeconds, isOverdue }
 */
export const getTimeRemaining = (dueDate) => {
    if (!dueDate) return null;

    const total = Date.parse(dueDate) - Date.now();
    const isOverdue = total < 0;
    const absTotal = Math.abs(total);

    const minutes = Math.floor((absTotal / 1000 / 60) % 60);
    const hours = Math.floor((absTotal / (1000 * 60 * 60)) % 24);
    const days = Math.floor(absTotal / (1000 * 60 * 60 * 24));

    return {
        total: total,
        days,
        hours,
        minutes,
        isOverdue
    };
};

/**
 * Determines the urgency status based on time remaining
 * @param {string|Date} dueDate 
 * @returns {string} 'overdue' | 'critical' | 'warning' | 'safe' | 'none'
 */
export const getDeadlineStatus = (dueDate) => {
    if (!dueDate) return 'none';

    const { total } = getTimeRemaining(dueDate);

    if (total < 0) return 'overdue'; // Deadline passed

    const hoursRemaining = total / (1000 * 60 * 60);

    if (hoursRemaining < 12) return 'critical'; // Less than 12 hours (Red)
    if (hoursRemaining < 48) return 'warning';  // Less than 48 hours (Yellow)

    return 'safe'; // More than 48 hours (Green/Normal)
};

/**
 * Formats the countdown into a user-friendly string
 * @param {string|Date} dueDate 
 * @returns {string} e.g. "2d 4h left" or "Overdue by 1h"
 */
export const formatCountdown = (dueDate) => {
    const time = getTimeRemaining(dueDate);
    if (!time) return '';

    const { days, hours, minutes, isOverdue } = time;
    const prefix = isOverdue ? 'Overdue by ' : '';
    const suffix = isOverdue ? '' : ' left';

    if (days > 0) return `${prefix}${days}d ${hours}h${suffix}`;
    if (hours > 0) return `${prefix}${hours}h ${minutes}m${suffix}`;
    return `${prefix}${minutes}m${suffix}`;
};

/**
 * Returns color codes for status
 */
export const getStatusColor = (status) => {
    switch (status) {
        case 'overdue': return '#DE350B'; // Red
        case 'critical': return '#FF5630'; // Light Red/Orange
        case 'warning': return '#FFAB00'; // Yellow
        case 'safe': return '#36B37E';    // Green
        default: return '#N/A';
    }
};
