import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [admin, setAdmin] = useState(() => {
        // Try to get admin data from localStorage on initialization
        const savedAdmin = localStorage.getItem('admin');
        return savedAdmin ? JSON.parse(savedAdmin) : null;
    });
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check for existing token on mount
        const checkAuth = async () => {
            const token = localStorage.getItem('adminToken');
            if (token) {
                try {
                    const response = await api.get('/admin', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setAdmin(response.data);
                    setIsAuthenticated(true);
                } catch (err) {
                    localStorage.removeItem('adminToken');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await api.post('/admin/login', { email, password });
            localStorage.setItem('adminToken', response.data.token);
            localStorage.setItem('admin', JSON.stringify(response.data.admin));
            setAdmin(response.data.admin);
            setIsAuthenticated(true);
            setLoading(false);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            setLoading(false);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        setAdmin(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{
            admin,
            isAuthenticated,
            loading,
            error,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}