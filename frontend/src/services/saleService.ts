import { api } from './api';

export interface CreateSaleDTO {
    productId: number;
    quantity: number;
    sellingPrice?: number;
}

export interface SaleResponse {
    saleId: number;
    saleDate: string;
    productId: number;
    productName: string;
    quantity: number;
    purchasePrice: number;
    sellingPrice: number;
    totalAmount: number;
    totalProfit: number;
}

export const saleService = {
    createSale: async (data: CreateSaleDTO): Promise<SaleResponse> => {
        const response = await api.post<SaleResponse>('/sales', data);
        return response.data;
    },
};
