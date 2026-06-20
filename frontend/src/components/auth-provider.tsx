"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface AuthContextType {
    user: any;
    activeRole: any;
    loading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => void;
    switchRole: (roleId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [activeRole, setActiveRole] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedRole = localStorage.getItem('activeRole');
        if (token && storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            if (storedRole) {
                setActiveRole(JSON.parse(storedRole));
            } else if (parsedUser.roles?.length > 0) {
                setActiveRole(parsedUser.roles[0]);
            }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, pass: string) => {
        const { data } = await api.post('/auth/login', { email, password: pass });
        const { accessToken, user } = data;

        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(user));

        if (user.roles?.length > 0) {
            localStorage.setItem('activeRole', JSON.stringify(user.roles[0]));
            setActiveRole(user.roles[0]);
        }

        setUser(user);
        router.push('/dashboard');
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('activeRole');
        setUser(null);
        setActiveRole(null);
        router.push('/login');
    };

    const switchRole = (roleId: string) => {
        if (!user) return;
        const role = user.roles?.find((r: any) => r.id === roleId);
        if (role) {
            setActiveRole(role);
            localStorage.setItem('activeRole', JSON.stringify(role));
            toast.info(`Switched to ${role.name} view`);
            router.push('/dashboard');
        }
    };

    return (
        <AuthContext.Provider value={{ user, activeRole, loading, login, logout, switchRole }}>
            {children}
        </AuthContext.Provider>
    );
}

import { toast } from 'sonner';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
