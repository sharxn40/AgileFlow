import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { MdAttachFile, MdChatBubbleOutline } from 'react-icons/md';
import './KanbanCard.css';

const KanbanCard = ({ task, index, onMove, showLeft, showRight }) => {
    // task: { id, content, priority, assignee, tag, comments, attachments }

    const getPriorityColor = (p) => {
        if (p === 'High') return '#FF5630'; // Red
        if (p === 'Medium') return '#FFAB00'; // Orange
        return '#36B37E'; // Green
    };

    const getTagClass = (tag) => {
        // Basic tag mapping
        return 'tag-blue';
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
                        <div
                            className="priority-dot"
                            style={{ backgroundColor: getPriorityColor(task.priority) }}
                            title={`Priority: ${task.priority}`}
                        ></div>
                    </div>

                    <p className="card-content">{task.content}</p>

                    <div className="card-tags">
                        {task.tag && <span className={`tag-badge ${getTagClass(task.tag)}`}>{task.tag}</span>}
                    </div>

                    <div className="card-footer">
                        <div className="card-assignee">
                            {task.assignee ? (
                                <div className="assignee-avatar">{task.assignee}</div>
                            ) : (
                                <div className="assignee-avatar unassigned">?</div>
                            )}
                        </div>

                        {/* Manual Move Controls requested by user */}
                        <div className="card-move-controls">
                            {/* Prevent drag on buttons by stopping propagation */}
                            <button
                                className={`move-btn ${showLeft ? '' : 'hidden'}`}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMove(task.id, -1); }}
                                title="Move Left"
                            >
                                &lt;
                            </button>
                            <button
                                className={`move-btn ${showRight ? '' : 'hidden'}`}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMove(task.id, 1); }}
                                title="Move Right"
                            >
                                &gt;
                            </button>
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
