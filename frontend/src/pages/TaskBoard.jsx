import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import KanbanCard from '../components/dashboard/KanbanCard';
import CreateTaskModal from '../components/dashboard/CreateTaskModal';
import './TaskBoard.css';

import { getKanbanData, updateTaskStatus, addTask } from '../utils/taskManager';

const TaskBoard = () => {
    const [columns, setColumns] = useState(getKanbanData());
    const [winReady, setWinReady] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        setWinReady(true);
        // Refresh data on mount to catch updates from Dashboard
        setColumns(getKanbanData());
    }, []);

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const { source, destination } = result;

        // Optimistic update for UI smoothness
        if (source.droppableId !== destination.droppableId) {
            const sourceColumn = columns[source.droppableId];
            const destColumn = columns[destination.droppableId];
            const sourceItems = [...sourceColumn.items];
            const destItems = [...destColumn.items];
            const [removed] = sourceItems.splice(source.index, 1);
            destItems.splice(destination.index, 0, removed);

            setColumns({
                ...columns,
                [source.droppableId]: { ...sourceColumn, items: sourceItems },
                [destination.droppableId]: { ...destColumn, items: destItems }
            });

            // Persist change
            // Map column ID back to status string
            let newStatus = 'To Do';
            if (destination.droppableId === 'inprogress') newStatus = 'In Progress';
            if (destination.droppableId === 'review') newStatus = 'Code Review';
            if (destination.droppableId === 'done') newStatus = 'Done';

            updateTaskStatus(removed.id, newStatus);
        } else {
            // Reordering within same column (not persisted in simple manager, purely visual le)
            const column = columns[source.droppableId];
            const copiedItems = [...column.items];
            const [removed] = copiedItems.splice(source.index, 1);
            copiedItems.splice(destination.index, 0, removed);
            setColumns({
                ...columns,
                [source.droppableId]: { ...column, items: copiedItems }
            });
        }
    };

    const handleCreateTaskClick = () => {
        setIsCreateModalOpen(true);
    };

    const handleSaveTask = (taskData) => {
        const newTask = addTask({
            title: taskData.title,
            content: taskData.title,
            priority: taskData.priority,
            assignee: taskData.assignee || 'Unassigned',
            tag: taskData.tag || 'General',
            comments: 0,
            attachments: 0
        });

        // Refresh board
        setColumns(getKanbanData());
        setIsCreateModalOpen(false);
    };

    if (!winReady) return null; // Prevent hydration mismatch

    const handleMoveTask = (taskId, direction) => {
        // direction: -1 for left, 1 for right
        const columnKeys = Object.keys(columns);
        // Find which column the task is in
        let sourceColKey = null;
        let taskIndex = -1;

        for (const key of columnKeys) {
            const index = columns[key].items.findIndex(t => t.id === taskId);
            if (index !== -1) {
                sourceColKey = key;
                taskIndex = index;
                break;
            }
        }

        if (!sourceColKey) return;

        const currentColIndex = columnKeys.indexOf(sourceColKey);
        const targetColIndex = currentColIndex + direction;

        // Check bounds
        if (targetColIndex < 0 || targetColIndex >= columnKeys.length) return;

        const targetColKey = columnKeys[targetColIndex];

        // Optimistic update similar to onDragEnd
        const sourceColumn = columns[sourceColKey];
        const destColumn = columns[targetColKey];

        const sourceItems = [...sourceColumn.items];
        const destItems = [...destColumn.items];

        const [movedTask] = sourceItems.splice(taskIndex, 1);
        destItems.push(movedTask); // Add to end of target column

        setColumns({
            ...columns,
            [sourceColKey]: { ...sourceColumn, items: sourceItems },
            [targetColKey]: { ...destColumn, items: destItems }
        });

        // status mapping for persistence
        let newStatus = 'To Do';
        if (targetColKey === 'inprogress') newStatus = 'In Progress';
        if (targetColKey === 'review') newStatus = 'Code Review';
        if (targetColKey === 'done') newStatus = 'Done';

        updateTaskStatus(movedTask.id, newStatus);
    };

    return (
        <div className="taskboard-page">
            <div className="board-header">
                <h1>Kanban Board</h1>
                <div className="board-actions">
                    <button className="btn-secondary small">Filter</button>
                    <button className="btn-primary small" onClick={handleCreateTaskClick}>New Issue</button>
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="kanban-columns-container">
                    {Object.entries(columns).map(([columnId, column], colIndex) => (
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
                                            <KanbanCard
                                                key={item.id}
                                                task={item}
                                                index={index}
                                                onMove={handleMoveTask}
                                                showLeft={colIndex > 0}
                                                showRight={colIndex < Object.keys(columns).length - 1}
                                            />
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>

            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleSaveTask}
            />
        </div>
    );
};

export default TaskBoard;
