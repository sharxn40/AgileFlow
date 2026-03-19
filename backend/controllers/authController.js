const User = require('../models/firestore/User');
const { admin } = require('../config/firebaseAdmin');

/**
 * Sync user profile from Firebase to our Firestore metadata
 * Called by frontend AFTER successful Firebase Auth
 */
exports.syncUser = async (req, res) => {
    const { token } = req.body;

    try {
        // Verify token again just to be safe
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { email, name, uid, picture } = decodedToken;

        // Check if user exists in Firestore
        let user = await User.findByEmail(email);

        if (!user) {
            // Auto-create user metadata if not exists
            const newUser = await User.create({
                username: name || email.split('@')[0],
                email: email,
                role: 'user', // Default role
                firebaseUid: uid,
                profilePicture: picture || ''
            });
            user = newUser;
            console.log(`Synced new user: ${email}`);
        } else {
            // Update existing user if needed (e.g. sync profile picture)
            if (picture && user.profilePicture !== picture) {
                await User.collection.doc(user.id).update({ profilePicture: picture });
                user.profilePicture = picture;
            }
        }

        res.status(200).json({
            message: 'User synced successfully',
            user: {
                id: user.id,
                _id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                picture: user.profilePicture
            }
        });
    } catch (error) {
        console.error("Firebase Sync Error:", error.message);
        res.status(500).json({ message: 'Failed to sync user', error: error.message });
    }
};

// Legacy stubs for compatibility if other routes refer to them
exports.register = (req, res) => res.status(410).json({ message: 'Endpoint deprecated. Use Firebase SDK.' });
exports.login = (req, res) => res.status(410).json({ message: 'Endpoint deprecated. Use Firebase SDK.' });
exports.googleLogin = (req, res) => res.status(410).json({ message: 'Endpoint deprecated. Use Firebase SDK.' });
exports.forgotPassword = (req, res) => res.status(410).json({ message: 'Use Firebase Auth SDK directly.' });
exports.resetPassword = (req, res) => res.status(410).json({ message: 'Use Firebase Auth SDK directly.' });
