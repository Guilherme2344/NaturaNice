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
};
