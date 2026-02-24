import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const AuthPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();
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
        if (location.pathname === '/register') {
            setIsSignUp(true);
        } else {
            setIsSignUp(false);
        }
    }, [location.pathname]);

    // --- Switcher Logic ---
    const toggleMode = (mode) => {
        setIsSignUp(mode);
        setError('');
        window.history.pushState(null, '', mode ? '/register' : '/login');
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
                login(data.user, data.token);
                if (rememberMe) localStorage.setItem('rememberbox', 'true');
                if (data.user.role === 'admin') navigate('/admin');
                else navigate('/dashboard');
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
                login(data.user, data.token);
                navigate('/dashboard');
            } else { setError(data.message); }
        } catch (err) { setError('Failed to connect to server'); }
    };

    // Real Google OAuth — always shows account picker
    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const userInfo = await userInfoRes.json();

                const response = await fetch('http://localhost:3000/api/auth/google', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: tokenResponse.access_token, userInfo }),
                });
                const data = await response.json();

                if (response.ok) {
                    login(data.user, data.token);
                    if (data.user.role === 'admin') navigate('/admin');
                    else navigate('/dashboard');
                } else {
                    setError(data.message || 'Google Login Failed');
                }
            } catch (err) {
                console.error("AuthPage Connection Error:", err);
                setError(`Failed to connect to backend at http://localhost:3000. Error: ${err.message}`);
            }
        },
        onError: () => setError('Google Login Failed. Please try again.'),
        prompt: 'select_account',
        flow: 'implicit',
    });

    return (
        <div className="auth-body">
            <div className={`auth-container ${isSignUp ? "right-panel-active" : ""}`} id="container">

                {/* Sign Up Form Container */}
                <div className="form-container sign-up-container">
                    <form onSubmit={handleRegisterSubmit}>
                        <h1 style={{ marginBottom: '10px' }}>Create Account</h1>
                        <p style={{ marginBottom: '15px' }}>Use your Google email for auto-fill</p>

                        <div className="social-container" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                            <button
                                type="button"
                                onClick={() => handleGoogleLogin()}
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
                                <FaGoogle style={{ color: '#4285F4' }} />
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
                                onClick={() => handleGoogleLogin()}
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
                                <FaGoogle style={{ color: '#4285F4' }} />
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
                                onClick={() => navigate('/forgot-password')}
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
    );
};

export default AuthPage;
