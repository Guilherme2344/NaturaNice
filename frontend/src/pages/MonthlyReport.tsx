import { useEffect, useState } from 'react';
import { ReportView } from '../components/ReportView';
import { reportService, type MonthlySalesReport } from '../services/reportService';

export default function MonthlyReport() {
    const today = new Date();
    const [year, setYear] = useState<number>(today.getFullYear());
    const [month, setMonth] = useState<number>(today.getMonth() + 1);
    const [customer, setCustomer] = useState<string>('');
    const [report, setReport] = useState<MonthlySalesReport | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const data = await reportService.getMonthlyReport(year, month, customer);
            setReport(data);
        } catch (error) {
            console.error('Erro ao carregar relatório mensal:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [year, month, customer]);

    return (
        <ReportView
            title="Relatório de Vendas Mensal"
            subtitle="Visão consolidadas das vendas e lucratividade diária do mês selecionado"
            type="monthly"
            selectedYear={year}
            onYearChange={setYear}
            selectedMonth={month}
            onMonthChange={setMonth}
            selectedCustomer={customer}
            onCustomerChange={setCustomer}
            totalRevenue={report?.totalRevenue || 0}
            totalCost={report?.totalCost || 0}
            totalProfit={report?.totalProfit || 0}
            totalItemsSold={report?.totalItemsSold || 0}
            breakdownData={report?.dailySummaries || []}
            loading={loading}
        />
    );
}
