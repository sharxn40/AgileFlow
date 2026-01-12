import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import KanbanCard from '../components/dashboard/KanbanCard';
import './TaskBoard.css';

// Professional Mock Data relative to SaaS
const initialColumns = {
    todo: {
        id: 'todo',
        name: 'To Do',
        items: [
            { id: 'AG-101', content: 'Design Dashboard Mockups', priority: 'High', assignee: 'JD', tag: 'Design', comments: 2, attachments: 1 },
            { id: 'AG-103', content: 'Setup Analytics Routes', priority: 'Medium', assignee: 'ME', tag: 'Dev', comments: 0, attachments: 0 }
        ]
    },
    inprogress: {
        id: 'inprogress',
        name: 'In Progress',
        items: [
            { id: 'AG-102', content: 'Implement Sidebar Component', priority: 'High', assignee: 'ME', tag: 'Frontend', comments: 5, attachments: 2 },
            { id: 'AG-105', content: 'Database Schema Finalization', priority: 'High', assignee: 'SR', tag: 'Backend', comments: 8, attachments: 3 }
        ]
    },
    review: {
        id: 'review',
        name: 'Code Review',
        items: [
            { id: 'AG-104', content: 'Auth Integration Tests', priority: 'Low', assignee: 'JD', tag: 'QA', comments: 1, attachments: 0 }
        ]
    },
    done: {
        id: 'done',
        name: 'Done',
        items: [
            { id: 'AG-100', content: 'Project Kickoff Meeting', priority: 'Medium', assignee: 'All', tag: 'General', comments: 0, attachments: 0 }
        ]
    }
};

const TaskBoard = () => {
    const [columns, setColumns] = useState(initialColumns);
    const [winReady, setWinReady] = useState(false);

    // Fix for React Strict Mode / Next.js hydration issues with DND
    useEffect(() => {
        setWinReady(true);
    }, []);

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const { source, destination } = result;

        if (source.droppableId !== destination.droppableId) {
            const sourceColumn = columns[source.droppableId];
            const destColumn = columns[destination.droppableId];
            const sourceItems = [...sourceColumn.items];
            const destItems = [...destColumn.items];
            const [removed] = sourceItems.splice(source.index, 1);
            destItems.splice(destination.index, 0, removed);
            setColumns({
                ...columns,
                [source.droppableId]: {
                    ...sourceColumn,
                    items: sourceItems
                },
                [destination.droppableId]: {
                    ...destColumn,
                    items: destItems
                }
            });
        } else {
            const column = columns[source.droppableId];
            const copiedItems = [...column.items];
            const [removed] = copiedItems.splice(source.index, 1);
            copiedItems.splice(destination.index, 0, removed);
            setColumns({
                ...columns,
                [source.droppableId]: {
                    ...column,
                    items: copiedItems
                }
            });
        }
    };

    if (!winReady) return null; // Prevent hydration mismatch

    return (
        <div className="taskboard-page">
            <div className="board-header">
                <h1>Kanban Board</h1>
                <div className="board-actions">
                    <button className="btn-secondary small">Filter</button>
                    <button className="btn-primary small">New Issue</button>
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
