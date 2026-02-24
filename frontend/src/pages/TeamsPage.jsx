import React, { useState, useEffect } from 'react';
import { FaUsers, FaPlus, FaCrown, FaEnvelope, FaTrash, FaLink, FaCopy, FaCheck } from 'react-icons/fa';
import CreateTeamModal from '../components/teams/CreateTeamModal';
import InviteToTeamModal from '../components/teams/InviteToTeamModal';
import './TeamsPage.css';

const TeamsPage = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteTarget, setInviteTarget] = useState(null);
    const [copiedLink, setCopiedLink] = useState(null);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:3000/api/teams', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTeams(data);
                if (data.length > 0 && !selectedTeam) {
                    setSelectedTeam(data[0]);
                }
            }
        } catch (err) {
            console.error('Failed to fetch teams:', err);
        } finally {
            setLoading(false);
        }
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
        if (!window.confirm('Remove this member from the team?')) return;
        try {
            const res = await fetch(`http://localhost:3000/api/teams/${teamId}/members/${userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
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
        } catch (err) {
            console.error('Failed to remove member:', err);
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
                    <h1><FaUsers style={{ marginRight: '12px', color: 'var(--theme-primary)' }} />Teams</h1>
                    <p className="teams-subtitle">Create teams, invite members, and collaborate together.</p>
                </div>
                <button className="btn-create-team" onClick={() => setShowCreateModal(true)}>
                    <FaPlus /> New Team
                </button>
            </div>

            {loading ? (
                <div className="teams-loading">Loading your teams...</div>
            ) : teams.length === 0 ? (
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
                                {selectedTeam.adminId === currentUser._id && (
                                    <button
                                        className="btn-invite"
                                        onClick={() => handleInviteClick(selectedTeam)}
                                    >
                                        <FaEnvelope /> Invite Member
                                    </button>
                                )}
                            </div>

                            {copiedLink && (
                                <div className="invite-link-banner">
                                    <FaCheck style={{ color: '#10b981' }} />
                                    <span>Invite link copied to clipboard!</span>
                                    <code className="invite-link-code">{copiedLink}</code>
                                </div>
                            )}

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
                        </div>
                    )}
                </div>
            )}

            {showCreateModal && (
                <CreateTeamModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={handleTeamCreated}
                />
            )}

            {showInviteModal && inviteTarget && (
                <InviteToTeamModal
                    team={inviteTarget}
                    onClose={() => { setShowInviteModal(false); setInviteTarget(null); }}
                    onInviteSent={handleInviteSent}
                />
            )}
        </div>
    );
};

export default TeamsPage;
