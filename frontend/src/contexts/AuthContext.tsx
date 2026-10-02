import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/services/api';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
    department?: string | null;
    joined_at?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => Promise<void> | void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    const logout = useCallback(() => {
        try {
            api.post('/logout').catch(() => {});
        } catch (_e) { /* ignore */ }
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    }, []);

    // Cek token saat aplikasi pertama kali dimuat / saat token berubah
    useEffect(() => {
        if (!token) {
            return;
        }

        let cancelled = false;
        api.get('/me')
            .then((res) => {
                if (!cancelled) {
                    setUser(res.data.user);
                }
            })
            .catch((err) => {
                if (cancelled) return;
                const status = err.response?.status;
                // Hapus token & logout HANYA jika 401 Unauthorized (token invalid/expired)
                // Jangan logout pada error network (5xx) agar tidak salah "tendang" user
                if (status === 401) {
                    logout();
                } else {
                    console.warn('[AuthContext] Gagal memuat data user /me:', err?.message || err);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [token, logout]);

    const login = (newToken: string, userData: User) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};