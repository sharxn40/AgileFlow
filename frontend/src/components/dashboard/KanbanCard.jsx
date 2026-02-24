import React from 'react';

import { MdAttachFile, MdChatBubbleOutline, MdDelete, MdAccessTime } from 'react-icons/md';
import './KanbanCard.css';
import { getDeadlineStatus, formatCountdown, getStatusColor } from '../../utils/deadlineUtils';

const KanbanCard = ({ task, index, onMove, onStatusChange, availableStatuses, showLeft, showRight, isDragDisabled, onDelete }) => {
    // task is now an Issue object: { id, issueId, title, priority, assignee, etc. }

    // Safety check
    if (!task) return null;

    const getPriorityColor = (p) => {
        const priority = p || 'Medium';
        if (priority === 'High') return '#FF5630';
        if (priority === 'Medium') return '#FFAB00';
        return '#36B37E';
    };

    const getTagClass = (tag) => {
        return 'tag-blue';
    };

    // Deadline Logic
    const deadlineStatus = task.dueDate ? getDeadlineStatus(task.dueDate) : 'none';

    const deadlineColor = getStatusColor(deadlineStatus);
    const deadlineText = formatCountdown(task.dueDate);

    return (
        <div className="kanban-card" style={{ borderLeft: deadlineStatus === 'critical' || deadlineStatus === 'overdue' ? `4px solid ${deadlineColor}` : '' }}>
            <div className="card-header">
                <span className="task-id">{task.issueId || task.id}</span>
                {onDelete && (
                    <button
                        className="delete-task-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(task.id);
                        }}
                        title="Delete"
                    >
                        <MdDelete />
                    </button>
                )}
                <div
                    className="priority-dot"
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                    title={`Priority: ${task.priority}`}
                ></div>
            </div>

            <p className="card-content">{task.title}</p>

            <div className="card-tags">
                {task.type && <span className={`tag-badge ${getTagClass(task.type)}`}>{task.type}</span>}
                {/* Deadline Badge */}
                {deadlineStatus !== 'safe' && deadlineStatus !== 'none' && task.status !== 'Done' && (
                    <span className="tag-badge" style={{ backgroundColor: deadlineColor, color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MdAttachFile style={{ display: 'none' }} /> {deadlineText}
                    </span>
                )}

                {/* Status Dropdown */}
                {onStatusChange && availableStatuses && (
                    <select
                        className="status-dropdown-mini"
                        value={task.status}
                        onChange={(e) => onStatusChange(task.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()} // Prevent card click
                    >
                        {availableStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                )}
            </div>

            <div className="card-footer">
                <div className="card-assignee">
                    {task.assignee ? (
                        <div className="assignee-avatar">
                            {/* Handle object or string assignee */}
                            {typeof task.assignee === 'object' && task.assignee.username
                                ? task.assignee.username.charAt(0).toUpperCase()
                                : 'A'}
                        </div>
                    ) : (
                        <div className="assignee-avatar unassigned">?</div>
                    )}
                </div>

                <div className="card-meta">
                    {/* Mock counts if not present */}
                    {(task.attachments?.length > 0) && (
                        <span className="meta-item"><MdAttachFile /> {task.attachments.length}</span>
                    )}
                    {(task.history?.length > 0) && (
                        <span className="meta-item"><MdChatBubbleOutline /> {task.history.length}</span>
                    )}
                </div>

                <div className="card-move-controls">
                    {onMove && showLeft && (
                        <button className="move-btn" onClick={(e) => { e.stopPropagation(); onMove(task.id, -1); }} title="Move Left">
                            &lt;
                        </button>
                    )}
                    {onMove && showRight && (
                        <button className="move-btn" onClick={(e) => { e.stopPropagation(); onMove(task.id, 1); }} title="Move Right">
                            &gt;
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(KanbanCard);
