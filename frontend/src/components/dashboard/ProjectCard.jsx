import React from 'react';
import { MdMoreHoriz, MdAccessTime } from 'react-icons/md';
import './ProjectCard.css';

const ProjectCard = ({ project, onClick }) => {
    // project: { id, name, type, role, progress, dueDate, members }

    return (
        <div className="project-card" onClick={onClick}>
            <div className="project-header">
                <div className="project-type-badge">{project.type}</div>
                <button className="more-btn"><MdMoreHoriz /></button>
            </div>

            <h3 className="project-title">{project.name}</h3>
            <div className="project-role">{project.role}</div>

            <div className="project-progress-wrapper">
                <div className="progress-label">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${project.progress}%`, backgroundColor: project.color || 'var(--theme-primary)' }}
                    ></div>
                </div>
            </div>

            <div className="project-footer">
                <div className="members-stack">
                    {/* Mock avatars */}
                    {[1, 2, 3].map(i => (
                        <div key={i} className="member-avatar"></div>
                    ))}
                </div>
                <div className="due-date">
                    <MdAccessTime /> {project.dueDate || 'No due date'}
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
