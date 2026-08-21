import { api } from './api';
import type { User } from './authService';

export const userService = {
    getAll: async (): Promise<User[]> => {
        const response = await api.get<User[]>('/admin/users');
        return response.data;
    },

    create: async (name: string, email: string): Promise<User> => {
        const response = await api.post<User>('/admin/users', { name, email });
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/users/${id}`);
    },
};
