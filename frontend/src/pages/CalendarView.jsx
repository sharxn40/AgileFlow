import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './CalendarView.css';

import CreateTaskModal from '../components/dashboard/CreateTaskModal';
import IssueDetailDrawer from '../components/dashboard/IssueDetailDrawer';

const CalendarView = () => {
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [projects, setProjects] = useState([]); // Need projects for create
    const [currentDate, setCurrentDate] = useState(new Date());

    // Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createDate, setCreateDate] = useState(null);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { 'Authorization': `Bearer ${token}` };

                const [issuesRes, projectsRes] = await Promise.all([
                    fetch('http://localhost:3000/api/issues/my-issues', { headers }),
                    fetch('http://localhost:3000/api/projects', { headers })
                ]);

                if (issuesRes.ok) setIssues(await issuesRes.json());
                if (projectsRes.ok) setProjects(await projectsRes.json());
            } catch (error) {
                console.error("Failed to load calendar data", error);
            }
        };
        fetchIssues();
    }, []);

    // Helper functions for calendar logic
    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay(); // 0 = Sun

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    const handleDayClick = (year, month, day) => {
        const date = new Date(year, month, day);
        setCreateDate(date);
        setShowCreateModal(true);
    };

    const handleTaskClick = (e, task) => {
        e.stopPropagation(); // Prevent day click
        setSelectedIssue(task);
        setIsDrawerOpen(true);
    };

    const handleIssueUpdate = async (updatedIssue) => {
        setIssues(prev => prev.map(i => i.id === updatedIssue.id ? updatedIssue : i));

        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:3000/api/issues/${updatedIssue.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(updatedIssue)
            });
        } catch (error) {
            console.error("Failed to save issue update:", error);
        }
    };

    const handleCreateTask = async (taskData) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3000/api/issues', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(taskData)
            });

            if (res.ok) {
                const newIssue = await res.json();
                setIssues(prev => [...prev, newIssue]);
                setShowCreateModal(false);
            }
        } catch (error) {
            console.error("Failed to create issue:", error);
        }
    };


    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Weekday Headers
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        weekDays.forEach(day => {
            days.push(<div key={`header-${day}`} className="calendar-day-header">{day}</div>);
        });

        // Empty cells for previous month padding
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
            const todayStr = new Date().toDateString();
            const isToday = dateStr === todayStr;

            // Find tasks for this day (by dueDate)
            const dayTasks = issues.filter(i => {
                if (!i.dueDate) return false;
                // Safe date comparison
                return new Date(i.dueDate).toDateString() === dateStr;
            });

            days.push(
                <div
                    key={day}
                    className={`calendar-day ${isToday ? 'today' : ''}`}
                    onClick={() => handleDayClick(currentDate.getFullYear(), currentDate.getMonth(), day)}
                    style={{ cursor: 'pointer' }}
                    title="Click to add task"
                >
                    <div className="day-number">{day}</div>
                    {dayTasks.map(task => (
                        <div
                            key={task.id}
                            className={`calendar-task-pill priority-${task.priority.toLowerCase()}`}
                            onClick={(e) => handleTaskClick(e, task)}
                            title={`${task.title} (${task.status})`}
                        >
                            {task.title}
                        </div>
                    ))}
                </div>
            );
        }

        return days;
    };

    return (
        <div className="calendar-container">
            <header className="calendar-header">
                <div>
                    <h1 className="page-title">Personal Calendar</h1>
                    <p className="page-subtitle">Track your deadlines and schedule.</p>
                </div>
                <div className="calendar-nav">
                    <button onClick={prevMonth}><FaChevronLeft /></button>
                    <span className="month-title">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={nextMonth}><FaChevronRight /></button>
                    <button onClick={goToToday} style={{ fontSize: '0.9rem', fontWeight: 600 }}>Today</button>
                </div>
            </header>

            <div className="calendar-grid">
                {renderCalendar()}
            </div>

            <CreateTaskModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateTask}
                projects={projects}
                initialDate={createDate}
            />

            <IssueDetailDrawer
                isOpen={isDrawerOpen}
                issue={selectedIssue}
                onClose={() => setIsDrawerOpen(false)}
                onUpdate={handleIssueUpdate}
            />
        </div>
    );
};

export default CalendarView;
