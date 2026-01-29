import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth'; // Import Firebase function
import { auth } from '../firebase'; // Import auth instance
import './Auth.css'; // Re-use main Auth styling

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('Password reset email sent! Check your inbox.');
        } catch (err) {
            console.error("Firebase Reset Error:", err);
            if (err.code === 'auth/user-not-found') {
                // For security, it's often better to say "If an account exists..." 
                // but Firebase throws specific errors. We can genericize if we want.
                // Keeping it simple for the user request:
                setError('User not found with this email.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Invalid email address.');
            } else {
                setError('Failed to send reset email. Please try again.');
            }
        }
    };

    return (
        <div className="auth-body" style={{ background: 'var(--bg-deep)', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {/* 
                We use the ID 'premium-auth-modal' to inherit the Glassmorphism card styles from Auth.css.
                We override width/height properties since this is a single card, not a split slider.
            */}
            <div id="premium-auth-modal" style={{ width: '450px', minHeight: '500px', padding: '20px 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <h1>Forgot Password</h1>
                    <p>Enter your email address and we'll send you a link to reset your password.</p>

                    {message && <div className="error-badge" style={{ backgroundColor: 'rgba(46, 204, 113, 0.2)', color: '#2ecc71', borderColor: '#2ecc71' }}>{message}</div>}
                    {error && <div className="error-badge">{error}</div>}

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" style={{ width: '100%', marginTop: '20px' }}>Send Reset Link</button>

                    <Link to="/login" style={{ marginTop: '20px', display: 'block', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                        &larr; Back to Sign In
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
