import { api } from './api';

export type PaymentMethod = 'CARD' | 'CASH' | 'PIX';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    CARD: 'Cartão',
    CASH: 'Dinheiro',
    PIX: 'Pix',
};

export const PAYMENT_METHOD_OPTIONS = [
    { value: 'CARD', label: 'Cartão' },
    { value: 'CASH', label: 'Dinheiro' },
    { value: 'PIX', label: 'Pix' },
];

export interface Customer {
    id: string;
    name: string;
    canDelete?: boolean;
}

export interface SalePayment {
    id: string;
    paymentDate: string;
    amount: number;
    cumulativePaid: number;
    remainingToPay: number;
    paymentMethod?: PaymentMethod;
    paymentMethodDescription?: string;
}

export interface CustomerSaleProduct {
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface CustomerPurchaseItem {
    saleId: string;
    saleDate: string;
    productName: string;
    quantity: number;
    unitSellingPrice: number;
    totalAmount: number;
    amountPaid: number;
    remainingAmount: number;
    status: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID';
    statusDescription: string;
    payments?: SalePayment[];
    observation?: string;
    isPersonalUse?: boolean;
    products?: CustomerSaleProduct[];
    paymentMethod?: PaymentMethod;
    paymentMethodDescription?: string;
}

export interface CustomerSummary {
    customerId: string;
    customerName: string;
    totalAmount: number;
    totalPaid: number;
    totalRemaining: number;
    items: CustomerPurchaseItem[];
}

export const customerService = {
    getAll: async (): Promise<Customer[]> => {
        const response = await api.get<Customer[]>('/customers');
        return response.data;
    },

    getSummary: async (id: string): Promise<CustomerSummary> => {
        const response = await api.get<CustomerSummary>(`/customers/${id}/summary`);
        return response.data;
    },

    addPayment: async (id: string, amount: number): Promise<CustomerSummary> => {
        const response = await api.post<CustomerSummary>(`/customers/${id}/payments`, { amount });
        return response.data;
    },

    create: async (data: { name: string }): Promise<Customer> => {
        const response = await api.post<Customer>('/customers', data);
        return response.data;
    },

    update: async (id: string, data: { name: string }): Promise<Customer> => {
        const response = await api.put<Customer>(`/customers/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/customers/${id}`);
    },
};
