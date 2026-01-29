const Issue = require('../models/firestore/Issue');
const Project = require('../models/firestore/Project');
const User = require('../models/firestore/User');
const { db } = require('../config/firebaseAdmin');

exports.createIssue = async (req, res) => {
    try {
        const { projectId, title, type, priority, reporterId, assignee } = req.body;

        if (!projectId) return res.status(400).json({ message: 'Project ID required' });

        // Resolve Assignee Email to ID
        let resolvedAssigneeId = req.body.assigneeId || null;
        console.log(`[createIssue] Incoming assignee text: '${assignee}'`);

        if (!resolvedAssigneeId && assignee) {
            const assigneeUser = await User.findByEmail(assignee);
            if (assigneeUser) {
                resolvedAssigneeId = assigneeUser.id;
                console.log(`[createIssue] Resolved '${assignee}' to User ID: ${resolvedAssigneeId}`);
            } else {
                console.warn(`[createIssue] Warning: Assignee email '${assignee}' not found in DB.`);
            }
        }

        // Atomic Transaction for ID Generation (e.g. PROJ-1, PROJ-2)
        const result = await db.runTransaction(async (t) => {
            const projectRef = db.collection('projects').doc(projectId);
            const projectDoc = await t.get(projectRef);

            if (!projectDoc.exists) throw new Error('Project not found');

            const projectData = projectDoc.data();
            const currentCounter = projectData.issueCounter || 0;
            const newCounter = currentCounter + 1;
            const key = projectData.key || 'PROJ';
            const issueId = `${key}-${newCounter}`;

            // Update project counter
            t.update(projectRef, { issueCounter: newCounter });

            // Create Issue
            const issueRef = db.collection('issues').doc();
            const now = new Date().toISOString();

            const newIssueData = {
                title,
                issueId,
                projectId,
                type: type || 'Task',
                priority: priority || 'Medium',
                status: 'To Do',
                reporterId: reporterId || req.user.id,
                assigneeId: resolvedAssigneeId,
                sprintId: req.body.sprintId || null,
                storyPoints: req.body.storyPoints || 0,
                description: req.body.description || '',
                createdAt: now,
                updatedAt: now,
                history: [
                    { action: 'created', user: req.user.id, timestamp: now }
                ]
            };

            t.set(issueRef, newIssueData);

            return { id: issueRef.id, ...newIssueData };
        });

        res.status(201).json(result);

    } catch (error) {
        console.error('Create Issue Error:', error);
        res.status(500).json({ message: 'Error creating issue', error: error.message });
    }
};

exports.updateIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const userRole = req.user.role; // admin, project_lead, user

        const issue = await Issue.findByPk(id);
        if (!issue) return res.status(404).json({ message: 'Issue not found' });

        // Workflow Validation
        if (updates.status && updates.status !== issue.status) {
            // Rules:
            // User: To Do -> In Progress -> Review
            // Lead: Review -> Done
            // Admin: Any

            const oldStatus = issue.status;
            const newStatus = updates.status;

            let allowed = false;

            if (userRole === 'admin') allowed = true;
            else if (userRole === 'project-lead') {
                // Lead can do anything basically, or restrict strictly? 
                // Jira Usually allows leads to do all.
                allowed = true;
            } else {
                // Regular User Rules
                if (oldStatus === 'To Do' && newStatus === 'In Progress') allowed = true;
                else if (oldStatus === 'In Progress' && newStatus === 'Review') allowed = true;
                else if (oldStatus === 'In Progress' && newStatus === 'Done') allowed = true; // Allow explicit completion
                else if (oldStatus === 'Review' && newStatus === 'In Progress') allowed = true; // Send back
                else if (oldStatus === 'Review' && newStatus === 'Done') allowed = true; // Allow completion from review
                // Review -> Done is BLOCKED for User
            }

            if (!allowed) {
                return res.status(403).json({
                    message: `Role '${userRole}' cannot transition from '${oldStatus}' to '${newStatus}'`
                });
            }

            // Append History
            const historyItem = {
                action: 'status_change',
                from: oldStatus,
                to: newStatus,
                user: req.user.id,
                timestamp: new Date().toISOString()
            };

            // Note: In a real app, use arrayUnion for atomic update of history
            // For now simple overwrite with spread
            updates.history = [...(issue.history || []), historyItem];
        }

        const updatedIssue = await Issue.update(id, updates);
        res.json(updatedIssue);

    } catch (error) {
        res.status(500).json({ message: 'Error updating issue', error: error.message });
    }
};

exports.getMyIssues = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(`[getMyIssues] Fetching issues for user: ${userId}`);

        // 1. Find all projects where user is a member or lead
        const allProjects = await Project.findAll();

        console.log(`[getMyIssues] Checking access for User ID: ${userId} (${typeof userId})`);

        const myProjectIds = allProjects
            .filter(p => {
                const isLead = String(p.leadId) === String(userId);
                const isMember = p.members && p.members.map(String).includes(String(userId));
                // Debug log for every project logic
                // console.log(`Project ${p.id}: Lead? ${isLead} (${p.leadId}), Member? ${isMember}`);
                return isLead || isMember;
            })
            .map(p => p.id);

        console.log(`[getMyIssues] User has access to projects: ${myProjectIds.join(', ')}`);

        if (myProjectIds.length === 0) {
            return res.json([]);
        }

        // 2. Fetch all issues for these projects (Inefficient for huge DBs, but fine for prototype)
        // Ideally: Issue.findAll({ where: { projectId: { in: myProjectIds } } })
        const allIssues = await Issue.findAll();
        const issues = allIssues.filter(issue => myProjectIds.map(String).includes(String(issue.projectId)));

        console.log(`[getMyIssues] Returning ${issues.length} issues (Total in DB: ${allIssues.length})`);

        res.json(issues);
    } catch (error) {
        console.error('Get My Issues Error:', error);
        res.status(500).json({ message: 'Error fetching your issues', error: error.message });
    }
};
exports.getIssueDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const issue = await Issue.findByPk(id);
        if (!issue) return res.status(404).json({ message: 'Issue not found' });
        res.json(issue);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching issue', error: error.message });
    }
};
exports.deleteIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Issue.destroy({ where: { id } });
        if (result) {
            res.json({ message: 'Issue deleted' });
        } else {
            res.status(404).json({ message: 'Issue not found or could not be deleted' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting issue', error: error.message });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const userId = req.user.id; // From authMiddleware

        if (!text) return res.status(400).json({ message: 'Comment text is required' });

        const issue = await Issue.findByPk(id);
        if (!issue) return res.status(404).json({ message: 'Issue not found' });

        const newComment = {
            id: Date.now().toString(), // Simple ID generation
            text,
            userId,
            createdAt: new Date().toISOString()
        };

        const updatedComments = [...(issue.comments || []), newComment];

        // Add history item
        const historyItem = {
            action: 'comment_added',
            user: userId,
            timestamp: new Date().toISOString()
        };

        const updatedHistory = [...(issue.history || []), historyItem];

        await Issue.update(id, {
            comments: updatedComments,
            history: updatedHistory
        });

        res.status(201).json(newComment);
    } catch (error) {
        console.error('Add Comment Error:', error);
        res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
};
