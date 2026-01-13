import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { MdFlag, MdAttachFile, MdChatBubbleOutline } from 'react-icons/md';
import './KanbanCard.css';

const KanbanCard = ({ task, index }) => {
    // task: { id, content, priority, assignee, tag, comments, attachments }

    const getPriorityColor = (p) => {
        if (p === 'High') return 'var(--theme-danger)';
        if (p === 'Medium') return 'var(--theme-warning)';
        return 'var(--theme-success)';
    };

    return (
        <Draggable draggableId={String(task.id)} index={index}>
            {(provided, snapshot) => (
                <div
                    className={`kanban-card ${snapshot.isDragging ? 'dragging' : ''}`}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{ ...provided.draggableProps.style }}
                >
                    <div className="card-header">
                        <span className="task-id">{task.id}</span>
                        <div className="priority-dot" style={{ background: getPriorityColor(task.priority) }} title={task.priority}></div>
                    </div>

                    <p className="card-content">{task.content}</p>

                    <div className="card-tags">
                        {task.tag && <span className="tag-badge">{task.tag}</span>}
                    </div>

                    <div className="card-footer">
                        <div className="card-assignee">
                            {task.assignee ? (
                                <div className="assignee-avatar">{task.assignee}</div>
                            ) : (
                                <div className="assignee-avatar unassigned">?</div>
                            )}
                        </div>
                        <div className="card-meta">
                            {task.attachments > 0 && (
                                <span className="meta-item"><MdAttachFile /> {task.attachments}</span>
                            )}
                            {task.comments > 0 && (
                                <span className="meta-item"><MdChatBubbleOutline /> {task.comments}</span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default KanbanCard;
