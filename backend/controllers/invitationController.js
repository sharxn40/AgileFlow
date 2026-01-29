const crypto = require('crypto');
const Invitation = require('../models/firestore/Invitation');
const Project = require('../models/firestore/Project');
const User = require('../models/firestore/User');
const Notification = require('../models/firestore/Notification');
const sendEmail = require('../utils/sendEmail');
const { db } = require('../config/firebaseAdmin');
const admin = require('firebase-admin'); // For ArrayUnion if needed, or simple update

exports.inviteUser = async (req, res) => {
    try {
        const { email, projectId } = req.body;
        const inviterId = req.user.id;

        const project = await Project.findByPk(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Check permission (Only Lead or Check if member has permission - usually admins/leads)
        // For now, let any member invite or restrict to Lead?
        // Restricting to Lead for safety
        /* 
        if (project.leadId !== inviterId) {
             return res.status(403).json({ message: 'Only Data Lead can invite members' });
        }
        */

        // Generate Token
        const token = crypto.randomBytes(20).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

        const invitation = await Invitation.create({
            email,
            projectId,
            token,
            invitedBy: inviterId,
            expiresAt
        });

        // CHECK IF USER EXISTS
        console.log(`[Inviter] Searching for user with email: '${email}'`);
        const existingUser = await User.findByEmail(email);
        console.log(`[Inviter] User found? ${!!existingUser} (ID: ${existingUser?.id})`);

        const inviteUrl = `http://localhost:5173/accept-invite/${token}`;

        if (existingUser) {
            console.log('[Inviter] Creating in-app notification...');
            // User exists? Send Notification!
            await Notification.create({
                userId: existingUser.id,
                type: 'invitation',
                message: `You have been invited to join project: ${project.name}`,
                metadata: { projectId: project.id, token: token, inviteUrl: inviteUrl }
            });
            console.log(`Notification sent to ${email} (User ID: ${existingUser.id})`);
        } else {
            const message = `
            You have been invited to join the project: ${project.name} on AgileFlow.
            
            Please click the following link to accept the invitation:
            ${inviteUrl}
            
            This link expires in 24 hours.
        `;

            await sendEmail({
                email,
                subject: 'AgileFlow Project Invitation',
                message
            });
        }

        res.status(201).json({ message: 'Invitation sent', invitationId: invitation.id });

    } catch (error) {
        console.error('Invite Error:', error);
        res.status(500).json({ message: 'Error sending invitation', error: error.message });
    }
};

exports.acceptInvitation = async (req, res) => {
    try {
        const { token } = req.body;
        const userId = req.user.id;

        console.log(`Accepting invite: Token=${token}, User=${userId}`);

        const invitation = await Invitation.findByToken(token);
        if (!invitation) return res.status(404).json({ message: 'Invalid token' });

        if (new Date(invitation.expiresAt) < new Date()) {
            return res.status(400).json({ message: 'Invitation expired' });
        }

        if (invitation.status !== 'pending') {
            return res.status(400).json({ message: 'Invitation already accepted or invalid' });
        }

        const project = await Project.findByPk(invitation.projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Add user to project members
        // Using FieldValue would be better but simple update for now
        const members = project.members || [];
        if (!members.includes(userId)) {
            members.push(userId);
            await Project.update(project.id, { members });
        }

        await Invitation.update(invitation.id, { status: 'accepted', acceptedBy: userId });

        res.json({ message: 'Joined project successfully', projectId: project.id });

    } catch (error) {
        console.error('Accept Invite Error:', error);
        res.status(500).json({ message: 'Error accepting invitation', error: error.message });
    }
};
