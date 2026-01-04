import React, { useState } from 'react';
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Initial Mock Data
const initialColumns = {
    todo: {
        name: 'To Do',
        items: [
            { id: '1', content: 'Design Dashboard Mockups', priority: 'High', assignee: 'JD' },
            { id: '2', content: 'Setup React Router', priority: 'Medium', assignee: 'ME' }
        ]
    },
    inprogress: {
        name: 'In Progress',
        items: [
            { id: '3', content: 'Implement Sidebar', priority: 'High', assignee: 'ME' }
        ]
    },
    review: {
        name: 'Code Review',
        items: []
    },
    done: {
        name: 'Done',
        items: [
            { id: '4', content: 'Project Kickoff', priority: 'Low', assignee: 'JD' }
        ]
    }
};

const TaskBoard = () => {
    // const [columns, setColumns] = useState(initialColumns);

    const onDragEnd = (result, columns, setColumns) => {
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

    // Placeholder for React 19 Compatibility
    return (
        <div className="content-scroll">
            <div className="dashboard-header">
                <h1>Task Board</h1>
            </div>
            <div style={{ padding: '20px' }}>
                <p>Kanban Board (Drag and Drop is temporarily disabled for React 19 compatibility debugging)</p>
                {/* 
                   DragDropContext code commented out...
                */}
                <div className="dashboard-grid">
                    {Object.entries(initialColumns).map(([columnId, column]) => (
                        <div key={columnId} className="dash-card">
                            <h3>{column.name}</h3>
                            {column.items.map(item => (
                                <div key={item.id} style={{ padding: '10px', border: '1px solid #ccc', margin: '5px 0' }}>
                                    {item.content}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TaskBoard;
