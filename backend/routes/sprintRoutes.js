const express = require('express');
const router = express.Router();
console.log("!!! SPRINT ROUTES LOADED - PERMISSIONS UPDATE ACTIVE !!!");
const sprintController = require('../controllers/sprintController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public/User: Get active sprint details
router.get('/active', protect, sprintController.getActiveSprint);

// Admin / Lead: Create new sprint
// Admin / Lead / User: Create new sprint
router.post('/', protect, authorize(['admin', 'project-lead', 'user']), sprintController.createSprint);

// Sprint Lifecycle (Lead/Admin/User)
router.post('/:id/start', protect, authorize(['admin', 'project-lead', 'user']), sprintController.startSprint);
router.post('/:id/complete', protect, authorize(['admin', 'project-lead', 'user']), sprintController.completeSprint);

// Analytics
const analyticsController = require('../controllers/analyticsController');
router.get('/:projectId/velocity', protect, analyticsController.getVelocityData);
router.get('/:projectId/activity', protect, analyticsController.getRecentActivity); // New Route
router.get('/:sprintId/burndown', protect, analyticsController.getBurndownData);

module.exports = router;
