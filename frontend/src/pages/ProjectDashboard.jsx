import React, { useState, useEffect } from 'react';
import { useParams, Outlet, Link, useLocation } from 'react-router-dom';
import './ProjectDashboard.css';
import InviteMemberModal from '../components/project/InviteMemberModal';
import { FaUserPlus } from 'react-icons/fa';

const ProjectDashboard = () => {
    const { projectId } = useParams();
    const location = useLocation();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

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
            <div className="project-content">
                <Outlet context={{ project }} />
            </div>
        </div>
    );
};

export default ProjectDashboard;
