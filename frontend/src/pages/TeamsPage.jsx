import API_BASE_URL from '../config.js';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUsers, FaPlus, FaCrown, FaEnvelope, FaTrash, FaLink, FaCopy, FaCheck, FaProjectDiagram, FaVideo } from 'react-icons/fa';
import CreateTeamModal from '../components/teams/CreateTeamModal';
import InviteToTeamModal from '../components/teams/InviteToTeamModal';
import ConfirmModal from '../components/common/ConfirmModal';
import TeamChat from '../components/teams/TeamChat';
import CreateProjectModal from '../components/dashboard/CreateProjectModal';
import ScheduleMeetingModal from '../components/teams/ScheduleMeetingModal';
import './TeamsPage.css';

const TeamsPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('projects');
    const [activeTeamTab, setActiveTeamTab] = useState('members');
    const [teams, setTeams] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteTarget, setInviteTarget] = useState(null);
    const [copiedLink, setCopiedLink] = useState(null);
    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false, title: '', message: '', type: 'danger', confirmText: 'Confirm', onConfirm: () => { }
    });
    const chatRef = useRef(null);
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    useEffect(() => {
        const loadRegistryData = async () => {
            setLoading(true);
            try {
                const [pRes, tRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/projects`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_BASE_URL}/api/teams`, { headers: { Authorization: `Bearer ${token}` } })
                ]);

                if (pRes.ok) {
                    setProjects(await pRes.json());
                }

                if (tRes.ok) {
                    const tData = await tRes.json();
                    setTeams(tData);
                    if (tData.length > 0 && !selectedTeam) {
                        setSelectedTeam(tData[0]);
                    }
                }
            } catch (err) {
                console.error('Failed to load registry data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadRegistryData();
    }, [token]);

    const handleProjectCreated = (newProject) => {
        setProjects(prev => [...prev, newProject]);
    };

    const handleTeamCreated = (newTeam) => {
        setTeams(prev => [...prev, { ...newTeam, memberProfiles: [currentUser] }]);
        setSelectedTeam({ ...newTeam, memberProfiles: [currentUser] });
    };

    const handleInviteClick = (team) => {
        setInviteTarget(team);
        setShowInviteModal(true);
    };

    const handleInviteSent = (inviteLink) => {
        // Auto-copy link
        navigator.clipboard.writeText(inviteLink).catch(() => { });
        setCopiedLink(inviteLink);
        setTimeout(() => setCopiedLink(null), 3000);
    };

    const handleRemoveMember = async (teamId, userId) => {
        const isSelf = (userId === currentUser._id);
        const confirmMsg = isSelf ? 'Are you sure you want to leave this team? You will lose access immediately.' : 'Are you sure you want to remove this member from the team?';
        const title = isSelf ? 'Leave Team' : 'Remove Member';

        setConfirmConfig({
            isOpen: true,
            title,
            message: confirmMsg,
            type: 'warning',
            confirmText: isSelf ? 'Leave Team' : 'Remove',
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                try {
                    const res = await fetch(`${API_BASE_URL}/api/teams/${teamId}/members/${userId}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        if (isSelf) {
                            // I left the team, so just remove the team from my list
                            setTeams(prev => prev.filter(t => t.id !== teamId));
                            if (selectedTeam?.id === teamId) setSelectedTeam(null);
                        } else {
                            // I removed someone else
                            setTeams(prev => prev.map(t => {
                                if (t.id !== teamId) return t;
                                return {
                                    ...t,
                                    memberProfiles: t.memberProfiles.filter(m => m.id !== userId),
                                    members: t.members.filter(m => m !== userId),
                                };
                            }));
                            if (selectedTeam?.id === teamId) {
                                setSelectedTeam(prev => ({
                                    ...prev,
                                    memberProfiles: prev.memberProfiles.filter(m => m.id !== userId),
                                    members: prev.members.filter(m => m !== userId),
                                }));
                            }
                        }
                    }
                } catch (err) {
                    console.error('Failed to remove member:', err);
                }
            }
        });
    };

    const handleDeleteTeam = async (teamId) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Delete Team',
            message: 'Are you sure you want to permanently delete this team? All members and pending invitations will be removed. This action cannot be undone.',
            type: 'danger',
            confirmText: 'Delete Team',
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                try {
                    const res = await fetch(`${API_BASE_URL}/api/teams/${teamId}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        setTeams(prev => prev.filter(t => t.id !== teamId));
                        if (selectedTeam?.id === teamId) setSelectedTeam(null);
                    }
                } catch (err) {
                    console.error('Failed to delete team:', err);
                }
            }
        });
    };

    const handleDeleteProject = async (projectId, projectName) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Delete Project',
            message: `Are you sure you want to permanently delete the project "${projectName}"? All associated boards, sprints, and issues will be wiped.`,
            type: 'danger',
            confirmText: 'Delete Project',
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                try {
                    const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        setProjects(prev => prev.filter(p => p.id !== projectId));
                    } else {
                        const data = await res.json();
                        alert(data.message || 'Failed to delete project.');
                    }
                } catch (err) {
                    console.error('Failed to delete project:', err);
                }
            }
        });
    };

    const handleScheduleMeeting = async (meetingPayload) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/teams/${selectedTeam.id}/schedule-meeting`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(meetingPayload)
            });

            if (res.ok) {
                setShowScheduleModal(false);
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to schedule meeting.');
            }
        } catch (err) {
            console.error('Failed to schedule meeting API call:', err);
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <div className="teams-page">
            <div className="teams-header">
                <div>
                    <h1><FaProjectDiagram style={{ marginRight: '12px', color: 'var(--theme-primary)' }} />Registry</h1>
                    <p className="teams-subtitle">Manage your personal projects and team collaborations.</p>
                </div>
                {activeTab === 'teams' ? (
                    <button className="btn-create-team" onClick={() => setShowCreateModal(true)}>
                        <FaPlus /> New Team
                    </button>
                ) : (
                    <button className="btn-create-team" onClick={() => setShowProjectModal(true)}>
                        <FaPlus /> New Project
                    </button>
                )}
            </div>

            <div className="registry-tabs">
                <button
                    className={`registry-tab ${activeTab === 'projects' ? 'active' : ''}`}
                    onClick={() => setActiveTab('projects')}
                >
                    My Projects
                </button>
                <button
                    className={`registry-tab ${activeTab === 'teams' ? 'active' : ''}`}
                    onClick={() => setActiveTab('teams')}
                >
                    My Teams
                </button>
            </div>

            {loading ? (
                <div className="teams-loading">Loading registry data...</div>
            ) : activeTab === 'projects' ? (
                // --- PROJECTS TAB VIEW ---
                projects.length === 0 ? (
                    <div className="teams-empty">
                        <FaProjectDiagram size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                        <h3>No Projects Yet</h3>
                        <p>Create your first project to start tracking your work.</p>
                        <button className="btn-create-team" onClick={() => setShowProjectModal(true)}>
                            <FaPlus /> Create Project
                        </button>
                    </div>
                ) : (
                    <div className="registry-projects-grid">
                        {projects.map(project => (
                            <Link to={`/project/${project.id}/board`} key={project.id} className="registry-project-card">
                                <button
                                    className="r-project-delete-btn"
                                    title="Delete Project"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDeleteProject(project.id, project.name);
                                    }}
                                >
                                    <FaTrash />
                                </button>
                                <div className="r-project-avatar">
                                    {project.key ? project.key.substring(0, 1) : 'P'}
                                </div>
                                <div className="r-project-info">
                                    <h3>{project.name}</h3>
                                    <span className="r-project-key">{project.key}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )
            ) : (
                // --- TEAMS TAB VIEW ---
                teams.length === 0 ? (
                    <div className="teams-empty">
                        <FaUsers size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                        <h3>No Teams Yet</h3>
                        <p>Create your first team to start collaborating with others.</p>
                        <button className="btn-create-team" onClick={() => setShowCreateModal(true)}>
                            <FaPlus /> Create a Team
                        </button>
                    </div>
                ) : (
                    <div className="teams-layout">
                        {/* Team List Sidebar */}
                        <div className="team-list-panel">
                            {teams.map(team => (
                                <div
                                    key={team.id}
                                    className={`team-list-item ${selectedTeam?.id === team.id ? 'active' : ''}`}
                                    onClick={() => setSelectedTeam(team)}
                                >
                                    <div className="team-avatar">{getInitials(team.name)}</div>
                                    <div className="team-list-info">
                                        <span className="team-name">{team.name}</span>
                                        <span className="team-meta">
                                            {team.memberProfiles?.length || 0} member{team.memberProfiles?.length !== 1 ? 's' : ''}
                                            {team.adminId === currentUser._id && (
                                                <span className="admin-badge"><FaCrown /> Admin</span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Team Detail Panel */}
                        {selectedTeam && (
                            <div className="team-detail-panel">
                                <div className="team-detail-header">
                                    <div>
                                        <h2>{selectedTeam.name}</h2>
                                        {selectedTeam.description && (
                                            <p className="team-description">{selectedTeam.description}</p>
                                        )}
                                    </div>
                                    <div className="team-header-actions" style={{ display: 'flex', gap: '8px' }}>
                                        {selectedTeam.adminId === currentUser._id ? (
                                            <>
                                                <button
                                                    className="btn-video-meeting"
                                                    onClick={() => setShowScheduleModal(true)}
                                                    style={{ padding: '8px 16px', background: 'var(--theme-primary)', color: 'white', border: 'none', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s ease' }}
                                                >
                                                    <FaVideo /> Schedule Meeting
                                                </button>
                                                <button
                                                    className="btn-invite"
                                                    onClick={() => handleInviteClick(selectedTeam)}
                                                >
                                                    <FaEnvelope /> Invite Member
                                                </button>
                                                <button
                                                    className="btn-remove-member"
                                                    onClick={() => handleDeleteTeam(selectedTeam.id)}
                                                    style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                                >
                                                    <FaTrash /> Delete Team
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                className="btn-remove-member"
                                                onClick={() => handleRemoveMember(selectedTeam.id, currentUser._id)}
                                                style={{ padding: '8px 16px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                            >
                                                <FaTrash /> Leave Team
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {copiedLink && (
                                    <div className="invite-link-banner">
                                        <FaCheck style={{ color: '#10b981' }} />
                                        <span>Invite link copied to clipboard!</span>
                                        <code className="invite-link-code">{copiedLink}</code>
                                    </div>
                                )}

                                <div className="team-sub-header-tabs">
                                    <button
                                        className={`team-sub-tab ${activeTeamTab === 'members' ? 'active' : ''}`}
                                        onClick={() => setActiveTeamTab('members')}
                                    >
                                        Members
                                    </button>
                                    <button
                                        className={`team-sub-tab ${activeTeamTab === 'chat' ? 'active' : ''}`}
                                        onClick={() => setActiveTeamTab('chat')}
                                    >
                                        Live Chat
                                    </button>
                                </div>

                                {activeTeamTab === 'members' && (
                                    <div className="members-section">
                                        <h3 className="members-title">
                                            <FaUsers style={{ marginRight: '8px' }} />
                                            Members ({selectedTeam.memberProfiles?.length || 0})
                                        </h3>
                                        <div className="members-list">
                                            {(selectedTeam.memberProfiles || []).map(member => (
                                                <div key={member.id} className="member-card">
                                                    <div className="member-avatar">
                                                        {member.profilePicture ? (
                                                            <img src={member.profilePicture} alt={member.username} />
                                                        ) : (
                                                            <span>{getInitials(member.username)}</span>
                                                        )}
                                                    </div>
                                                    <div className="member-info">
                                                        <span className="member-name">{member.username}</span>
                                                        <span className="member-email">{member.email}</span>
                                                    </div>
                                                    <div className="member-badges">
                                                        {selectedTeam.adminId === member.id && (
                                                            <span className="role-badge admin">
                                                                <FaCrown /> Admin
                                                            </span>
                                                        )}
                                                        {selectedTeam.adminId !== member.id && (
                                                            <span className="role-badge member-role">Member</span>
                                                        )}
                                                    </div>
                                                    {/* Admin can remove non-admin members */}
                                                    {selectedTeam.adminId === currentUser._id && member.id !== currentUser._id && (
                                                        <button
                                                            className="btn-remove-member"
                                                            onClick={() => handleRemoveMember(selectedTeam.id, member.id)}
                                                            title="Remove member"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTeamTab === 'chat' && (
                                    <TeamChat team={selectedTeam} ref={chatRef} />
                                )}
                            </div>
                        )}
                    </div>
                )
            )}

            {showCreateModal && (
                <CreateTeamModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={handleTeamCreated}
                />
            )}

            {showProjectModal && (
                <CreateProjectModal
                    isOpen={showProjectModal}
                    onClose={() => setShowProjectModal(false)}
                    onProjectCreated={handleProjectCreated}
                />
            )}

            {showInviteModal && inviteTarget && (
                <InviteToTeamModal
                    team={inviteTarget}
                    onClose={() => { setShowInviteModal(false); setInviteTarget(null); }}
                    onInviteSent={handleInviteSent}
                />
            )}

            <ConfirmModal
                {...confirmConfig}
                onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            />

            {showScheduleModal && (
                <ScheduleMeetingModal
                    team={selectedTeam}
                    onClose={() => setShowScheduleModal(false)}
                    onSchedule={handleScheduleMeeting}
                />
            )}
        </div>
    );
};

export default TeamsPage;


