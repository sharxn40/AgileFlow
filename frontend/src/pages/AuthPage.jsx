import API_BASE_URL from '../config.js';
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { auth, googleProvider } from '../firebase';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signInWithPopup, 
    updateProfile 
} from 'firebase/auth';
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

    // --- Sync User metadata with Backend ---
    const syncWithBackend = async (firebaseUser, idToken) => {
        const syncRes = await fetch(`${API_BASE_URL}/api/auth/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: idToken }),
        });
        const syncData = await syncRes.json();
        if (syncRes.ok) {
            login(syncData.user, idToken);
            if (rememberMe) localStorage.setItem('rememberbox', 'true');
            if (syncData.user.role === 'admin') navigate('/admin');
            else navigate('/dashboard');
        } else {
            setError(syncData.message || 'Failed to sync user data');
        }
    };

    // --- API Handlers ---
    const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
    const handleRegisterChange = (e) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // 1. Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
            const idToken = await userCredential.user.getIdToken();
            
            // 2. Sync with Backend
            await syncWithBackend(userCredential.user, idToken);
        } catch (err) {
            console.error("Login Error:", err);
            setError(err.message.includes('auth/invalid-credential') ? 'Invalid email or password' : err.message);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (registerData.password !== registerData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }
        try {
            // 1. Firebase Auth Register
            const userCredential = await createUserWithEmailAndPassword(auth, registerData.email, registerData.password);
            await updateProfile(userCredential.user, { displayName: registerData.username });
            const idToken = await userCredential.user.getIdToken();
            
            // 2. Sync with Backend
            await syncWithBackend(userCredential.user, idToken);
        } catch (err) {
            console.error("Register Error:", err);
            setError(err.message);
        }
    };

    // Real Google OAuth via Firebase
    const handleGoogleLogin = async () => {
        setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();
            await syncWithBackend(result.user, idToken);
        } catch (err) {
            console.error("Google Auth Error:", err);
            setError(err.message);
        }
    };

    return (
        <div className="auth-body">
            <div className={`auth-container ${isSignUp ? "right-panel-active" : ""}`} id="container">

                {/* Sign Up Form Container */}
                <div className="form-container sign-up-container">
                    <div style={{ padding: '0 50px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
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

                        <span style={{ margin: '15px 0' }}>or use your email for registration</span>

                        {isSignUp && error && <div className="error-badge">{error}</div>}

                        <form onSubmit={handleRegisterSubmit} style={{ width: '100%', padding: '0' }}>

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
                </div>

                {/* Sign In Form Container */}
                <div className="form-container sign-in-container">
                    <div style={{ padding: '0 50px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                        <h1 style={{ marginBottom: '15px' }}>Sign in</h1>
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
                                <FaGoogle style={{ color: '#4285F4' }} />
                                Sign in with Google
                            </button>
                        </div>
                        <span style={{ margin: '15px 0' }}>or use your account</span>

                        {!isSignUp && error && <div className="error-badge">{error}</div>}

                        <form onSubmit={handleLoginSubmit} style={{ width: '100%', padding: '0' }}>

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

                            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <p style={{ fontSize: '0.8rem', color: '#777', marginBottom: '10px' }}>Demo Access:</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLoginData({ email: 'lead@demo.com', password: 'password123' });
                                    }}
                                    style={{ width: '100%', marginBottom: '10px', background: 'transparent', border: '1px solid #333', color: '#fff' }}
                                >
                                    Fill as Project Lead
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLoginData({ email: 'admin@agileflow.com', password: 'admin123' });
                                    }}
                                    style={{ width: '100%', background: 'transparent', border: '1px solid #333', color: '#fff' }}
                                >
                                    Fill as Admin
                                </button>
                            </div>
                        </form>
                    </div>
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


