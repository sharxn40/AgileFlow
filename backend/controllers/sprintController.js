const Sprint = require('../models/firestore/Sprint');
const Issue = require('../models/firestore/Issue');

// GET /api/sprints/active (Legacy compat, but updated logic)
exports.getActiveSprint = async (req, res) => {
    try {
        const { projectId } = req.query;
        if (!projectId) return res.status(400).json({ message: 'Project ID required' });

        const sprint = await Sprint.findOne({
            where: {
                projectId,
                status: 'active'
            }
        });

        if (!sprint) {
            return res.json(null);
        }

        // Stats
        const issues = await Issue.findAll({ where: { sprintId: sprint.id } });
        const total = issues.length;
        const completed = issues.filter(i => i.status === 'Done').length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        res.json({
            ...sprint,
            stats: { total, completed, progress }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching active sprint', error: error.message });
    }
};

exports.createSprint = async (req, res) => {
    try {
        const { name, goal, startDate, endDate, projectId } = req.body;
        const sprint = await Sprint.create({
            name,
            goal,
            startDate,
            endDate,
            projectId,
            status: 'planned'
        });
        res.status(201).json(sprint);
    } catch (error) {
        res.status(500).json({ message: 'Error creating sprint', error: error.message });
    }
};

exports.startSprint = async (req, res) => {
    try {
        const { id } = req.params;
        const sprint = await Sprint.findByPk(id);

        if (!sprint) return res.status(404).json({ message: 'Sprint not found' });

        // Check for other active sprints in project
        const active = await Sprint.findOne({
            where: { projectId: sprint.projectId, status: 'active' }
        });

        if (active) {
            return res.status(400).json({ message: 'Another sprint is already active' });
        }

        await Sprint.update(id, { status: 'active', startDate: new Date().toISOString() });
        res.json({ message: 'Sprint started' });

    } catch (error) {
        res.status(500).json({ message: 'Error starting sprint', error: error.message });
    }
};

exports.completeSprint = async (req, res) => {
    try {
        const { id } = req.params;
        const sprint = await Sprint.findByPk(id);
        if (!sprint) return res.status(404).json({ message: 'Sprint not found' });

        // 1. Move incomplete issues to Backlog (or next sprint - implement backlog for now)
        const issues = await Issue.findAll({ where: { sprintId: id } });
        const incomplete = issues.filter(i => i.status !== 'Done');

        for (const issue of incomplete) {
            await Issue.update(issue.id, { sprintId: null }); // Move to Backlog
            // Add history log?
        }

        // 2. Mark Sprint Completed
        await Sprint.update(id, { status: 'completed', endDate: new Date().toISOString() });

        res.json({
            message: 'Sprint processed',
            movedToBacklog: incomplete.length
        });

    } catch (error) {
        res.status(500).json({ message: 'Error completing sprint', error: error.message });
    }
};
