import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ParticleBackground from '../components/ParticleBackground';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'user' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
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
            {/* Hero Header */}
            <div className="hero-header">
                <h1>Move fast, stay aligned, and build better - together</h1>
                <p>Join millions of users planning their projects with AgileFlow.</p>
            </div>

            <div className="auth-card">
                {error && <div className="error-badge">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="username"
                            placeholder="e.g. Jane Doe"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="name@work-email.com"
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
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Role</label>
                        <div className="role-selector">
                            <div
                                className={`role-card ${formData.role === 'user' ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, role: 'user' })}
                            >
                                Developer
                            </div>
                            <div
                                className={`role-card ${formData.role === 'admin' ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, role: 'admin' })}
                            >
                                Manager
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary">
                        Sign up - it's free
                    </button>
                </form>

                <div className="auth-footer">
                    <Link to="/login">Already have an account? Log In</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
