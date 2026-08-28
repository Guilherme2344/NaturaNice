import { api } from './api';

export interface CreateSaleDTO {
    productId: string;
    quantity: number;
    sellingPrice?: number;
    amountPaid?: number;
    customerName?: string;
}

export interface SaleResponse {
    saleId: string;
    saleDate: string;
    productId: string;
    productName: string;
    quantity: number;
    purchasePrice: number;
    sellingPrice: number;
    totalAmount: number;
    amountPaid: number;
    remainingAmount: number;
    totalProfit: number;
    status: 'PAID' | 'PARTIALLY_PAID';
    statusDescription: string;
    customerName?: string;
}

export const saleService = {
    createSale: async (data: CreateSaleDTO): Promise<SaleResponse> => {
        const response = await api.post<SaleResponse>('/sales', data);
        return response.data;
    },
};
