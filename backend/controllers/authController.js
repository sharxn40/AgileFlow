const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// const sendEmail = require('../utils/sendEmail'); // Commented out until utils are restored

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
                    username: user.username, // username is correct here
                    email: user.email,
                },
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.googleLogin = async (req, res) => {
    // Basic Google Login Mock/Placeholder or Implementation
    // In a real app, verify the token from frontend
    const { email, name, googleId } = req.body;
    try {
        let user = await User.findOne({ where: { email } });
        if (!user) {
            // Create new user if not exists
            user = await User.create({
                username: name, // Google provides 'name', map to 'username'
                email,
                password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10), // Random password
                googleId
            });
        }
        res.json({
            user: {
                _id: user.id,
                username: user.username,
                email: user.email,
            },
            token: generateToken(user.id)
        });
    } catch (error) {
        res.status(500).json({ message: 'Google Auth Failed', error: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    res.status(200).json({ message: 'Password reset link sent (Mock)' });
};

exports.resetPassword = async (req, res) => {
    res.status(200).json({ message: 'Password reset successful (Mock)' });
};
