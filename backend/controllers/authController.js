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
    const { token, userInfo } = req.body;

    try {
        let email, name, googleId, photoURL;

        if (userInfo && userInfo.email) {
            // New flow: frontend sends pre-verified userInfo from Google's /userinfo endpoint
            email = userInfo.email;
            name = userInfo.name || email.split('@')[0];
            googleId = userInfo.sub;
            photoURL = userInfo.picture;
            console.log("DEBUG: Using userInfo payload for", email);
        } else {
            // Legacy flow: try to verify as Firebase ID token
            const decodedToken = await admin.auth().verifyIdToken(token);
            email = decodedToken.email;
            name = decodedToken.name || email.split('@')[0];
            googleId = decodedToken.uid;
            photoURL = decodedToken.picture;
            console.log("DEBUG: verifyIdToken succeeded for", email);
        }

        // Login or Create User (Firestore)
        console.log("DEBUG: Querying User.findOne for", email);
        let user = await User.findOne({ where: { email } });

        if (!user) {
            user = await User.create({
                username: name,
                email,
                password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
                googleId,
                profilePicture: photoURL
            });
        } else {
            if (photoURL && user.profilePicture !== photoURL && user.id) {
                await User.collection.doc(user.id).update({ profilePicture: photoURL });
                user.profilePicture = photoURL;
            }
        }

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
        try {
            const fs = require('fs');
            fs.writeFileSync('auth_error.log', `Error: ${error.message}\nStack: ${error.stack}\nToken: ${token ? token.substring(0, 20) + '...' : 'None'}`);
        } catch (filesErr) { console.error('Failed to write log', filesErr); }

        res.status(401).json({ message: 'Google Auth Failed', details: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    res.status(200).json({ message: 'Password reset link sent (Mock)' });
};

exports.resetPassword = async (req, res) => {
    res.status(200).json({ message: 'Password reset successful (Mock)' });
};
