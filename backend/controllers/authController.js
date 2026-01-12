const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'fallback_secret_key_change_me',
        { expiresIn: '24h' }
    );
};

exports.register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role: role || 'user',
        });

        const token = generateToken(user);

        res.status(201).json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        if (!user.password) {
            return res.status(400).json({ message: 'Invalid credentials (try Google Login)' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user);

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// const { OAuth2Client } = require('google-auth-library');
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'No token provided' });
        }

        // ---------------------------------------------------------
        // TODO: Verify Token with Firebase Admin SDK for Security
        // For now, we decode it to get user info.
        // ---------------------------------------------------------
        const decoded = jwt.decode(token);

        if (!decoded || !decoded.email) {
            return res.status(400).json({ message: 'Invalid token structure' });
        }

        const { email, name, user_id: googleId, picture } = decoded;

        let user = await User.findOne({ where: { email } });

        if (user) {
            // Link Google ID if missing
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        } else {
            // Create New User
            const randomPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            user = await User.create({
                username: name || email.split('@')[0],
                email,
                password: hashedPassword,
                googleId,
                role: 'user',
            });
        }

        const jwtToken = generateToken(user);

        res.json({
            token: jwtToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                picture,
            },
        });
    } catch (error) {
        console.error('Firebase Login Error:', error);
        res.status(500).json({ message: 'Google Sign-In failed', error: error.message });
    }
};

const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { Op } = require('sequelize');

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            // Security: Don't reveal if user exists
            return res.status(200).json({ message: 'If this email is registered, a reset link will be sent.' });
        }

        // Generate Token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash it and set to resetPasswordToken field
        // In a real app, you might want to hash it before saving for extra security
        // For simplicity here, we'll save it directly or you could hash it. 
        // Let's stick effectively to the plan: save token and expiry.

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
        await user.save();

        // Create Reset URL
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) have requested the reset of a password. \n\n Please click on the following link, or paste this into your browser to complete the process within 15 minutes: \n\n ${resetUrl} \n\n If you did not request this, please ignore this email and your password will remain unchanged.`;

        // LOG FOR DEV: Print link immediately so it's visible even if email fails
        console.log('-------------------------------------------------------');
        console.log(`[DEV MODE] Password Reset Link: ${resetUrl}`);
        console.log('-------------------------------------------------------');

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Token',
                message,
            });

            res.status(200).json({ message: 'Email sent successfully!' });
        } catch (err) {
            console.error('Email send failed (likely invalid credentials):', err.message);

            // DEV MODE FALLBACK: Return success so they can test the UI flow
            return res.status(200).json({
                message: 'Dev Mode: Email simulated. Check backend terminal for link.'
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { [Op.gt]: Date.now() } // Expiry > Now
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Clear token fields
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        res.status(200).json({ message: 'Password Reset Successful' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
