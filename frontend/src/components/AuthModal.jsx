import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { FaEye, FaEyeSlash, FaTimes } from 'react-icons/fa'; // Removed FaGoogle
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import googleLogo from '../assets/google_logo.svg'; // Import Real Logo
import '../pages/Auth.css'; // Re-use auth styles

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);

    // Form States
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [registerData, setRegisterData] = useState({ username: '', email: '', password: '', confirmPassword: '', role: 'user' });
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');

    // Password Visibility States
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsSignUp(initialMode === 'register');
            setError('');
        }
    }, [isOpen, initialMode]);

    // --- Switcher Logic ---
    const toggleMode = (mode) => {
        setIsSignUp(mode);
        setError('');
    };

    // --- API Handlers ---
    const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
    const handleRegisterChange = (e) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData),
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                if (rememberMe) {
                    localStorage.setItem('rememberbox', 'true');
                }
                onClose(); // Close modal on success
                navigate('/dashboard');
            } else { setError(data.message); }
        } catch (err) { setError('Failed to connect to server'); }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        if (registerData.password !== registerData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }
        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: registerData.username,
                    email: registerData.email,
                    password: registerData.password,
                    role: registerData.role
                }),
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                onClose(); // Close modal on success
                navigate('/dashboard');
            } else { setError(data.message); }
        } catch (err) { setError('Failed to connect to server'); }
    };

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const idToken = await user.getIdToken();

            try {
                // Send ID Token to Backend
                const response = await fetch('http://localhost:3000/api/auth/google', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: idToken }),
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    onClose();
                    navigate('/dashboard');
                } else {
                    setError(data.message || 'Google Login Failed');
                }
            } catch (networkError) {
                console.error("Backend Connection Error:", networkError);
                setError('Failed to connect to authentication server. Please try again later.');
            }

        } catch (error) {
            console.error("Firebase Auth Error:", error);
            if (error.code === 'auth/popup-closed-by-user') {
                setError('Sign-in cancelled.');
            } else {
                setError('Google Sign-In failed. Please try again.');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="auth-modal-overlay" onClick={onClose}>
            <div className="auth-modal-content" onClick={e => e.stopPropagation()}>
                <button className="auth-modal-close" onClick={onClose}>
                    <FaTimes />
                </button>

                <div className={`auth-container ${isSignUp ? "right-panel-active" : ""}`} id="container">

                    {/* Sign Up Form Container */}
                    <div className="form-container sign-up-container">
                        <form onSubmit={handleRegisterSubmit}>
                            <h1 style={{ marginBottom: '10px' }}>Create Account</h1>
                            <p style={{ marginBottom: '15px' }}>Use your Google email for auto-fill</p>

                            <div className="social-container" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    className="google-btn"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        background: '#fff',
                                        color: '#757575',
                                        border: '1px solid #dadce0',
                                        borderRadius: '4px',
                                        padding: '8px 16px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        width: '300px',
                                        height: '40px',
                                        transition: 'background-color 0.2s',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                                >
                                    <img src={googleLogo} alt="Google" style={{ width: '20px', height: '20px' }} />
                                    Sign up with Google
                                </button>
                            </div>

                            {isSignUp && error && <div className="error-badge">{error}</div>}

                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="e.g. John Doe"
                                    value={registerData.username}
                                    onChange={handleRegisterChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="john@example.com"
                                    value={registerData.email}
                                    onChange={handleRegisterChange}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ position: 'relative' }}>
                                <label>Password</label>
                                <input
                                    type={showRegisterPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Choose a password"
                                    value={registerData.password}
                                    onChange={handleRegisterChange}
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
                                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                >
                                    {showRegisterPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                            <div className="form-group" style={{ position: 'relative' }}>
                                <label>Confirm Password</label>
                                <input
                                    type={showRegisterConfirm ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Confirm your password"
                                    value={registerData.confirmPassword}
                                    onChange={handleRegisterChange}
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
                                    onClick={() => setShowRegisterConfirm(!showRegisterConfirm)}
                                >
                                    {showRegisterConfirm ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>

                            <button type="submit" style={{ marginTop: '15px' }}>Sign Up</button>
                        </form>
                    </div>

                    {/* Sign In Form Container */}
                    <div className="form-container sign-in-container">
                        <form onSubmit={handleLoginSubmit}>
                            <h1>Sign in</h1>
                            <div className="social-container" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    className="google-btn"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        background: '#fff',
                                        color: '#757575',
                                        border: '1px solid #dadce0',
                                        borderRadius: '4px',
                                        padding: '8px 16px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        width: '300px',
                                        height: '40px',
                                        transition: 'background-color 0.2s',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                                >
                                    <img src={googleLogo} alt="Google" style={{ width: '20px', height: '20px' }} />
                                    Sign in with Google
                                </button>
                            </div>
                            <span>or use your account</span>

                            {!isSignUp && error && <div className="error-badge">{error}</div>}

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={loginData.email}
                                    onChange={handleLoginChange}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ position: 'relative' }}>
                                <label>Password</label>
                                <input
                                    type={showLoginPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
                                    value={loginData.password}
                                    onChange={handleLoginChange}
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
                                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                                >
                                    {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>

                            <div className="remember-forgot-row">
                                <label className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span className="checkmark"></span>
                                    Remember Me
                                </label>
                                <span
                                    onClick={() => {
                                        onClose();
                                        navigate('/forgot-password');
                                    }}
                                    style={{ cursor: 'pointer', color: '#0052CC', fontWeight: 'bold' }}
                                >
                                    Forgot your password?
                                </span>
                            </div>

                            <button type="submit">Sign In</button>
                        </form>
                    </div>

                    {/* Overlay Container (The slider) */}
                    <div className="overlay-container">
                        <div className="overlay">
                            <div className="overlay-panel overlay-left">
                                <h1>Welcome Back!</h1>
                                <p>To keep connected with us please login with your personal info</p>
                                <button className="ghost" id="signIn" onClick={() => toggleMode(false)}>Sign In</button>
                            </div>
                            <div className="overlay-panel overlay-right">
                                <h1>Hello, Friend!</h1>
                                <p>Enter your personal details and start journey with us</p>
                                <button className="ghost" id="signUp" onClick={() => toggleMode(true)}>Sign Up</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
