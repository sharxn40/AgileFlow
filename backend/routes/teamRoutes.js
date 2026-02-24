const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All team routes require authentication

router.get('/', teamController.getMyTeams);
router.post('/', teamController.createTeam);
router.get('/:teamId', teamController.getTeamById);
router.patch('/:teamId', teamController.updateTeam);
router.post('/:teamId/invite', teamController.inviteToTeam);
router.post('/accept-invite/:token', teamController.acceptTeamInvite);
router.delete('/:teamId/members/:userId', teamController.removeMember);

module.exports = router;
