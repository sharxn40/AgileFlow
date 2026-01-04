import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Auth.css';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/auth/reset-password/${token}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await response.json();

            if (response.ok) {
                setMessage("Password reset successful! Redirecting to login...");
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to connect to server');
        }
    };

    return (
        <div className="auth-body">
            <div className="auth-container" style={{ minHeight: '450px', width: '450px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <form onSubmit={handleSubmit} style={{ padding: '0 30px' }}>
                    <h1>Reset Password</h1>
                    <p>Create a new strong password.</p>

                    {message && <div className="error-badge" style={{ backgroundColor: '#e3fcef', color: '#006644', borderColor: '#006644' }}>{message}</div>}
                    {error && <div className="error-badge">{error}</div>}

                    <div className="form-group" style={{ position: 'relative' }}>
                        <label>New Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="New password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <span
                            style={{
                                position: 'absolute',
                                right: '15px',
                                top: '40px',
                                cursor: 'pointer',
                                color: '#777'
                            }}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>

                    <div className="form-group" style={{ position: 'relative' }}>
                        <label>Confirm Password</label>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <span
                            style={{
                                position: 'absolute',
                                right: '15px',
                                top: '40px',
                                cursor: 'pointer',
                                color: '#777'
                            }}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>

                    <button type="submit" style={{ marginTop: '20px', width: '100%' }}>Reset Password</button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
