const Team = require('../models/firestore/Team');
const TeamInvitation = require('../models/firestore/TeamInvitation');
const User = require('../models/firestore/User');
const Notification = require('../models/firestore/Notification');

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
                        _id: u.id,
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
                _id: u.id,
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
        let { email, jobDescription, paymentAmount } = req.body;

        if (!email) return res.status(400).json({ message: 'Email is required' });
        email = email.toLowerCase().trim();

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

        const invitation = await TeamInvitation.create({ teamId, inviteeEmail: email, jobDescription, paymentAmount });

        // In production, send an email here. For now, return the token for the frontend to use.
        const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-team-invite/${invitation.token}`;
        console.log(`TEAM INVITE LINK: ${inviteLink}`); // Log for development

        // --- NEW CODE: Create an in-app notification if the user already exists ---
        if (invitee) {
            await Notification.create({
                userId: invitee.id,
                type: 'team_invite',
                title: 'New Team Invitation',
                message: `You have been invited to join the team: ${team.name}`,
                metadata: {
                    teamId: team.id,
                    invitationId: invitation.id,
                    inviteUrl: inviteLink
                }
            });
        }
        // --------------------------------------------------------------------------

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

// GET /api/teams/invite/:token — get invitation details
exports.getInviteDetails = async (req, res) => {
    try {
        const { token } = req.params;
        const invitation = await TeamInvitation.findByToken(token);

        if (!invitation) return res.status(404).json({ message: 'Invalid or expired invitation link' });
        if (invitation.status !== 'pending') return res.status(400).json({ message: 'This invitation has already been used' });
        if (new Date(invitation.expiresAt) < new Date()) return res.status(400).json({ message: 'This invitation has expired' });

        const team = await Team.findByPk(invitation.teamId);
        res.json({ invitation, team });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching invitation details', error: error.message });
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

        // Generate Payment Contract based on the accepted offer
        const PaymentContract = require('../models/firestore/PaymentContract');
        await PaymentContract.create({
            teamId: team.id,
            adminId: team.adminId,
            seekerId: req.user.id,
            jobDescription: invitation.jobDescription || 'Standard Team Access',
            paymentAmount: invitation.paymentAmount || 0
        });

        res.json({ message: `You have joined the team: ${team.name}`, team });
    } catch (error) {
        res.status(500).json({ message: 'Error accepting invitation', error: error.message });
    }
};

// DELETE /api/teams/:teamId/members/:userId — remove a member (admin only, or self-removal)
exports.removeMember = async (req, res) => {
    try {
        const { teamId, userId } = req.params;
        const team = await Team.findByPk(teamId);
        if (!team) return res.status(404).json({ message: 'Team not found' });

        const isSelfRemoval = (req.user.id === userId);
        const isAdmin = (team.adminId === req.user.id);

        if (!isAdmin && !isSelfRemoval) {
            return res.status(403).json({ message: 'Only the team admin can remove other members' });
        }
        if (userId === team.adminId) {
            return res.status(400).json({ message: 'Admin cannot be removed from the team. Delete the team instead.' });
        }

        await Team.removeMember(teamId, userId);
        res.json({ message: isSelfRemoval ? 'You have left the team' : 'Member removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing member', error: error.message });
    }
};

// DELETE /api/teams/:teamId — delete a team entirely (admin only)
exports.deleteTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const team = await Team.findByPk(teamId);
        if (!team) return res.status(404).json({ message: 'Team not found' });

        if (team.adminId !== req.user.id) {
            return res.status(403).json({ message: 'Only the team admin can delete the team' });
        }

        // Delete the team document
        await Team.collection.doc(teamId).delete();

        // Cleanup: Optionally delete all pending invitations for this team
        const invitesSnapshot = await TeamInvitation.collection.where('teamId', '==', teamId).get();
        const batch = require('../config/firebaseAdmin').db.batch();
        invitesSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        res.json({ message: 'Team deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting team', error: error.message });
    }
};

// GET /api/teams/:teamId/messages — get chat history
const Message = require('../models/firestore/Message'); // Import at spot of usage due to existing imports
exports.getTeamMessages = async (req, res) => {
    try {
        const { teamId } = req.params;
        const limit = parseInt(req.query.limit) || 50;

        // Ensure user is in team
        const team = await Team.findByPk(teamId);
        if (!team || (!team.members.includes(req.user.id) && team.adminId !== req.user.id)) {
            return res.status(403).json({ message: 'Not authorized to view these messages' });
        }

        const messages = await Message.findAllByTeam(teamId, limit);
        res.json(messages);
    } catch (error) {
        console.error('GET MESSAGES ERROR:', error);
        res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
};

// POST /api/teams/:teamId/messages — send and persist a message
exports.sendMessage = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { text, type, attachments } = req.body;

        if (!text && !attachments) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        const team = await Team.findByPk(teamId);
        if (!team || (!team.members.includes(req.user.id) && team.adminId !== req.user.id)) {
            return res.status(403).json({ message: 'Not authorized to send messages to this team' });
        }

        const newMessage = await Message.create({
            teamId,
            userId: req.user.id,
            text,
            type: type || 'text',
            attachments: attachments || []
        });

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('SEND MESSAGE ERROR:', error);
        res.status(500).json({ message: 'Error sending message', error: error.message });
    }
};

// POST /api/teams/:teamId/schedule-meeting
const Issue = require('../models/firestore/Issue');
exports.scheduleMeeting = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { title, meetingLink, scheduledFor } = req.body;

        if (!title || !meetingLink || !scheduledFor) {
            return res.status(400).json({ message: 'Missing required meeting details' });
        }

        const team = await Team.findByPk(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Only Admin can schedule team-wide meetings for now
        if (team.adminId !== req.user.id) {
            return res.status(403).json({ message: 'Only the team admin can schedule meetings' });
        }

        // Disperse Agenda item & Notification to every member (including admin)
        const dispatchPromises = team.members.map(async (memberId) => {
            // 1. Create Dashboard Agenda Item
            await Issue.create({
                title: title,
                projectId: 'TEAM_MEETING',
                type: 'Meeting',
                status: 'To Do',
                priority: 'High',
                description: `Join meeting here: ${meetingLink}`,
                assigneeId: memberId,
                reporterId: req.user.id,
                dueDate: scheduledFor
            });

            // 2. Dispatch System Notification
            await Notification.create({
                userId: memberId,
                type: 'info',
                message: `📅 New Meeting Scheduled: "${title}" for ${new Date(scheduledFor).toLocaleString()}.`,
                metadata: { teamId, meetingLink, scheduledFor }
            });
        });

        await Promise.all(dispatchPromises);

        res.status(200).json({ message: 'Meeting scheduled successfully for all members' });
    } catch (error) {
        console.error('SCHEDULE MEETING ERROR:', error);
        res.status(500).json({ message: 'Error scheduling meeting', error: error.message });
    }
};
