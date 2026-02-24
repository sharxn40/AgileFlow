import React, { useState, useEffect } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import KanbanCard from '../components/dashboard/KanbanCard';
import CreateTaskModal from '../components/dashboard/CreateTaskModal';
import ConfirmationModal from '../components/ConfirmationModal';
import InviteMemberModal from '../components/project/InviteMemberModal';
import { FaUserPlus } from 'react-icons/fa';
import './TaskBoard.css';

const TaskBoard = () => {
    const { projectId } = useParams();
    const [columns, setColumns] = useState({});
    const [boardData, setBoardData] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Filter states
    const { searchTerm } = useOutletContext() || {};
    const [activeFilter, setActiveFilter] = useState('All');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Delete states
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    const fetchBoard = async () => {
        try {
            // setLoading(true); // Don't show loading spinner on background refresh
            const token = localStorage.getItem('token');
            // Cache bust with timestamp
            const res = await fetch(`http://localhost:3000/api/projects/${projectId}/board?t=${Date.now()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBoardData(data);
                organizeIssues(data.issues, data.board?.columns || ['To Do', 'In Progress', 'Done']);
            }
        } catch (error) {
            console.error('Error fetching board:', error);
        } finally {
            setLoading(false);
        }
    };

    const organizeIssues = (issues, columnNames) => {
        if (!Array.isArray(issues)) {
            console.error("organizeIssues: issues is not an array", issues);
            return;
        }

        const newColumns = {};
        // Initialize columns based on Board Config
        columnNames.forEach(name => {
            // Create ID from name (e.g., "In Progress" -> "inprogress")
            const id = name.toLowerCase().replace(/\s+/g, '');
            newColumns[id] = { id, name, items: [] };
        });

        // Distribute issues
        issues.forEach(issue => {
            if (!issue || !issue.status) return; // Skip invalid issues

            let statusKey = issue.status.toLowerCase().replace(/\s+/g, '');
            // Fallback for mapped statuses
            if (!newColumns[statusKey]) {
                // Try to find best match or default to first column
                const keys = Object.keys(newColumns);
                if (statusKey.includes('progress')) statusKey = keys.find(k => k.includes('progress')) || keys[1];
                else if (statusKey.includes('done')) statusKey = keys.find(k => k.includes('done')) || keys[keys.length - 1];
                else statusKey = keys[0];
            }

            if (newColumns[statusKey]) {
                // Map Issue fields to Card expected fields if necessary
                issue.content = issue.title; // Card expects content ??
                newColumns[statusKey].items.push(issue);
            }
        });
        setColumns(newColumns);
    };

    useEffect(() => {
        if (projectId) {
            setLoading(true); // Initial load
            fetchBoard();
            const interval = setInterval(fetchBoard, 5000); // Poll every 5s
            return () => clearInterval(interval);
        }
    }, [projectId]);



    const handleManualMove = async (taskId, direction) => {
        // Find current column
        let sourceColId = null;
        let sourceCol = null;
        Object.entries(columns).forEach(([colId, col]) => {
            if (col.items.find(i => i.id === taskId)) {
                sourceColId = colId;
                sourceCol = col;
            }
        });

        if (!sourceColId) return;

        // Get Column Order (from filtered columns or board data)
        const colOrder = Object.keys(columns);
        const currentIndex = colOrder.indexOf(sourceColId);
        const newIndex = currentIndex + direction;

        if (newIndex < 0 || newIndex >= colOrder.length) return;

        const destColId = colOrder[newIndex];
        const destCol = columns[destColId];

        // Optimistic Update
        const sourceItems = [...sourceCol.items];
        const destItems = [...destCol.items];
        const taskIndex = sourceItems.findIndex(i => i.id === taskId);
        const [movedTask] = sourceItems.splice(taskIndex, 1);
        destItems.push(movedTask); // Add to end of new column

        setColumns({
            ...columns,
            [sourceColId]: { ...sourceCol, items: sourceItems },
            [destColId]: { ...destCol, items: destItems }
        });

        // API Update
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:3000/api/issues/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: destCol.name })
            });
        } catch (err) {
            console.error("Failed to move task manually", err);
            fetchBoard();
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        // Find task and source column
        let sourceColId = null;
        let sourceCol = null;
        let task = null;

        Object.entries(columns).forEach(([colId, col]) => {
            const found = col.items.find(i => i.id === taskId);
            if (found) {
                sourceColId = colId;
                sourceCol = col;
                task = found;
            }
        });

        if (!sourceColId || !task) return;

        // Find destination column by name (status)
        const destColEntry = Object.entries(columns).find(([_, col]) => col.name === newStatus);
        if (!destColEntry) return; // Status doesn't exist as a column
        const [destColId, destCol] = destColEntry;

        if (sourceColId === destColId) return; // No change

        // Optimistic Update
        const sourceItems = [...sourceCol.items];
        const destItems = [...destCol.items];

        const taskIndex = sourceItems.findIndex(i => i.id === taskId);
        const [movedTask] = sourceItems.splice(taskIndex, 1);
        // Update task status locally
        movedTask.status = newStatus;
        destItems.push(movedTask);

        setColumns({
            ...columns,
            [sourceColId]: { ...sourceCol, items: sourceItems },
            [destColId]: { ...destCol, items: destItems }
        });

        // API Update
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:3000/api/issues/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (err) {
            console.error("Failed to update status dropdown", err);
            fetchBoard();
        }
    };

    const handleCreateIssue = async (taskData) => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        const payload = {
            ...taskData,
            projectId, // Context
            reporterId: user.id || user._id,
            // activeSprint is handled by backend or could be passed here if selected
            sprintId: boardData?.activeSprint?.id || null
        };

        try {
            const res = await fetch('http://localhost:3000/api/issues', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                fetchBoard();
                setIsCreateModalOpen(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Filter Logic
    const getFilteredColumns = () => {
        const filtered = {};
        Object.keys(columns).forEach(key => {
            filtered[key] = {
                ...columns[key],
                items: columns[key].items.filter(item => {
                    const matchesPriority = activeFilter === 'All' || item.priority === activeFilter;
                    const sTerm = (searchTerm || '').toLowerCase();
                    const matchesSearch = !sTerm || (item.title && item.title.toLowerCase().includes(sTerm)) || (item.issueId && item.issueId.toLowerCase().includes(sTerm));
                    return matchesPriority && matchesSearch;
                })
            };
        });
        return filtered;
    };

    const displayColumns = getFilteredColumns();
    const availableStatuses = Object.values(columns).map(c => c.name);

    if (loading) return <div className="board-loading">Loading Board...</div>;

    return (
        <div className="taskboard-page">
            <div className="board-header">
                <div className="board-info">
                    <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#172B4D', margin: 0 }}>{boardData?.board?.name || 'Board'}</h1>
                    {boardData?.activeSprint && <span className="sprint-badge" style={{ fontSize: '0.8rem', background: '#DEEBFF', color: '#0052CC', padding: '2px 10px', borderRadius: '100px', fontWeight: '600' }}>{boardData.activeSprint.name}</span>}
                </div>

                <div className="board-actions">
                    <div className="filter-container">
                        <button className={`btn-secondary small ${activeFilter !== 'All' ? 'active' : ''}`} onClick={() => setIsFilterOpen(!isFilterOpen)}>
                            {activeFilter}
                        </button>
                        {isFilterOpen && (
                            <div className="filter-menu">
                                {['All', 'High', 'Medium', 'Low'].map(f => (
                                    <div key={f} className="filter-option" onClick={() => { setActiveFilter(f); setIsFilterOpen(false); }}>{f}</div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button className="btn-secondary small" onClick={() => setIsInviteModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaUserPlus /> Invite
                    </button>
                    <button className="btn-primary small" onClick={() => setIsCreateModalOpen(true)}>Create Issue</button>
                </div>
            </div>

            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                projectId={projectId}
            />

            <div className="kanban-columns-container">
                {Object.entries(displayColumns).map(([colId, col]) => (
                    <div className="kanban-column" key={colId}>
                        <div className="column-header-styled">
                            <h2>{col.name}</h2>
                            <span className="item-count">{col.items.length}</span>
                        </div>
                        <div className="column-droppable-area">
                            {col.items.map((item, index) => (
                                <KanbanCard
                                    key={item.id}
                                    task={item}
                                    index={index}
                                    onMove={handleManualMove}
                                    onStatusChange={handleStatusChange}
                                    availableStatuses={availableStatuses}
                                    showLeft={Object.keys(displayColumns).indexOf(colId) > 0}
                                    showRight={Object.keys(displayColumns).indexOf(colId) < Object.keys(displayColumns).length - 1}
                                    onDelete={() => setTaskToDelete(item)}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateIssue}
            />

            <ConfirmationModal
                isOpen={!!taskToDelete}
                onClose={() => setTaskToDelete(null)}
                onConfirm={async () => {
                    if (!taskToDelete) return;
                    try {
                        const token = localStorage.getItem('token');
                        const deleteId = taskToDelete.id || taskToDelete._id;
                        await fetch(`http://localhost:3000/api/issues/${deleteId}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        setTaskToDelete(null);
                        fetchBoard();
                    } catch (err) {
                        console.error('Failed to delete task', err);
                    }
                }}
                title="Delete Issue"
                message={`Are you sure you want to delete ${taskToDelete?.issueId || 'this issue'}? This action cannot be undone.`}
            />
        </div>
    );
};

export default TaskBoard;
