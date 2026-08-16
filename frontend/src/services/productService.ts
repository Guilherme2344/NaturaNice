import { api } from './api';
import type { Product } from '../components/ProductsTable';

export interface CreateProductDTO {
    name: string;
    quantity: number;
    expirationDate: string; // Formato "YYYY-MM-DD"
    purchasePrice: number;
    sellingPrice: number;
    brandId: number;
    categoryId: number;
    familyId: number;
}

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

    // POST (Cadastro)
    create: async (data: CreateProductDTO): Promise<Product> => {
        const response = await api.post<Product>('/products', data);
        return response.data;
    },

    // DELETE (Exclusão)
    delete: async (id: number): Promise<void> => {
        await api.delete(`/products/${id}`);
    },
};
