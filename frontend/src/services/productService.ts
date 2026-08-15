import { api } from './api';
import type { Product } from '../components/ProductsTable';

export const productService = {
    // GET: Buscar todos os produtos
    getAll: async (): Promise<Product[]> => {
        const response = await api.get<Product[]>('/products');
        return response.data;
    },

    // GET: Buscar produtos perto de vencer
    getNearExpiration: async (): Promise<Product[]> => {
        const response = await api.get<Product[]>('/products/near-expiration');
        return response.data;
    },

    // GET: Buscar produtos vencidos
    getExpired: async (): Promise<Product[]> => {
        const response = await api.get<Product[]>('/products/expired');
        return response.data;
    },
};
