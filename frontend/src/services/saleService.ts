import { api } from './api';
import type { PaymentMethod } from './customerService';

export interface CreateSaleItemDTO {
    productId: string;
    batchId?: string;
    quantity: number;
    sellingPrice?: number;
}

export interface CreateSaleDTO {
    productId?: string;
    batchId?: string;
    quantity?: number;
    sellingPrice?: number;
    items?: CreateSaleItemDTO[];
    amountPaid?: number;
    customerName?: string;
    observation?: string;
    isPersonalUse?: boolean;
    paymentMethod?: PaymentMethod;
}

export interface SaleResponse {
    saleId: string;
    saleDate: string;
    productId?: string;
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
    paymentMethod?: PaymentMethod;
    paymentMethodDescription?: string;
}

export const saleService = {
    createSale: async (data: CreateSaleDTO): Promise<SaleResponse> => {
        const response = await api.post<SaleResponse>('/sales', data);
        return response.data;
    },
};
