import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { FaSun, FaMoon, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Landing.css'; // Reuse premium styles

const Login = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [registerData, setRegisterData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [theme, setTheme] = useState('dark');
    const navigate = useNavigate();
    const location = useLocation();

    const { login } = useAuth(); // Use Auth Context

    // Force account picker on every Google sign-in
    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                // Exchange the OAuth2 access token for user info
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const userInfo = await userInfoRes.json();

                // Send the access token to our backend
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
                console.error("Login Page Connection Error:", err);
                setError(`Failed to connect to backend at http://localhost:3000. Error: ${err.message}`);
            }
        },
        onError: () => setError('Google Login Failed. Please try again.'),
        prompt: 'select_account',
        flow: 'implicit',
    });

    // Auto-switch based on URL
    useState(() => {
        if (location.pathname === '/register') setIsSignUp(true);
        else setIsSignUp(false);
    }, [location.pathname]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
    const handleRegisterChange = (e) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    const toggleMode = (mode) => {
        setIsSignUp(mode);
        setError('');
        window.history.pushState(null, '', mode ? '/register' : '/login');
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData),
            });
            const data = await response.json();

            console.log('Login Response Data:', data);
            if (response.ok) {
                login(data.user, data.token);
                if (data.user.role === 'admin') navigate('/admin');
                else navigate('/dashboard');
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to connect to server');
        }
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
                    password: registerData.password
                }),
            });
            const data = await response.json();

            if (response.ok) {
                login(data.user, data.token);
                if (data.user.role === 'admin') navigate('/admin');
                else navigate('/dashboard');
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to connect to server');
        }
    };

    return (
        <div className="landing-page" data-theme={theme}>
            {/* Background Floating Shapes */}
            <div className="floating-shape shape-1"></div>
            <div className="floating-shape shape-2"></div>
            <div className="floating-shape shape-3"></div>
            <div className="floating-shape shape-4"></div>
            <div className="floating-shape shape-5"></div>
            <div className="floating-shape shape-6"></div>

            {/* Navbar */}
            <nav className="landing-nav" style={{ position: 'absolute', top: 0, width: '100%', background: 'transparent', border: 'none', padding: '20px 40px' }}>
                <div className="landing-nav-content" style={{ maxWidth: '100%' }}>
                    <Link to="/" className="nav-logo" style={{ textDecoration: 'none' }}>
                        <FaArrowLeft style={{ marginRight: '8px', fontSize: '0.9rem' }} /> Back
                    </Link>
                    <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme">
                        {theme === 'dark' ? <FaSun className="theme-icon" /> : <FaMoon className="theme-icon" />}
                    </button>
                </div>
            </nav>

            <div className="auth-wrapper">
                <div className={`auth-container ${isSignUp ? "right-panel-active" : ""}`}>

                    {/* Sign Up Container */}
                    <div className="form-container sign-up-container">
                        <form onSubmit={handleRegisterSubmit} className="auth-form">
                            <h1 className="auth-title">Create Account</h1>

                            <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                                <button
                                    type="button"
                                    onClick={() => handleGoogleLogin()}
                                    style={{
                                        width: '280px', padding: '10px 16px', border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'inherit',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        gap: '10px', fontSize: '0.9rem', fontWeight: '500', transition: 'all 0.2s'
                                    }}
                                >
                                    <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                    </svg>
                                    Sign up with Google
                                </button>
                            </div>

                            <span className="auth-subtitle">or use your email for registration</span>

                            {isSignUp && error && <div className="error-badge">{error}</div>}

                            <input type="text" name="username" placeholder="Full Name" className="auth-input" value={registerData.username} onChange={handleRegisterChange} required />
                            <input type="email" name="email" placeholder="Email" className="auth-input" value={registerData.email} onChange={handleRegisterChange} required />
                            <input type="password" name="password" placeholder="Password" className="auth-input" value={registerData.password} onChange={handleRegisterChange} required />
                            <input type="password" name="confirmPassword" placeholder="Confirm Password" className="auth-input" value={registerData.confirmPassword} onChange={handleRegisterChange} required />

                            <button type="submit" className="btn-primary-lg" style={{ width: '100%', marginTop: '10px' }}>Sign Up</button>
                        </form>
                    </div>

                    {/* Sign In Container */}
                    <div className="form-container sign-in-container">
                        <form onSubmit={handleLoginSubmit} className="auth-form">
                            <h1 className="auth-title">Sign in</h1>

                            <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                                <button
                                    type="button"
                                    onClick={() => handleGoogleLogin()}
                                    style={{
                                        width: '280px', padding: '10px 16px', border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'inherit',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        gap: '10px', fontSize: '0.9rem', fontWeight: '500', transition: 'all 0.2s'
                                    }}
                                >
                                    <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                    </svg>
                                    Sign in with Google
                                </button>
                            </div>

                            <span className="auth-subtitle">or use your account</span>

                            {!isSignUp && error && <div className="error-badge">{error}</div>}

                            <input type="email" name="email" placeholder="Email" className="auth-input" value={loginData.email} onChange={handleLoginChange} required />
                            <input type="password" name="password" placeholder="Password" className="auth-input" value={loginData.password} onChange={handleLoginChange} required />

                            <Link to="/forgot-password" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '5px' }}>Forgot your password?</Link>

                            <button type="submit" className="btn-primary-lg" style={{ width: '100%', marginTop: '15px' }}>Sign In</button>

                            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>Demo Access:</p>
                                <button
                                    type="button"
                                    className="btn-secondary small"
                                    onClick={() => {
                                        setLoginData({ email: 'lead@demo.com', password: 'password123' });
                                    }}
                                    style={{ width: '100%', marginBottom: '10px' }}
                                >
                                    Fill as Project Lead
                                </button>
                                <button
                                    type="button"
                                    className="btn-secondary small"
                                    onClick={() => {
                                        setLoginData({ email: 'admin@agileflow.com', password: 'admin123' });
                                    }}
                                    style={{ width: '100%' }}
                                >
                                    Fill as Admin
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Sliding Overlay */}
                    <div className="overlay-container">
                        <div className="overlay">
                            <div className="overlay-panel overlay-left">
                                <h1 className="auth-title" style={{ color: '#fff' }}>Welcome Back!</h1>
                                <p style={{ color: '#eee', marginBottom: '20px' }}>To keep connected with us please login with your personal info</p>
                                <button className="btn-ghost" onClick={() => toggleMode(false)}>Login</button>
                            </div>
                            <div className="overlay-panel overlay-right">
                                <h1 className="auth-title" style={{ color: '#fff' }}>Hello, Friend!</h1>
                                <p style={{ color: '#eee', marginBottom: '20px' }}>Enter your personal details and start journey with us</p>
                                <button className="btn-ghost" onClick={() => toggleMode(true)}>Sign Up</button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;
