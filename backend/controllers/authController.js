const User = require('../models/firestore/User');
// const Project = require('../models/Project'); // Legacy
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_key', {
        expiresIn: '30d',
    });
};

exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await User.create({
            username,
            email,
            password: hashedPassword,
        });
        res.status(201).json({
            user: {
                _id: user.id,
                username: user.username,
                email: user.email,
            },
            token: generateToken(user.id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                user: {
                    _id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role, // Include role in response
                },
                token: generateToken(user.id),
            });
            console.log(`User ${email} logged in with role: ${user.role}`); // DEBUG
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const { admin } = require('../config/firebaseAdmin');

exports.googleLogin = async (req, res) => {
    const { token } = req.body; // Frontend sends 'token' (ID Token)

    try {
        // 1. VERIFY the token using Admin SDK (Robust & Secure)
        const decodedToken = await admin.auth().verifyIdToken(token);

        // 2. Extract verified data
        const email = decodedToken.email;
        const name = decodedToken.name || email.split('@')[0];
        const googleId = decodedToken.uid;
        const photoURL = decodedToken.picture;

        // 3. Login or Create User (Firestore)
        // Note: Our Firestore User model 'findOne' expects { where: { email: ... } }
        let user = await User.findOne({ where: { email } });

        if (!user) {
            // Create new user
            user = await User.create({
                username: name,
                email,
                password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
                googleId,
                profilePicture: photoURL
            });
        } else {
            // Update profile
            // Note: Firestore User is a plain object in our DAO + save method, but let's be safe
            if (photoURL && user.profilePicture !== photoURL) {
                // Ensure we have an ID to update
                if (user.id) {
                    await User.collection.doc(user.id).update({ profilePicture: photoURL });
                    user.profilePicture = photoURL;
                }
            }
        }

        // 4. Respond with Token
        res.json({
            user: {
                _id: user.id,
                username: user.username,
                email: user.email,
                picture: user.profilePicture,
                role: user.role
            },
            token: generateToken(user.id)
        });

    } catch (error) {
        console.error("Google Auth Verification Error:", error);
        res.status(401).json({ message: 'Google Auth Failed', details: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    res.status(200).json({ message: 'Password reset link sent (Mock)' });
};

exports.resetPassword = async (req, res) => {
    res.status(200).json({ message: 'Password reset successful (Mock)' });
};
