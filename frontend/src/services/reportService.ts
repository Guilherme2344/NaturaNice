import { api } from './api';

export interface DailySalesSummary {
    date: string;
    customerName?: string;
    revenue: number;
    cost: number;
    profit: number;
    itemsSold: number;
}

export interface MonthlySalesSummary {
    month: number;
    customerName?: string;
    revenue: number;
    cost: number;
    profit: number;
    itemsSold: number;
}

export interface MonthlySalesReport {
    year: number;
    month: number;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    totalItemsSold: number;
    dailySummaries: DailySalesSummary[];
}

export interface AnnualSalesReport {
    year: number;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    totalItemsSold: number;
    monthlySummaries: MonthlySalesSummary[];
}

export const reportService = {
    getMonthlyReport: async (
        year?: number,
        month?: number,
        customerName?: string
    ): Promise<MonthlySalesReport> => {
        const params: Record<string, string | number> = {};
        if (year) params.year = year;
        if (month) params.month = month;
        if (customerName && customerName.trim() !== '') {
            params.customerName = customerName.trim();
        }
        const response = await api.get<MonthlySalesReport>('/report/monthly', { params });
        return response.data;
    },

    getAnnualReport: async (
        year?: number,
        customerName?: string
    ): Promise<AnnualSalesReport> => {
        const params: Record<string, string | number> = {};
        if (year) params.year = year;
        if (customerName && customerName.trim() !== '') {
            params.customerName = customerName.trim();
        }
        const response = await api.get<AnnualSalesReport>('/report/annual', { params });
        return response.data;
    },
};
