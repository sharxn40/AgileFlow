import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Listen to Firebase Auth state for auto token refresh
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Get fresh ID token (Firebase handles refresh automatically)
                const idToken = await firebaseUser.getIdToken();
                localStorage.setItem('token', idToken);

                // Restore user metadata from localStorage (set during sync)
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } else {
                // User signed out
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        setUser(userData);
    };

    const logout = useCallback(async () => {
        await auth.signOut();
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    }, [navigate]);

    // Enhanced Fetch Wrapper that handles 401
    const authFetch = useCallback(async (url, options = {}) => {
        // Always get fresh token from Firebase
        let token = localStorage.getItem('token');
        if (auth.currentUser) {
            token = await auth.currentUser.getIdToken();
            localStorage.setItem('token', token);
        }

        const headers = {
            ...options.headers,
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        };

        try {
            const response = await fetch(url, { ...options, headers });

            if (response.status === 401) {
                console.warn("Session expired. Logging out.");
                logout();
                return response;
            }

            return response;
        } catch (error) {
            throw error;
        }
    }, [logout]);

    return (
        <AuthContext.Provider value={{ user, login, logout, authFetch, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
