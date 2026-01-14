import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
            const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to connect to server');
        }
    };

    return (
        <div className="auth-body">
            <div className="auth-container" style={{ minHeight: '400px', width: '450px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <form onSubmit={handleSubmit} style={{ padding: '0 30px' }}>
                    <h1>Forgot Password</h1>
                    <p>Enter your email address and we'll send you a link to reset your password.</p>

                    {message && <div className="error-badge" style={{ backgroundColor: '#e3fcef', color: '#006644', borderColor: '#006644' }}>{message}</div>}
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

                    <button type="submit" style={{ marginTop: '20px', width: '100%' }}>Send Reset Link</button>

                    <Link to="/login" style={{ marginTop: '20px', display: 'block' }}>
                        Back to Sign In
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
