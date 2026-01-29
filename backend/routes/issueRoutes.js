const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, issueController.createIssue);
router.get('/my-issues', protect, issueController.getMyIssues); // Add specific route before generic /:id
router.put('/:id', protect, issueController.updateIssue);
router.get('/:id', protect, issueController.getIssueDetails);
router.delete('/:id', protect, issueController.deleteIssue);
router.post('/:id/comments', protect, issueController.addComment);

module.exports = router;
