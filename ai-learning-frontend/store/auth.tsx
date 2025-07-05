'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
    token: string | null;
    role: string | null;
    status: string | null;
    userId: string | null;
    setAuth: (token: string, role: string, status: string, userId: string) => boolean;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
    token: null,
    role: null,
    status: null,
    userId: null,
    setAuth: () => false,
    logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedRole = localStorage.getItem('role');
        const savedStatus = localStorage.getItem('status');
        const savedUserId = localStorage.getItem('userId');

        if (savedToken) setToken(savedToken);
        if (savedRole) setRole(savedRole);
        if (savedStatus) setStatus(savedStatus);
        if (savedUserId) setUserId(savedUserId);
    }, []);

    const setAuth = (newToken: string, newRole: string, newStatus: string, newUserId: string) => {
        if (newStatus !== 'ACTIVE') return false;

        setToken(newToken);
        setRole(newRole);
        setStatus(newStatus);
        setUserId(newUserId);

        localStorage.setItem('token', newToken);
        localStorage.setItem('role', newRole);
        localStorage.setItem('status', newStatus);
        localStorage.setItem('userId', newUserId);

        return true;
    };

    const logout = async () => {
        if (token) {
            try {
                await fetch('http://localhost:8080/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
            } catch {
                // ignore errors
            }

            setToken(null);
            setRole(null);
            setStatus(null);
            setUserId(null);

            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('status');
            localStorage.removeItem('userId');
        }
    };

    return (
        <AuthContext.Provider value={{ token, role, status, userId, setAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
