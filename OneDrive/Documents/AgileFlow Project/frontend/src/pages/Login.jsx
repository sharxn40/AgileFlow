import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ParticleBackground from '../components/ParticleBackground';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const response = await fetch('http://localhost:3000/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: credentialResponse.credential }),
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/dashboard');
            } else {
                setError(data.message || 'Google Login Failed');
            }
        } catch (err) {
            setError('Failed to connect to server during Google Auth');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/dashboard');
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to connect to server');
        }
    };

    return (
        <div className="jira-layout">
            <ParticleBackground />
            {/* Hero Header mimicking the screenshot */}
            <div className="hero-header">
                <h1>Connect every team, task, and project together with AgileFlow</h1>
                <p>Get started with the number one software development tool used by agile teams.</p>
            </div>

            <div className="auth-card">
                {error && <div className="error-badge">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary">
                        Log In
                    </button>
                </form>

                <div className="divider">
                    <span>Or continue with</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => {
                            setError('Google Login Failed');
                        }}
                        useOneTap
                        theme="outline"
                        width="340"
                    />
                </div>

                <div className="auth-footer">
                    <Link to="/register">Sign up for an account</Link>
                </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '20px', opacity: 0.6 }}>
                {/* Mock Logos for footer vibe */}
                <span style={{ fontWeight: 'bold', color: '#091E42' }}>AgileFlow</span>
                <span style={{ color: '#42526E' }}>Privacy</span>
                <span style={{ color: '#42526E' }}>Terms</span>
            </div>
        </div>
    );
};

export default Login;
