const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, projectController.createProject);
router.get('/', protect, projectController.getAllProjects);
router.get('/:projectId/board', protect, projectController.getProjectBoard);
router.get('/:projectId/backlog', protect, projectController.getProjectBacklog);

const analyticsController = require('../controllers/analyticsController');
router.get('/:projectId/activity', protect, analyticsController.getRecentActivity);
router.get('/:projectId/workload', protect, analyticsController.getUserWorkload);

module.exports = router;
