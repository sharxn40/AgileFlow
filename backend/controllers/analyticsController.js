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

            // Fallback: If total sprint points are 0 (user didn't estimate), treat each task as 1 point (Task Count Burndown)
            const allPointsZero = sprintIssues.every(i => !i.storyPoints || i.storyPoints == 0);

            sprintIssues.forEach(issue => {
                // Check issue status at end of this specific day
                const created = new Date(issue.createdAt);
                if (created > endOfDay) return;

                let statusAtEOD = 'To Do';
                if (issue.history && Array.isArray(issue.history)) {
                    issue.history.forEach(event => {
                        const eventTime = new Date(event.timestamp);
                        if (eventTime <= endOfDay) {
                            if (event.action === 'status_change') {
                                statusAtEOD = event.to;
                            }
                        }
                    });
                } else {
                    statusAtEOD = issue.status;
                }

                // DEBUG LOG
                if (date.toDateString() === new Date().toDateString()) {
                    console.log(`[Burndown] Today - Issue ${issue.issueId} (${issue.id}) Status: ${statusAtEOD} (Real Status: ${issue.status})`);
                }

                if (statusAtEOD !== 'Done') {
                    const points = parseInt(issue.storyPoints) || 0;
                    dailyRemainingPoints += (allPointsZero ? 1 : points);
                }
            });

            // Ideal Line Calculation
            let totalSprintPoints = sumPoints(sprintIssues);
            if (totalSprintPoints === 0 && allPointsZero) totalSprintPoints = sprintIssues.length;

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

exports.getUserWorkload = async (req, res) => {
    try {
        const { projectId } = req.params;
        if (!projectId) return res.status(400).json({ message: 'Project ID required' });

        // 1. Fetch Issues
        const allIssues = await Issue.findAll();
        const projectIssues = allIssues.filter(i => i.projectId === projectId);

        // 2. Fetch Users to map IDs
        const assigneeIds = [...new Set(projectIssues.map(i => i.assigneeId).filter(id => id))];
        const users = await Promise.all(assigneeIds.map(uid => User.findByPk(uid)));
        const userMap = {};
        users.forEach(u => {
            if (u) userMap[u.id] = u.username || u.email;
        });

        // 3. Aggregate Data
        // Structure: { "UserId": { user: "Name", "To Do": 0, "In Progress": 0, "Done": 0 } }
        const workloadMap = {};

        // Initialize for known users
        assigneeIds.forEach(uid => {
            if (userMap[uid]) {
                workloadMap[uid] = {
                    name: userMap[uid],
                    "To Do": 0,
                    "In Progress": 0,
                    "Done": 0
                };
            }
        });

        // Add "Unassigned" bucket if needed, but let's stick to assigned for now or handle unassigned

        projectIssues.forEach(issue => {
            if (issue.assigneeId && workloadMap[issue.assigneeId]) {
                // Normalize status to 3 categories if needed, or use raw status
                // For simplicity, let's use exact status if standard, else map?
                // The prompt asked for "To Do, In Progress, Done".
                const status = issue.status || 'To Do';
                if (workloadMap[issue.assigneeId][status] !== undefined) {
                    workloadMap[issue.assigneeId][status]++;
                } else {
                    // Fallback for other statuses
                    if (!workloadMap[issue.assigneeId]['Other']) workloadMap[issue.assigneeId]['Other'] = 0;
                    workloadMap[issue.assigneeId]['Other']++;
                }
            }
        });

        const workloadData = Object.values(workloadMap);
        res.json(workloadData);

    } catch (error) {
        console.error('Workload Error:', error);
        res.status(500).json({ message: 'Error fetching workload data' });
    }
};
