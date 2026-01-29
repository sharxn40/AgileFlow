const jwt = require('jsonwebtoken');
const User = require('../models/firestore/User'); // Updated to Firestore

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');

            // Firestore findByPk returns a plain object, not a Sequelize instance
            const user = await User.findByPk(decoded.id);

            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Attach user to request
            req.user = user;
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        console.log(`Auth Middleware: Checking User. User: ${req.user ? req.user.email : 'None'}, Role: ${req.user ? req.user.role : 'None'}, Required: ${roles}`); // DEBUG
        if (!req.user || !roles.includes(req.user.role)) {
            console.log('Auth Middleware: Access Denied');
            return res.status(403).json({
                message: `User role ${req.user ? req.user.role : 'unknown'} is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
