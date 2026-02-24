const User = require('../models/firestore/User');
const Project = require('../models/firestore/Project');
const Task = require('../models/firestore/Task');
const Notification = require('../models/firestore/Notification');

exports.getDashboardStats = async (req, res) => {
    try {
        const leadId = req.user.id;
        const { projectId } = req.query;

        let project;
        if (projectId) {
            project = await Project.findByPk(projectId);
            if (project && project.leadId !== leadId) {
                return res.status(403).json({ message: 'Not authorized' });
            }
        } else {
            // Fallback: Find first project led by this user
            project = await Project.findOne({ where: { leadId } });
        }

        if (!project) {
            return res.status(404).json({ message: 'No project found where you are the lead' });
        }

        // Get Active Sprint
        const sprints = await require('../models/firestore/Sprint').findAll({
            where: { projectId: project.id, status: 'active' }
        });
        const activeSprint = sprints[0] || null;

        // Get Blocked Tasks
        const blockedTasks = await Task.findAll({
            where: {
                projectId: project.id,
                priority: 'Critical', // Or status='Blocked' if we had it
                status: 'To Do' // Simplified check for now
            }
        });

        // Team count
        const teamMemberCount = project.members ? project.members.length : 0;

        res.json({
            projectId: project.id,
            projectName: project.name,
            leadName: req.user.username,
            activeSprint,
            teamMemberCount,
            blockedTaskCount: blockedTasks.length
        });
    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getTeamOverview = async (req, res) => {
    try {
        const leadId = req.user.id;
        const { projectId } = req.query;

        let project;
        if (projectId) {
            project = await Project.findByPk(projectId);
            if (project && project.leadId !== leadId) return res.json([]);
        } else {
            project = await Project.findOne({ where: { leadId } });
        }

        if (!project || !project.members) return res.json([]);

        let teamData = [];
        for (const memberId of project.members) {
            const user = await User.findByPk(memberId);
            if (user) {
                // Get tasks for this user in this project
                const tasks = await Task.findAll({
                    where: { assigneeId: memberId, projectId: project.id }
                });

                // --- Calculate Metrics ---
                const activeTasks = tasks.filter(t => t.status !== 'Done');
                const doneTasks = tasks.filter(t => t.status === 'Done');

                let workloadScore = 0;
                let overdueCount = 0;
                let riskCount = 0; // Due within 48h
                const now = new Date();
                const riskThreshold = new Date(now.getTime() + 48 * 60 * 60 * 1000);

                activeTasks.forEach(t => {
                    // Workload: 1 point base, 3 for High Priority
                    workloadScore += (t.priority === 'High' ? 3 : t.priority === 'Medium' ? 2 : 1);

                    if (t.dueDate) {
                        const due = new Date(t.dueDate);
                        if (due < now) overdueCount++;
                        else if (due < riskThreshold) riskCount++;
                    }
                });

                // Workload Status: < 5 Low, 5-12 Balanced, > 12 Overloaded
                let workloadStatus = 'Balanced';
                if (workloadScore < 5) workloadStatus = 'Low';
                if (workloadScore > 12) workloadStatus = 'Overloaded';

                teamData.push({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    tasks: activeTasks,
                    metrics: {
                        workloadScore,
                        workloadStatus,
                        overdueCount,
                        riskCount,
                        activeCount: activeTasks.length,
                        doneCount: doneTasks.length
                    }
                });
            }
        }
        res.json(teamData);
    } catch (error) {
        console.error("Team Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.reassignTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { newAssigneeId } = req.body;

        await Task.update(taskId, { assigneeId: newAssigneeId });
        res.json({ message: 'Task reassigned' });
    } catch (error) {
        res.status(500).json({ message: 'Error reassigning task' });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        // if (!query) return res.json([]); // Allow empty query to return all users

        // In-memory filter for now (Firestore limitations without compound indexes)
        const allUsers = await User.findAll();
        const results = allUsers.filter(u =>
            (u.email.toLowerCase().includes(query.toLowerCase()) ||
                u.username.toLowerCase().includes(query.toLowerCase())) &&
            u.role !== 'admin' // Hide admins from search
        ).slice(0, 5); // Limit 5

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Search Error' });
    }
};

exports.getProjects = async (req, res) => {
    try {
        const leadId = req.user.id;
        const projects = await Project.findAll({ where: { leadId } });
        res.json(projects);
    } catch (error) {
        console.error("Get Projects Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.inviteUser = async (req, res) => {
    try {
        const { userId, projectId } = req.body; // Accept projectId
        const leadId = req.user.id;

        // Find specific project AND verify ownership
        const project = await Project.findByPk(projectId);

        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (project.leadId !== leadId) return res.status(403).json({ message: 'Not authorized for this project' });

        if (!project.members.includes(userId)) {
            const updatedMembers = [...project.members, userId];
            await Project.update(project.id, { members: updatedMembers });

            // Notify User (Create Notification)
            await Notification.create({
                userId,
                type: 'project_invite',
                message: `You have been added to project ${project.name}`,
                read: false,
                metadata: { projectId: project.id }
            });
        }

        res.json({ message: 'User added' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Invite Error' });
    }
};

exports.getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const leadId = req.user.id;

        const project = await Project.findOne({ where: { leadId } });
        if (!project || !project.members.includes(userId)) {
            return res.status(403).json({ message: 'User not in your project' });
        }

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const tasks = await Task.findAll({
            where: { assigneeId: userId, projectId: project.id }
        });

        res.json({
            user: { id: user.id, username: user.username, email: user.email },
            tasks
        });
    } catch (error) {
        console.error("Detail Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateTaskDetails = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { priority, dueDate } = req.body;

        await Task.update(taskId, { priority, dueDate });
        res.json({ message: 'Task updated' });
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ message: 'Update Error' });
    }
};
