import React, { useMemo } from 'react';
import './TimelineView.css';
import { getDeadlineStatus, getStatusColor, formatCountdown } from '../../utils/deadlineUtils';

const TimelineView = ({ issues }) => {
    // 1. Calculate Timeline Range (Start of this week -> End of next week)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Range: Start from 7 days ago to 14 days ahead
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 7);

    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 14);

    // Generate Array of dates for header
    const dates = [];
    let curr = new Date(startDate);
    while (curr <= endDate) {
        dates.push(new Date(curr));
        curr.setDate(curr.getDate() + 1);
    }

    // 2. Helper to position bars
    const getBarPosition = (issue) => {
        // Start: Use createdAt or startDate if exists. Fallback to today if missing? No, fallback to 1 day bar.
        const start = issue.startDate ? new Date(issue.startDate) : new Date(issue.createdAt);
        const end = issue.dueDate ? new Date(issue.dueDate) : new Date(start.getTime() + 86400000); // +1 day default

        // Clip to view range
        const viewStart = startDate.getTime();
        const oneDay = 86400000;

        let leftDays = (start.getTime() - viewStart) / oneDay;
        let durationDays = (end.getTime() - start.getTime()) / oneDay;

        // Min duration 1 day for visibility
        if (durationDays < 1) durationDays = 1;

        return {
            left: `${leftDays * 100}px`, // 100px per day column
            width: `${durationDays * 100}px`
        };
    };

    // 3. Filter issues with deadlines or created recently
    const visibleIssues = issues.filter(issue => {
        if (!issue.dueDate && !issue.createdAt) return false;
        // Logic to check if overlaps with range could go here
        return true;
    });

    return (
        <div className="timeline-container">
            <div className="timeline-header">
                <div className="timeline-sidebar-header">Task</div>
                <div className="timeline-dates-scroll">
                    {dates.map((date, index) => {
                        const isToday = date.toDateString() === today.toDateString();
                        return (
                            <div key={index} className={`date-cell ${isToday ? 'today' : ''}`}>
                                <div className="day-name">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                <div className="day-num">{date.getDate()}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="timeline-body">
                {visibleIssues.map(issue => {
                    const status = getDeadlineStatus(issue.dueDate);
                    const color = getStatusColor(status);
                    const pos = getBarPosition(issue);

                    return (
                        <div key={issue.id} className="timeline-row">
                            <div className="timeline-task-info">
                                <span className="task-key">{issue.issueId}</span>
                                <span className="task-name" title={issue.title}>{issue.title}</span>
                            </div>
                            <div className="timeline-track">
                                <div
                                    className="timeline-bar"
                                    style={{
                                        left: pos.left,
                                        width: pos.width,
                                        backgroundColor: issue.status === 'Done' ? '#E3FCEF' : (status === 'safe' ? '#DEEBFF' : color),
                                        borderColor: issue.status === 'Done' ? '#36B37E' : color,
                                        color: issue.status === 'Done' ? '#006644' : (status === 'safe' ? '#0747A6' : 'white')
                                    }}
                                >
                                    <span className="bar-label">
                                        {formatCountdown(issue.dueDate)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Vertical Line for Today */}
                <div className="today-line" style={{ left: '750px' }}></div>
                {/* 7 days * 100px + 50px offset = 750px approx */}
            </div>
        </div>
    );
};

export default TimelineView;
