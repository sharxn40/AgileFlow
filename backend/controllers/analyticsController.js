const Issue = require('../models/firestore/Issue');
const Sprint = require('../models/firestore/Sprint');
const User = require('../models/firestore/User'); // Import User
const { db } = require('../config/firebaseAdmin');

// Helper to sum points
const sumPoints = (issues) => issues.reduce((acc, issue) => acc + (parseInt(issue.storyPoints) || 0), 0);

exports.getRecentActivity = async (req, res) => {
    try {
        const { projectId } = req.params;
        if (!projectId) return res.status(400).json({ message: 'Project ID required' });

        // 1. Fetch all issues regarding this project
        // Note: Ideally we'd have a separate 'Activity' collection for global queries,
        // but deriving from issues works for now.
        const allIssues = await Issue.findAll();
        const projectIssues = allIssues.filter(i => i.projectId === projectId);

        let activities = [];

        // 2. Extract History
        projectIssues.forEach(issue => {
            if (issue.history && Array.isArray(issue.history)) {
                issue.history.forEach(event => {
                    activities.push({
                        ...event,
                        issueTitle: issue.title,
                        issueId: issue.issueId || issue.id,
                        realTimestamp: new Date(event.timestamp)
                    });
                });
            }
        });

        // 3. Sort Descending
        activities.sort((a, b) => b.realTimestamp - a.realTimestamp);

        // 4. Limit
        const recent = activities.slice(0, 20);

        // 5. Enrich with User Names
        // Collect User IDs
        const userIds = [...new Set(recent.map(a => a.user))];
        const users = await Promise.all(userIds.map(uid => User.findByPk(uid)));
        const userMap = {};
        users.forEach(u => {
            if (u) userMap[u.id] = u.username || u.email;
        });

        // 6. Format for Frontend
        const formatted = recent.map(a => {
            let actionText = a.action.replace('_', ' ');
            if (a.action === 'status_change') actionText = `moved to ${a.to}`;

            // Calc time ago (simple)
            const diff = Math.floor((new Date() - a.realTimestamp) / 60000); // minutes
            let timeAgo = `${diff} mins ago`;
            if (diff > 60) timeAgo = `${Math.floor(diff / 60)} hours ago`;
            if (diff > 1440) timeAgo = `${Math.floor(diff / 1440)} days ago`;

            return {
                user: userMap[a.user] || 'Unknown',
                action: actionText,
                item: a.issueTitle,
                time: timeAgo
            };
        });

        res.json(formatted);

    } catch (error) {
        console.error('Activity Error:', error);
        res.status(500).json({ message: 'Error fetching activity' });
    }
};

exports.getVelocityData = async (req, res) => {
    try {
        const { projectId } = req.params;
        if (!projectId) return res.status(400).json({ message: 'Project ID required' });

        // 1. Get last 5 completed sprints for the project
        const sprints = await Sprint.findAll({
            where: { projectId, status: 'completed' },
            order: [['endDate', 'desc']],
            limit: 5 // Last 5 sprints
        });

        // Reverse to show chronological order (oldest to newest)
        const recentSprints = sprints.reverse();

        const velocityData = [];

        for (const sprint of recentSprints) {
            // 2. Fetch all issues for this sprint
            // Note: In Firestore/NoSQL this is inefficient without a specific index/query, 
            // but we fetch all and filter for now as we don't want to change indexes if possible.
            // Using existing Issue.findAll and filtering.
            const allIssues = await Issue.findAll();
            const sprintIssues = allIssues.filter(i => i.sprintId === sprint.id);

            // 3. Calculate Commitment (all issues assigned to sprint originally)
            // Ideally we'd know what was in the sprint at start, but for now we take all issues currently tagged with this sprint ID.
            const totalPoints = sumPoints(sprintIssues);

            // 4. Calculate Completed (status = 'Done')
            const completedIssues = sprintIssues.filter(i => i.status === 'Done');
            const completedPoints = sumPoints(completedIssues);

            velocityData.push({
                sprint: sprint.name,
                commitment: totalPoints,
                completed: completedPoints
            });
        }

        res.json(velocityData);

    } catch (error) {
        console.error('Velocity Error:', error);
        res.status(500).json({ message: 'Error fetching velocity data' });
    }
};

exports.getBurndownData = async (req, res) => {
    try {
        const { sprintId } = req.params;
        if (!sprintId) return res.status(400).json({ message: 'Sprint ID required' });

        const sprint = await Sprint.findByPk(sprintId);
        if (!sprint) return res.status(404).json({ message: 'Sprint not found' });

        // 1. Get all issues in this sprint
        const allIssues = await Issue.findAll();
        const sprintIssues = allIssues.filter(i => i.sprintId === sprintId);

        // 2. Determine Timeline
        const startDate = new Date(sprint.startDate);
        const endDate = sprint.endDate ? new Date(sprint.endDate) : new Date();
        // If sprint is active, end graph at "today" or sprint end, whichever is sooner/later?
        // Usually burndown shows whole duration.

        // Generate array of dates
        const dates = [];
        let currentDate = new Date(startDate);
        const lastDate = new Date(sprint.endDate || new Date()); // Default to today if no end date

        // Safeguard: Limit to 30 days to prevent infinite loops if bad data
        let loops = 0;
        while (currentDate <= lastDate && loops < 30) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
            loops++;
        }

        // 3. Reconstruct History
        // We need to know for each Day, what were the remaining points?
        // Remaining = Total Points of Issues NOT Done on that day.

        const burndownData = dates.map(date => {
            const dateStr = date.toISOString().split('T')[0];
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            let dailyRemainingPoints = 0;

            sprintIssues.forEach(issue => {
                // Check issue status at end of this specific day
                // We look at 'history'
                // If issue was created AFTER this day, it contributes 0 (or strictly speaking it shouldn't exist yet)
                const created = new Date(issue.createdAt);
                if (created > endOfDay) return;

                // Find the status of the issue at `endOfDay`
                // Iterate history events in chronological order
                let statusAtEOD = 'To Do'; // Default initial

                if (issue.history && Array.isArray(issue.history)) {
                    issue.history.forEach(event => {
                        const eventTime = new Date(event.timestamp);
                        if (eventTime <= endOfDay) {
                            if (event.action === 'status_change') {
                                statusAtEOD = event.to;
                            }
                            // If we tracked creation status, we'd use that, but usually starts To Do
                        }
                    });
                } else {
                    // Fallback if no history: use current status if the day is Today or later?
                    // This is imperfect. If no history, we assume it's 'To Do' unless it's currently Done?
                    // Let's assume 'To Do' if we can't prove it was Done then. 
                    // Or if current status is Done, we check updated_at?
                    // Better fallback: if current status is Done, assume it was done at updatedAt.
                    // This is getting complex.
                    // Simplified: If no history, just use current status (flat line).
                    statusAtEOD = issue.status;
                }

                if (statusAtEOD !== 'Done') {
                    dailyRemainingPoints += (parseInt(issue.storyPoints) || 0);
                }
            });

            // Ideal Line: Linear decay from Total at Start to 0 at End
            const totalSprintPoints = sumPoints(sprintIssues);
            const totalDuration = (new Date(sprint.endDate) - startDate);
            const elapsed = (date - startDate);
            let ideal = totalSprintPoints;
            if (totalDuration > 0) {
                ideal = totalSprintPoints - (totalSprintPoints * (elapsed / totalDuration));
            }

            return {
                day: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
                remaining: dailyRemainingPoints,
                ideal: Math.max(0, Math.round(ideal))
            };
        });

        res.json(burndownData);

    } catch (error) {
        console.error('Burndown Error:', error);
        res.status(500).json({ message: 'Error fetching burndown data' });
    }
};
