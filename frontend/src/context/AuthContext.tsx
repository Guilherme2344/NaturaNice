import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService, type User } from '../services/authService';

const MAX_SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 horas em milissegundos

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<User>;
    logout: () => void;
    updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const checkSessionValidity = () => {
        const loginTimeStr = localStorage.getItem('app_login_time');
        if (loginTimeStr) {
            const loginTime = Number(loginTimeStr);
            if (Date.now() - loginTime > MAX_SESSION_DURATION_MS) {
                // Token expirado (mais de 24 horas)
                return false;
            }
        }
        return true;
    };

    const [user, setUser] = useState<User | null>(() => {
        if (!checkSessionValidity()) {
            localStorage.clear();
            return null;
        }
        const storedUser = localStorage.getItem('app_user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [token, setToken] = useState<string | null>(() => {
        if (!checkSessionValidity()) {
            localStorage.clear();
            return null;
        }
        return localStorage.getItem('app_token');
    });

    // Verificação periódica da sessão (a cada 1 minuto)
    useEffect(() => {
        const interval = setInterval(() => {
            if (!checkSessionValidity()) {
                logout();
            }
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (user) {
            localStorage.setItem('app_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('app_user');
        }
    }, [user]);

    useEffect(() => {
        if (token) {
            localStorage.setItem('app_token', token);
        } else {
            localStorage.removeItem('app_token');
        }
    }, [token]);

    const login = async (email: string, password: string): Promise<User> => {
        const response = await authService.login(email, password);
        setUser(response.user);
        setToken(response.token);
        localStorage.setItem('app_login_time', String(Date.now()));
        return response.user;
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('app_user');
        localStorage.removeItem('app_token');
        localStorage.removeItem('app_login_time');
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
    };

    const isAuthenticated = !!user && checkSessionValidity();
    const isAdmin = user?.role === 'ADMIN';

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated,
                isAdmin,
                login,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}
