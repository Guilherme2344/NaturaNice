import { api } from './api';

export interface DailySalesSummary {
    date: string;
    revenue: number;
    cost: number;
    profit: number;
    itemsSold: number;
}

export interface MonthlySalesSummary {
    month: number;
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
    getMonthlyReport: async (year?: number, month?: number): Promise<MonthlySalesReport> => {
        const params: Record<string, number> = {};
        if (year) params.year = year;
        if (month) params.month = month;
        const response = await api.get<MonthlySalesReport>('/report/monthly', { params });
        return response.data;
    },

    getAnnualReport: async (year?: number): Promise<AnnualSalesReport> => {
        const params: Record<string, number> = {};
        if (year) params.year = year;
        const response = await api.get<AnnualSalesReport>('/report/annual', { params });
        return response.data;
    },
};
