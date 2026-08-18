import { api } from './api';

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'USER';
    firstAccess: boolean;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export const authService = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/auth/login', { email, password });
        return response.data;
    },

    changeFirstPassword: async (userId: number, newPassword: string): Promise<User> => {
        const response = await api.post<User>('/auth/change-first-password', { userId, newPassword });
        return response.data;
    },

    forgotPassword: async (email: string): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
        return response.data;
    },

    verifyCode: async (email: string, code: string): Promise<{ valid: boolean }> => {
        const response = await api.post<{ valid: boolean }>('/auth/verify-code', { email, code });
        return response.data;
    },

    resetPassword: async (email: string, code: string, newPassword: string): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>('/auth/reset-password', {
            email,
            code,
            newPassword,
        });
        return response.data;
    },
};
