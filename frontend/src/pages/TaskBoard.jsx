import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import KanbanCard from '../components/dashboard/KanbanCard';
import './TaskBoard.css';

const TaskBoard = () => {
    // Columns structure
    const initialColumns = {
        todo: { id: 'todo', name: 'To Do', items: [] },
        inprogress: { id: 'inprogress', name: 'In Progress', items: [] },
        review: { id: 'review', name: 'Code Review', items: [] },
        done: { id: 'done', name: 'Done', items: [] }
    };

    const [columns, setColumns] = useState(initialColumns);
    const [winReady, setWinReady] = useState(false);
    const [loading, setLoading] = useState(true);

    const API_URL = 'http://localhost:3000/api/tasks';

    // Fetch tasks
    const fetchTasks = async () => {
        try {
            const response = await fetch(API_URL);
            const tasks = await response.json();

            // Distribute tasks into columns
            const newColumns = { ...initialColumns };
            // Reset items to avoid duplication if re-fetching
            Object.keys(newColumns).forEach(key => newColumns[key].items = []);

            tasks.forEach(task => {
                // Ensure status matches column keys (lowercase, no spaces)
                const statusKey = task.status ? task.status.toLowerCase().replace(' ', '') : 'todo';
                if (newColumns[statusKey]) {
                    newColumns[statusKey].items.push({
                        id: String(task.id), // Ensure ID is string for dnd
                        content: task.title,
                        priority: task.priority,
                        assignee: task.assigneeId || 'Unassigned',
                        tag: 'General', // Default tag for now
                        comments: 0,
                        attachments: 0
                    });
                }
            });
            setColumns(newColumns);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        setWinReady(true);
        fetchTasks();
    }, []);

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        const { source, destination } = result;

        // Optimistic UI Update
        const sourceColumn = columns[source.droppableId];
        const destColumn = columns[destination.droppableId];
        const sourceItems = [...sourceColumn.items];
        const destItems = [...destColumn.items];
        const [removed] = sourceItems.splice(source.index, 1);

        if (source.droppableId === destination.droppableId) {
            destItems.splice(destination.index, 0, removed);
            setColumns({
                ...columns,
                [source.droppableId]: { ...sourceColumn, items: destItems }
            });
        } else {
            destItems.splice(destination.index, 0, removed);
            setColumns({
                ...columns,
                [source.droppableId]: { ...sourceColumn, items: sourceItems },
                [destination.droppableId]: { ...destColumn, items: destItems }
            });

            // API Call to update status
            try {
                await fetch(`${API_URL}/${removed.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: destination.droppableId })
                });
            } catch (error) {
                console.error('Error updating task status:', error);
                // Revert or notify user (skipped for brevity)
            }
        }
    };

    const handleCreateTask = async () => {
        const title = prompt('Enter task title:');
        if (!title) return;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    status: 'todo',
                    priority: 'Medium',
                    description: '',
                    assigneeId: 'Me'
                })
            });

            if (response.ok) {
                fetchTasks(); // Refresh board
            }
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    if (!winReady) return null;

    return (
        <div className="taskboard-page">
            <div className="board-header">
                <h1>Kanban Board</h1>
                <div className="board-actions">
                    <button className="btn-secondary small" onClick={fetchTasks}>Refresh</button>
                    <button className="btn-primary small" onClick={handleCreateTask}>New Issue</button>
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="kanban-columns-container">
                    {Object.entries(columns).map(([columnId, column]) => (
                        <div className="kanban-column" key={columnId}>
                            <div className="column-header-styled">
                                <h2>{column.name}</h2>
                                <span className="item-count">{column.items.length}</span>
                            </div>
                            <Droppable droppableId={columnId}>
                                {(provided, snapshot) => (
                                    <div
                                        className={`column-droppable-area ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                    >
                                        {column.items.map((item, index) => (
                                            <KanbanCard key={item.id} task={item} index={index} />
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
};

export default TaskBoard;
