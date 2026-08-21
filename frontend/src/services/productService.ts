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
    // POST
    create: async (data: CreateProductDTO): Promise<Product> => {
        const response = await api.post<Product>('/products', data);
        return response.data;
    },
    // GET: search all products
    getAll: async (): Promise<Product[]> => {
        const response = await api.get<Product[]>('/products');
        return response.data;
    },

    // GET: search products near expiration
    getNearExpiration: async (): Promise<Product[]> => {
        const response = await api.get<Product[]>('/products/near-expiration');
        return response.data;
    },

    // GET: search expired products
    getExpired: async (): Promise<Product[]> => {
        const response = await api.get<Product[]>('/products/expired');
        return response.data;
    },

    // PUT
    update: async (id: number, data: CreateProductDTO): Promise<Product> => {
        const response = await api.put<Product>(`/products/${id}`, data);
        return response.data;
    },

    // DELETE
    delete: async (id: number): Promise<void> => {
        await api.delete(`/products/${id}`);
    },
};
