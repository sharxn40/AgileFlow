import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Initialize Auth State from LocalStorage
    useEffect(() => {
        const initAuth = () => {
            try {
                const storedUser = localStorage.getItem('user');
                const storedToken = localStorage.getItem('token');
                if (storedUser && storedToken) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error("Auth init failed", error);
                localStorage.clear();
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        setUser(userData);
    };

    const logout = useCallback(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    }, [navigate]);

    // Enhanced Fetch Wrapper that handles 401
    const authFetch = useCallback(async (url, options = {}) => {
        const token = localStorage.getItem('token');
        const headers = {
            ...options.headers,
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        };

        try {
            const response = await fetch(url, { ...options, headers });

            if (response.status === 401) {
                // Token expired or invalid
                console.warn("Session expired. Logging out.");
                logout();
                return response; // Caller handles the rest, but user is redirected
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
