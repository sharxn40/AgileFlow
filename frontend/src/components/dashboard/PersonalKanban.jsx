import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './PersonalKanban.css';

const PersonalKanban = ({ issues, onStatusChange }) => {
    // Columns definition
    const columns = {
        'To Do': { id: 'To Do', title: 'To Do', items: [] },
        'In Progress': { id: 'In Progress', title: 'In Progress', items: [] },
        'Done': { id: 'Done', title: 'Done', items: [] }
    };

    // Distribute issues into columns
    issues.forEach(issue => {
        if (columns[issue.status]) {
            columns[issue.status].items.push(issue);
        } else {
            // Fallback for unknown statuses
            columns['To Do'].items.push(issue);
        }
    });

    const onDragEnd = (result) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const newStatus = destination.droppableId;
        onStatusChange(draggableId, newStatus);
    };

    return (
        <div className="personal-kanban-board">
            <DragDropContext onDragEnd={onDragEnd}>
                {Object.entries(columns).map(([columnId, column]) => (
                    <div className="kanban-column" key={columnId}>
                        <h3 className="column-header">
                            {column.title} <span className="count-badge">{column.items.length}</span>
                        </h3>
                        <Droppable droppableId={columnId}>
                            {(provided, snapshot) => (
                                <div
                                    className={`column-droppable ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    {column.items.map((issue, index) => (
                                        <Draggable key={issue.id} draggableId={issue.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    className={`kanban-card ${snapshot.isDragging ? 'dragging' : ''} ${issue.priority.toLowerCase()}-border`}
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <div className="card-header">
                                                        <span className="card-key">{issue.issueId}</span>
                                                        <span className={`priority-tag ${issue.priority.toLowerCase()}`}>{issue.priority}</span>
                                                    </div>
                                                    <div className="card-title">{issue.title}</div>
                                                    <div className="card-footer">
                                                        {issue.assigneeId && <div className="assignee-avatar">{(issue.assignee?.username || 'U')[0]}</div>}
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </DragDropContext>
        </div>
    );
};

export default PersonalKanban;
