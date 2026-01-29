const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/invite', protect, invitationController.inviteUser);
router.post('/accept', protect, invitationController.acceptInvitation);

module.exports = router;
