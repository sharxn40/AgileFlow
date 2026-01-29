const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, projectController.createProject);
router.get('/', protect, projectController.getAllProjects);
router.get('/:projectId/board', protect, projectController.getProjectBoard);
router.get('/:projectId/backlog', protect, projectController.getProjectBacklog);

module.exports = router;
