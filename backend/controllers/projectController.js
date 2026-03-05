const Project = require('../models/firestore/Project');
const Board = require('../models/firestore/Board');
const Sprint = require('../models/firestore/Sprint');
const Issue = require('../models/firestore/Issue');

exports.createProject = async (req, res) => {
    try {
        console.log('=== CREATE PROJECT CALLED ===');
        console.log('Body:', req.body);
        const { name, key, description, leadId } = req.body;

        // Default leadId to the creator if not specified
        const finalLeadId = leadId || req.user.id;

        // Check for duplicate project name (case-insensitive)
        const allProjects = await Project.findAll();
        const nameExists = allProjects.some(p => p.name.toLowerCase() === name.trim().toLowerCase());

        if (nameExists) {
            return res.status(400).json({ message: 'Project name already exists' });
        }

        // Ensure unique key
        let finalKey = key.toUpperCase();
        let counter = 1;

        // Loop until a unique key is found
        while (await Project.findOne({ where: { key: finalKey } })) {
            finalKey = `${key.toUpperCase()}${counter}`;
            counter++;
        }

        const project = await Project.create({
            name,
            key: finalKey,
            description,
            leadId: finalLeadId,
            workflow: ['To Do', 'In Progress', 'Done'], // Default
            members: [finalLeadId] // Ensure creator is strictly added as member
        });
        console.log('Project created:', project.id);

        // Auto-create default board
        await Board.create({
            name: `${finalKey} Board`,
            projectId: project.id,
            columns: ['To Do', 'In Progress', 'Done']
        });
        console.log('Default board created');

        res.status(201).json(project);
    } catch (error) {
        console.error('CREATE PROJECT ERROR:', error);
        res.status(500).json({ message: 'Error creating project', error: error.message });
    }
};

exports.getAllProjects = async (req, res) => {
    try {
        const user = await require('../models/firestore/User').findByPk(req.user.id);
        const projects = await Project.findAll();

        if (user.role === 'admin') {
            res.json(projects);
        } else {
            // Filter: User must be in 'members' array
            const userProjects = projects.filter(p =>
                p.members && p.members.includes(req.user.id)
            );
            res.json(userProjects);
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching projects', error: error.message });
    }
};

exports.getProjectBoard = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project.findByPk(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const board = await Board.findOne({ where: { projectId } });
        // Get active sprint
        const sprints = await Sprint.findAll({
            where: { projectId, status: 'active' }
        });
        const activeSprint = sprints[0] || null;

        let issues = [];
        // REMOVED duplicate 'let issues = [];'

        // ALWAYS fetch all project issues for now to ensure visibility (Kanban style fallback)
        // This fixes the issue where tasks created in Dashboard (without sprintId) don't show up on Board if a Sprint is active.
        issues = await Issue.findAll({ where: { projectId } });

        // If we strictly wanted Scrum:
        // if (activeSprint) issues = issues.filter(i => i.sprintId === activeSprint.id);

        res.json({
            project,
            board,
            activeSprint,
            issues
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching board', error: error.message });
    }
};

exports.getProjectBacklog = async (req, res) => {
    try {
        const { projectId } = req.params;
        const sprints = await Sprint.findAll({ where: { projectId } });
        const allIssues = await Issue.findAll({ where: { projectId } });

        // Frontend will filter
        res.json({
            sprints,
            issues: allIssues
        });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching backlog', error: error.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project.findByPk(projectId);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Must be the Project Admin (Lead) or System Admin to delete
        const userId = req.user.id || req.user._id;
        if (String(project.leadId) !== String(userId) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to delete this project.' });
        }

        // 1. Delete all associated issues
        const issues = await Issue.findAll({ where: { projectId } });
        for (const issue of issues) {
            await Issue.delete(issue.id);
        }

        // 2. Delete all associated sprints
        const sprints = await Sprint.findAll({ where: { projectId } });
        for (const sprint of sprints) {
            await Sprint.delete(sprint.id);
        }

        // 3. Delete all associated boards
        const boards = await Board.findAll({ where: { projectId: project.id } }); // Note: Using direct query syntax as Boards use projectId directly
        const allBoards = await Board.findAll();
        const projectBoards = allBoards.filter(b => b.projectId === projectId);
        for (const board of projectBoards) {
            await Board.delete(board.id);
        }

        // 4. Finally, delete the project document itself
        await Project.delete(projectId);

        console.log(`[DELETE] Project ${project.name} (${projectId}) wiped by user ${req.user.id}`);
        res.status(200).json({ message: 'Project and all associated data deleted successfully.' });

    } catch (error) {
        console.error('DELETE PROJECT ERROR:', error);
        res.status(500).json({ message: 'Error deleting project', error: error.message });
    }
};
