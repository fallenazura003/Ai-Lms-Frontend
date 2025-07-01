'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
    token: string | null;
    role: string | null;
    status: string | null;
    setAuth: (token: string, role: string, status: string) => boolean;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
    token: null,
    role: null,
    status: null,
    setAuth: () => false,
    logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedRole = localStorage.getItem('role');
        const savedStatus = localStorage.getItem('status');
        if (savedToken) setToken(savedToken);
        if (savedRole) setRole(savedRole);
        if (savedStatus) setStatus(savedStatus);
    }, []);

    const setAuth = (newToken: string, newRole: string, newStatus: string) => {
        if (newStatus !== 'ACTIVE') return false; // Giả định 'ACTIVE' là trạng thái hợp lệ để setAuth

        setToken(newToken);
        setRole(newRole);
        setStatus(newStatus);
        localStorage.setItem('token', newToken);
        localStorage.setItem('role', newRole);
        localStorage.setItem('status', newStatus);
        return true;
    };

    const logout = async () => {
        // Gửi yêu cầu logout đến backend
        if (token) {
            try {
                const response = await fetch('http://localhost:8080/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });

                if (response.ok) {
                    console.log('Logout successful on server.');
                } else {
                    setToken(null);
                    setRole(null);
                    setStatus(null);
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    localStorage.removeItem('status');
                }
            } catch (error) {
                setToken(null);
                setRole(null);
                setStatus(null);
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                localStorage.removeItem('status');
            }
        }

        // Xóa token và trạng thái khỏi client (localStorage và state)
        setToken(null);
        setRole(null);
        setStatus(null);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('status');
    };

    return (
        <AuthContext.Provider value={{ token, role, status, setAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);