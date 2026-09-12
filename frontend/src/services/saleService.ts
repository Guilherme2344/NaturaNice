import { api } from './api';

export interface CreateSaleDTO {
    productId: string;
    quantity: number;
    sellingPrice?: number;
    amountPaid?: number;
    customerName?: string;
    observation?: string;
    isPersonalUse?: boolean;
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
    status: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID';
    statusDescription: string;
    customerName?: string;
    observation?: string;
    isPersonalUse?: boolean;
}

export const saleService = {
    createSale: async (data: CreateSaleDTO): Promise<SaleResponse> => {
        const response = await api.post<SaleResponse>('/sales', data);
        return response.data;
    },
};
