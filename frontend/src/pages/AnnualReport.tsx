import { useEffect, useState } from 'react';
import { ReportView } from '../components/ReportView';
import { reportService, type AnnualSalesReport } from '../services/reportService';

export default function AnnualReport() {
    const today = new Date();
    const [year, setYear] = useState<number>(today.getFullYear());
    const [customer, setCustomer] = useState<string>('');
    const [report, setReport] = useState<AnnualSalesReport | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const data = await reportService.getAnnualReport(year, customer);
            setReport(data);
        } catch (error) {
            console.error('Erro ao carregar relatório anual:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [year, customer]);

    return (
        <ReportView
            title="Relatório de Vendas Anual"
            subtitle="Visão consolidada do faturamento, custos e lucros mês a mês do ano selecionado"
            type="annual"
            selectedYear={year}
            onYearChange={setYear}
            selectedCustomer={customer}
            onCustomerChange={setCustomer}
            totalRevenue={report?.totalRevenue || 0}
            totalCost={report?.totalCost || 0}
            totalProfit={report?.totalProfit || 0}
            totalItemsSold={report?.totalItemsSold || 0}
            breakdownData={report?.monthlySummaries || []}
            loading={loading}
        />
    );
}
