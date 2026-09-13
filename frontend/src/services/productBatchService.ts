import api from './api';

export interface ProductBatch {
    id: string;
    productId: string;
    productName?: string;
    quantity: number;
    purchaseDate: string;
    expirationDate?: string | null;
    purchasePrice: number;
    sellingPrice: number;
}

export interface CreateProductBatchDTO {
    productId: string;
    quantity: number;
    purchaseDate: string;
    expirationDate?: string | null;
    purchasePrice?: number;
    sellingPrice: number;
}

export const productBatchService = {
    async createBatch(data: CreateProductBatchDTO): Promise<ProductBatch> {
        const response = await api.post<ProductBatch>('/product-batches', data);
        return response.data;
    },

    async updateBatch(id: string, data: CreateProductBatchDTO): Promise<ProductBatch> {
        const response = await api.put<ProductBatch>(`/product-batches/${id}`, data);
        return response.data;
    },

    async deleteBatch(id: string): Promise<void> {
        await api.delete(`/product-batches/${id}`);
    },

    async getByProduct(productId: string): Promise<ProductBatch[]> {
        const response = await api.get<ProductBatch[]>(`/product-batches/product/${productId}`);
        return response.data;
    },

    async getAll(): Promise<ProductBatch[]> {
        const response = await api.get<ProductBatch[]>('/product-batches');
        return response.data;
    },
};
