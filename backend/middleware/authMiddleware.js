const { admin } = require('../config/firebaseAdmin');
const User = require('../models/firestore/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            // Verify Firebase ID Token
            const decodedToken = await admin.auth().verifyIdToken(token);
            
            // Firebase token has 'uid' which matches our 'id' in Firestore (if synced correctly)
            // or we use email to find the user in our Firestore metadata collection.
            let user = await User.findByEmail(decodedToken.email);

            if (!user) {
                // If user doesn't exist in Firestore yet (but is in Firebase Auth),
                // we might want to fail or auto-create. For now, fail with specific message.
                return res.status(401).json({ message: 'User metadata not initialized' });
            }

            // Attach user to request
            req.user = user;
            next();
        } catch (error) {
            console.error("Auth Middleware Error:", error.message);
            res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user ? req.user.role : 'unknown'} is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
