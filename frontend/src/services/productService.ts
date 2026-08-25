import { api } from './api';
import type { Product } from '../components/ProductsTable';

export interface CreateProductDTO {
    name: string;
    quantity: number;
    expirationDate: string;
    purchasePrice: number;
    sellingPrice: number;
    brandId?: number;
    brandName?: string;
    categoryId?: number;
    categoryName?: string;
    familyId?: number;
    familyName?: string;
}

export const productService = {
    getAll: async (): Promise<Product[]> => {
        const response = await api.get<Product[]>('/products');
        return response.data;
    },

    getExpired: async (): Promise<Product[]> => {
        const response = await api.get<Product[]>('/products/expired');
        return response.data;
    },

    getNearExpiration: async (): Promise<Product[]> => {
        const response = await api.get<Product[]>('/products/near-expiration');
        return response.data;
    },

    create: async (product: CreateProductDTO): Promise<Product> => {
        const response = await api.post<Product>('/products', product);
        return response.data;
    },

    update: async (
        id: number,
        product: CreateProductDTO
    ): Promise<Product> => {
        const response = await api.put<Product>(`/products/${id}`, product);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/products/${id}`);
    },

    sell: async (
        productId: number,
        quantity: number,
        sellingPrice: number,
        customerName?: string
    ): Promise<void> => {
        await api.post('/sales', {
            productId,
            quantity,
            sellingPrice,
            customerName,
        });
    },
};
