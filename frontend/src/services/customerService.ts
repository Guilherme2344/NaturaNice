import { api } from './api';

export interface Customer {
    id: number;
    name: string;
}

export const customerService = {
    getAll: async (): Promise<Customer[]> => {
        const response = await api.get<Customer[]>('/customers');
        return response.data;
    },

    create: async (data: { name: string }): Promise<Customer> => {
        const response = await api.post<Customer>('/customers', data);
        return response.data;
    },

    update: async (id: number, data: { name: string }): Promise<Customer> => {
        const response = await api.put<Customer>(`/customers/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/customers/${id}`);
    },
};
