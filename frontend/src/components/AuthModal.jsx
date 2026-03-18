import API_BASE_URL from '../config.js';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaTimes, FaGoogle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { auth, googleProvider } from '../firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    updateProfile
} from 'firebase/auth';
import '../pages/Auth.css';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
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

    // --- Sync User metadata with Backend after Firebase Auth ---
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
            onClose();
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
            const userCredential = await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
            const idToken = await userCredential.user.getIdToken();
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
            const userCredential = await createUserWithEmailAndPassword(auth, registerData.email, registerData.password);
            await updateProfile(userCredential.user, { displayName: registerData.username });
            const idToken = await userCredential.user.getIdToken();
            await syncWithBackend(userCredential.user, idToken);
        } catch (err) {
            console.error("Register Error:", err);
            setError(err.message);
        }
    };

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

    if (!isOpen) return null;

    return (
        <div className="auth-modal-overlay" onClick={onClose}>
            <div className="auth-modal-content" onClick={e => e.stopPropagation()}>
                <button className="auth-modal-close" onClick={onClose}>
                    <FaTimes />
                </button>

                <div className={`auth-container ${isSignUp ? "right-panel-active" : ""}`} id="premium-auth-modal">

                    {/* Sign Up Form Container */}
                    <div className="form-container sign-up-container">
                        <form onSubmit={handleRegisterSubmit}>
                            <h1>Create Account</h1>
                            <p>Use your Google email for auto-fill</p>

                            <div className="social-container">
                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    className="google-btn"
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
                            <div className="form-group relative-group">
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
                                    className="password-toggle"
                                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                >
                                    {showRegisterPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                            <div className="form-group relative-group">
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
                                    className="password-toggle"
                                    onClick={() => setShowRegisterConfirm(!showRegisterConfirm)}
                                >
                                    {showRegisterConfirm ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>

                            <button type="submit" className="submit-btn">Sign Up</button>
                        </form>
                    </div>

                    {/* Sign In Form Container */}
                    <div className="form-container sign-in-container">
                        <form onSubmit={handleLoginSubmit}>
                            <h1>Sign in</h1>
                            <div className="social-container">
                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    className="google-btn"
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
                            <div className="form-group relative-group">
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
                                    className="password-toggle"
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
                                    className="forgot-password-link"
                                    onClick={() => {
                                        onClose();
                                        navigate('/forgot-password');
                                    }}
                                >
                                    Forgot your password?
                                </span>
                            </div>

                            <button type="submit" className="submit-btn">Sign In</button>
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


