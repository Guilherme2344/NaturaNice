import { api } from './api';

// DTO interface for user management in admin panel
export interface UserAdminDTO {
    id: number;
    name: string;
    email: string;
    role: string;
    firstAccess: boolean;
}

// Service to handle user administration API requests
export const userService = {
    // Fetch list of registered users
    getAll: async (): Promise<UserAdminDTO[]> => {
        const response = await api.get<UserAdminDTO[]>('/admin/users');
        return response.data;
    },

    // Create a new user account
    create: async (name: string, email: string): Promise<UserAdminDTO> => {
        const response = await api.post<UserAdminDTO>('/admin/users', { name, email });
        return response.data;
    },

    // Delete a user account by ID
    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/users/${id}`);
    },
};
