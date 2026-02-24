const Team = require('../models/firestore/Team');
const TeamInvitation = require('../models/firestore/TeamInvitation');
const User = require('../models/firestore/User');

// POST /api/teams — create a new team
exports.createTeam = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Team name is required' });
        }

        // Check for duplicate team name (case-insensitive)
        const allTeams = await Team.findAll();
        const nameExists = allTeams.some(t => t.name.toLowerCase() === name.trim().toLowerCase());
        if (nameExists) {
            return res.status(400).json({ message: 'A team with that name already exists' });
        }

        const team = await Team.create({
            name: name.trim(),
            description: description || '',
            adminId: req.user.id,
        });
        res.status(201).json(team);
    } catch (error) {
        console.error('CREATE TEAM ERROR:', error);
        res.status(500).json({ message: 'Error creating team', error: error.message });
    }
};

// GET /api/teams — get teams the current user is a member of
exports.getMyTeams = async (req, res) => {
    try {
        const allTeams = await Team.findAll();
        const myTeams = allTeams.filter(t => t.members && t.members.includes(req.user.id));

        // Enrich with member profiles
        const enriched = await Promise.all(
            myTeams.map(async (team) => {
                const memberProfiles = await Promise.all(
                    (team.members || []).map(uid => User.findByPk(uid))
                );
                return {
                    ...team,
                    memberProfiles: memberProfiles.filter(Boolean).map(u => ({
                        id: u.id,
                        username: u.username,
                        email: u.email,
                        profilePicture: u.profilePicture || null,
                    })),
                };
            })
        );
        res.json(enriched);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching teams', error: error.message });
    }
};

// GET /api/teams/:teamId — get team details
exports.getTeamById = async (req, res) => {
    try {
        const team = await Team.findByPk(req.params.teamId);
        if (!team) return res.status(404).json({ message: 'Team not found' });

        // Check membership
        if (!team.members || !team.members.includes(req.user.id)) {
            return res.status(403).json({ message: 'You are not a member of this team' });
        }

        const memberProfiles = await Promise.all(
            (team.members || []).map(uid => User.findByPk(uid))
        );
        res.json({
            ...team,
            memberProfiles: memberProfiles.filter(Boolean).map(u => ({
                id: u.id,
                username: u.username,
                email: u.email,
                profilePicture: u.profilePicture || null,
            })),
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching team', error: error.message });
    }
};

// PATCH /api/teams/:teamId — update team name/description (admin only)
exports.updateTeam = async (req, res) => {
    try {
        const team = await Team.findByPk(req.params.teamId);
        if (!team) return res.status(404).json({ message: 'Team not found' });
        if (team.adminId !== req.user.id) {
            return res.status(403).json({ message: 'Only the team admin can edit this team' });
        }

        const { name, description } = req.body;
        const updates = {};
        if (name) updates.name = name.trim();
        if (description !== undefined) updates.description = description;

        const updated = await Team.update(req.params.teamId, updates);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Error updating team', error: error.message });
    }
};

// POST /api/teams/:teamId/invite — invite a user by email (admin only)
exports.inviteToTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { email } = req.body;

        if (!email) return res.status(400).json({ message: 'Email is required' });

        const team = await Team.findByPk(teamId);
        if (!team) return res.status(404).json({ message: 'Team not found' });
        if (team.adminId !== req.user.id) {
            return res.status(403).json({ message: 'Only the team admin can send invitations' });
        }

        // Check if user already a member
        const invitee = await User.findOne({ where: { email } });
        if (invitee && team.members && team.members.includes(invitee.id)) {
            return res.status(400).json({ message: 'This user is already a member of the team' });
        }

        // Check if there's already a pending invite
        const existing = await TeamInvitation.findPending(teamId, email);
        if (existing) {
            return res.status(400).json({ message: 'An invitation is already pending for this email' });
        }

        const invitation = await TeamInvitation.create({ teamId, inviteeEmail: email });

        // In production, send an email here. For now, return the token for the frontend to use.
        const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-team-invite/${invitation.token}`;
        console.log(`TEAM INVITE LINK: ${inviteLink}`); // Log for development

        res.status(201).json({
            message: `Invitation sent to ${email}`,
            inviteLink, // Return link so frontend can copy/share it
            token: invitation.token,
        });
    } catch (error) {
        console.error('INVITE ERROR:', error);
        res.status(500).json({ message: 'Error sending invitation', error: error.message });
    }
};

// POST /api/teams/accept-invite/:token — accept a team invitation
exports.acceptTeamInvite = async (req, res) => {
    try {
        const { token } = req.params;
        const invitation = await TeamInvitation.findByToken(token);

        if (!invitation) {
            return res.status(404).json({ message: 'Invalid or expired invitation link' });
        }
        if (invitation.status !== 'pending') {
            return res.status(400).json({ message: 'This invitation has already been used' });
        }
        if (new Date(invitation.expiresAt) < new Date()) {
            return res.status(400).json({ message: 'This invitation has expired' });
        }

        // Use the authenticated user's ID (they must be logged in to accept)
        await Team.addMember(invitation.teamId, req.user.id);
        await TeamInvitation.accept(invitation.id);

        const team = await Team.findByPk(invitation.teamId);
        res.json({ message: `You have joined the team: ${team.name}`, team });
    } catch (error) {
        res.status(500).json({ message: 'Error accepting invitation', error: error.message });
    }
};

// DELETE /api/teams/:teamId/members/:userId — remove a member (admin only)
exports.removeMember = async (req, res) => {
    try {
        const { teamId, userId } = req.params;
        const team = await Team.findByPk(teamId);
        if (!team) return res.status(404).json({ message: 'Team not found' });
        if (team.adminId !== req.user.id) {
            return res.status(403).json({ message: 'Only the team admin can remove members' });
        }
        if (userId === team.adminId) {
            return res.status(400).json({ message: 'Admin cannot be removed from the team' });
        }

        await Team.removeMember(teamId, userId);
        res.json({ message: 'Member removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing member', error: error.message });
    }
};
