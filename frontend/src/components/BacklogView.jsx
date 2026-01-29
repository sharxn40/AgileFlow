import React, { useState, useEffect } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './BacklogView.css';

const BacklogView = ({ projectId: propProjectId }) => {
    const params = useParams();
    const projectId = propProjectId || params.projectId;
    // const { project } = useOutletContext();
    const [sprints, setSprints] = useState([]);
    const [backlogIssues, setBacklogIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBacklog = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/api/projects/${projectId}/backlog`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setSprints(data.sprints || []);
            const issues = data.issues || [];

            // Separate Backlog and Sprint Issues
            setBacklogIssues(issues.filter(i => !i.sprintId));

            // Map issues to sprints (optional: could do in render)
            // Storing in state for cleaner render logic if needed, 
            // but rendering directly from issues list is often easier.
            // Let's store raw issues and filter in render.
            window.projectIssues = issues; // Hack for debugging
            setAllIssues(issues);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const [allIssues, setAllIssues] = useState([]);

    useEffect(() => {
        fetchBacklog();
    }, [projectId]);

    const handleStartSprint = async (sprintId) => {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:3000/api/sprints/${sprintId}/start`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchBacklog();
    };

    const handleCreateSprint = async () => {
        if (!projectId) {
            alert("No project selected");
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/api/sprints`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    name: `Sprint ${sprints.length + 1}`,
                    projectId
                })
            });

            if (!res.ok) {
                const err = await res.json();
                alert(`Failed to create sprint: ${err.message}`);
                return;
            }

            fetchBacklog();
        } catch (error) {
            console.error(error);
            alert("Error creating sprint");
        }
    };

    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId) return;

        // Determine destination: 'backlog' or 'sprint-ID'
        let sprintId = null;
        if (destination.droppableId !== 'backlog') {
            sprintId = destination.droppableId.replace('sprint-', '');
        }

        // Optimistic UI could go here, but for now just call API and refresh
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:3000/api/issues/${draggableId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ sprintId }) // null if backlog, id if sprint
        });

        fetchBacklog(); // Refresh to sync
    };

    if (loading) return <div>Loading Backlog...</div>;

    return (
        <div className="backlog-view">
            <div className="backlog-header">
                <h2>Backlog</h2>
                <button className="btn-secondary small" onClick={handleCreateSprint}>Create Sprint</button>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="sprints-list">
                    {sprints.map(sprint => (
                        <div key={sprint.id} className="sprint-container">
                            <div className="sprint-header">
                                <span>{sprint.name} <span className={`status-badge ${sprint.status}`}>{sprint.status}</span></span>
                                {sprint.status === 'planned' && (
                                    <button className="btn-primary small" onClick={() => handleStartSprint(sprint.id)}>Start Sprint</button>
                                )}
                            </div>

                            <Droppable droppableId={`sprint-${sprint.id}`}>
                                {(provided, snapshot) => (
                                    <div
                                        className="sprint-drop-zone"
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        style={{ background: snapshot.isDraggingOver ? '#f4f5f7' : 'transparent' }}
                                    >
                                        <div className="sprint-issues-placeholder">
                                            {allIssues.filter(i => i.sprintId === sprint.id).length === 0 && "Drop issues here"}
                                            {allIssues.filter(i => i.sprintId === sprint.id).map((issue, index) => (
                                                <Draggable key={issue.id} draggableId={issue.id} index={index}>
                                                    {(provided) => (
                                                        <div
                                                            className="backlog-issue-card mini"
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            <span className="issue-key">{issue.issueId}</span>
                                                            <span className="issue-summary">{issue.title}</span>
                                                            <span className="issue-status-badge">{issue.status}</span>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                        </div>
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>

                <Droppable droppableId="backlog">
                    {(provided) => (
                        <div
                            className="backlog-list"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            <h3>Backlog Issues</h3>
                            {backlogIssues.map((issue, index) => (
                                <Draggable key={issue.id} draggableId={issue.id} index={index}>
                                    {(provided) => (
                                        <div
                                            className="backlog-issue-card"
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                        >
                                            <span className="issue-key">{issue.issueId || issue.id}</span>
                                            <span className="issue-summary">{issue.title}</span>
                                            <span className="issue-priority">{issue.priority}</span>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default BacklogView;
