import React, { useState, useEffect } from 'react';
import { useParams, Outlet, Link, useLocation } from 'react-router-dom';
import './ProjectDashboard.css';

const ProjectDashboard = () => {
    const { projectId } = useParams();
    const location = useLocation();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch project details
        const fetchProject = async () => {
            try {
                const token = localStorage.getItem('token');
                // We'll add a simple getProjectById endpoint or use getProjectBoard for now
                // For structure, assume we can get basic project info
                // Mocking for now until singular project fetch endpoint is verified generic
                // Or I can use the existing /board endpoint which returns project data
                const res = await fetch(`http://localhost:3000/api/projects/${projectId}/board`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.project) setProject(data.project);
            } catch (err) {
                console.error("Failed to load project", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [projectId]);

    if (loading) return <div className="p-dashboard-loading">Loading Project...</div>;
    if (!project) return <div className="p-dashboard-error">Project not found</div>;

    return (
        <div className="project-dashboard">
            <div className="project-dashboard-header">
                <div className="project-header-info">
                    <div className="p-avatar">{project.key ? project.key.substring(0, 1) : 'P'}</div>
                    <div>
                        <h1>{project.name}</h1>
                        <span className="p-key-badge">{project.key}</span>
                    </div>
                </div>

                <nav className="project-tabs">
                    <Link
                        to={`/project/${projectId}/board`}
                        className={`project-tab ${location.pathname.includes('/board') ? 'active' : ''}`}
                    >
                        Board
                    </Link>
                    <Link
                        to={`/project/${projectId}/backlog`}
                        className={`project-tab ${location.pathname.includes('/backlog') ? 'active' : ''}`}
                    >
                        Backlog
                    </Link>
                    <Link
                        to={`/project/${projectId}/settings`}
                        className={`project-tab ${location.pathname.includes('/settings') ? 'active' : ''}`}
                    >
                        Settings
                    </Link>
                </nav>
            </div>

            <div className="project-content">
                <Outlet context={{ project, searchTerm: '' }} />
            </div>
        </div>
    );
};

export default ProjectDashboard;
