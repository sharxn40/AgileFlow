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
