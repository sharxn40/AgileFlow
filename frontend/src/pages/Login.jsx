import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { FaSun, FaMoon, FaArrowLeft } from 'react-icons/fa';
import './Landing.css'; // Reuse premium styles

const Login = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [registerData, setRegisterData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [theme, setTheme] = useState('dark');
    const navigate = useNavigate();
    const location = useLocation();

    // Auto-switch based on URL
    useState(() => {
        if (location.pathname === '/register') {
            setIsSignUp(true);
        } else {
            setIsSignUp(false);
        }
    }, [location.pathname]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleRegisterChange = (e) => {
        setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    };

    const toggleMode = (mode) => {
        setIsSignUp(mode);
        setError('');
        window.history.pushState(null, '', mode ? '/register' : '/login');
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
                navigate('/dashboard');
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
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => setError('Google Failed')}
                                    useOneTap={false}
                                    theme={theme === 'dark' ? 'filled_black' : 'outline'}
                                    width="280"
                                    text="signup_with"
                                />
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
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => setError('Google Login Failed')}
                                    useOneTap
                                    theme={theme === 'dark' ? 'filled_black' : 'outline'}
                                    width="280"
                                />
                            </div>

                            <span className="auth-subtitle">or use your account</span>

                            {!isSignUp && error && <div className="error-badge">{error}</div>}

                            <input type="email" name="email" placeholder="Email" className="auth-input" value={loginData.email} onChange={handleLoginChange} required />
                            <input type="password" name="password" placeholder="Password" className="auth-input" value={loginData.password} onChange={handleLoginChange} required />

                            <Link to="/forgot-password" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '5px' }}>Forgot your password?</Link>

                            <button type="submit" className="btn-primary-lg" style={{ width: '100%', marginTop: '15px' }}>Sign In</button>
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
