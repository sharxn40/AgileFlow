const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer Config for File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads/'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Get invite details (Public)
router.get('/invite/:token', teamController.getInviteDetails);

router.use(protect); // All team routes require authentication

router.get('/', teamController.getMyTeams);
router.post('/', teamController.createTeam);
router.get('/:teamId', teamController.getTeamById);
router.patch('/:teamId', teamController.updateTeam);
router.post('/:teamId/invite', teamController.inviteToTeam);
router.post('/accept-invite/:token', teamController.acceptTeamInvite);
router.delete('/:teamId/members/:userId', teamController.removeMember);
router.delete('/:teamId', teamController.deleteTeam);
router.get('/:teamId/messages', teamController.getTeamMessages);
router.post('/:teamId/messages', teamController.sendMessage);

// Schedule a meeting
router.post('/:teamId/schedule-meeting', teamController.scheduleMeeting);

// Upload endpoint that returns the static URL
router.post('/:teamId/messages/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const fileUrl = `/public/uploads/${req.file.filename}`;
        res.status(200).json({ url: fileUrl, originalName: req.file.originalname, mimetype: req.file.mimetype });
    } catch (e) {
        res.status(500).json({ message: 'Error uploading file', error: e.message });
    }
});

module.exports = router;
