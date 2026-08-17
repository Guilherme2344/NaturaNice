import {
    Paper,
    Title,
    Text,
    Group,
    Grid,
    Select,
    Table,
    Badge,
    Loader,
    Center,
    Stack,
} from '@mantine/core';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Minus,
    ShoppingBag,
    Package,
    Calendar,
    BarChart3,
} from 'lucide-react';
import type { DailySalesSummary, MonthlySalesSummary } from '../services/reportService';

const MONTH_NAMES = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
];

interface BreakdownRow {
    label: string;
    revenue: number;
    cost: number;
    profit: number;
    itemsSold: number;
}

interface ReportViewProps {
    title: string;
    subtitle: string;
    type: 'monthly' | 'annual';
    selectedYear: number;
    onYearChange: (year: number) => void;
    selectedMonth?: number;
    onMonthChange?: (month: number) => void;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    totalItemsSold: number;
    breakdownData: (DailySalesSummary | MonthlySalesSummary)[];
    loading?: boolean;
}

export function ReportView({
    title,
    subtitle,
    type,
    selectedYear,
    onYearChange,
    selectedMonth = 1,
    onMonthChange,
    totalRevenue = 0,
    totalCost = 0,
    totalProfit = 0,
    totalItemsSold = 0,
    breakdownData = [],
    loading = false,
}: ReportViewProps) {
    const START_YEAR = 2026;
    const currentYear = new Date().getFullYear();
    const endYear = Math.max(START_YEAR, currentYear);
    const yearOptions = Array.from(
        { length: endYear - START_YEAR + 1 },
        (_, i) => String(START_YEAR + i)
    );

    const monthOptions = MONTH_NAMES.map((name, index) => ({
        value: String(index + 1),
        label: name,
    }));

    const formatCurrency = (val: number) =>
        `R$ ${(val || 0).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateStr;
    };

    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    const getProfitIndicator = (profit: number) => {
        if (profit > 0) {
            return {
                Icon: TrendingUp,
                badgeColor: 'green',
                textColor: 'teal',
                bgColor: 'teal.0',
                iconClass: 'text-teal-600',
            };
        }
        if (profit < 0) {
            return {
                Icon: TrendingDown,
                badgeColor: 'red',
                textColor: 'red',
                bgColor: 'red.0',
                iconClass: 'text-red-600',
            };
        }
        return {
            Icon: Minus,
            badgeColor: 'gray',
            textColor: 'gray.6',
            bgColor: 'gray.1',
            iconClass: 'text-gray-500',
        };
    };

    const totalProfitMeta = getProfitIndicator(totalProfit);
    const TotalProfitIcon = totalProfitMeta.Icon;

    // Transform breakdown data into standard format for display
    const rows: BreakdownRow[] = breakdownData.map((item) => {
        if ('date' in item) {
            return {
                label: formatDate(item.date),
                revenue: item.revenue,
                cost: item.cost,
                profit: item.profit,
                itemsSold: item.itemsSold,
            };
        } else {
            return {
                label: MONTH_NAMES[item.month - 1] || `Mês ${item.month}`,
                revenue: item.revenue,
                cost: item.cost,
                profit: item.profit,
                itemsSold: item.itemsSold,
            };
        }
    });

    return (
        <Stack gap="lg">
            {/* Top Bar with Title and Controls */}
            <Paper shadow="xs" p="md" radius="md" withBorder>
                <Group justify="space-between" align="center" wrap="wrap" gap="md">
                    <div>
                        <Group gap="xs">
                            {type === 'monthly' ? (
                                <Calendar className="text-teal-600" size={24} />
                            ) : (
                                <BarChart3 className="text-blue-600" size={24} />
                            )}
                            <Title order={3}>{title}</Title>
                        </Group>
                        <Text size="sm" c="dimmed" mt={2}>
                            {subtitle}
                        </Text>
                    </div>

                    <Group gap="sm">
                        {type === 'monthly' && onMonthChange && (
                            <Select
                                label="Mês"
                                data={monthOptions}
                                value={String(selectedMonth)}
                                onChange={(val) => val && onMonthChange(Number(val))}
                                style={{ width: 140 }}
                                size="xs"
                            />
                        )}
                        <Select
                            label="Ano"
                            data={yearOptions}
                            value={String(selectedYear)}
                            onChange={(val) => val && onYearChange(Number(val))}
                            style={{ width: 100 }}
                            size="xs"
                        />
                    </Group>
                </Group>
            </Paper>

            {/* KPI Cards */}
            <Grid>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Paper shadow="xs" p="md" radius="md" withBorder bg="var(--mantine-color-body)">
                        <Group justify="space-between" align="flex-start">
                            <div>
                                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                                    Faturamento Total
                                </Text>
                                <Text size="xl" fw={800} mt={4} c="blue">
                                    {formatCurrency(totalRevenue)}
                                </Text>
                            </div>
                            <Paper p="xs" radius="md" bg="blue.0">
                                <DollarSign size={22} className="text-blue-600" />
                            </Paper>
                        </Group>
                    </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Paper shadow="xs" p="md" radius="md" withBorder bg="var(--mantine-color-body)">
                        <Group justify="space-between" align="flex-start">
                            <div>
                                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                                    Custo Total
                                </Text>
                                <Text size="xl" fw={800} mt={4} c="orange">
                                    {formatCurrency(totalCost)}
                                </Text>
                            </div>
                            <Paper p="xs" radius="md" bg="orange.0">
                                <ShoppingBag size={22} className="text-orange-600" />
                            </Paper>
                        </Group>
                    </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Paper shadow="xs" p="md" radius="md" withBorder bg="var(--mantine-color-body)">
                        <Group justify="space-between" align="flex-start">
                            <div>
                                <Group gap={6} align="center">
                                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                                        Lucro Total
                                    </Text>
                                    <Badge
                                        size="xs"
                                        color={totalProfitMeta.badgeColor}
                                        variant="light"
                                        leftSection={<TotalProfitIcon size={12} />}
                                    >
                                        {totalProfit === 0 ? '-' : `${profitMargin.toFixed(1)}%`}
                                    </Badge>
                                </Group>
                                <Text size="xl" fw={800} mt={4} c={totalProfitMeta.textColor}>
                                    {totalProfit === 0 ? '-' : formatCurrency(totalProfit)}
                                </Text>
                            </div>
                            <Paper p="xs" radius="md" bg={totalProfitMeta.bgColor}>
                                <TotalProfitIcon size={22} className={totalProfitMeta.iconClass} />
                            </Paper>
                        </Group>
                    </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Paper shadow="xs" p="md" radius="md" withBorder bg="var(--mantine-color-body)">
                        <Group justify="space-between" align="flex-start">
                            <div>
                                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                                    Unidades Vendidas
                                </Text>
                                <Text size="xl" fw={800} mt={4} c="gray.8">
                                    {totalItemsSold} un.
                                </Text>
                            </div>
                            <Paper p="xs" radius="md" bg="violet.0">
                                <Package size={22} className="text-violet-600" />
                            </Paper>
                        </Group>
                    </Paper>
                </Grid.Col>
            </Grid>

            {/* Breakdown Table */}
            <Paper shadow="xs" p="md" radius="md" withBorder>
                <Title order={4} mb="md">
                    {type === 'monthly' ? 'Detalhamento Diário das Vendas' : 'Detalhamento Mensal das Vendas'}
                </Title>

                {loading ? (
                    <Center py="xl" style={{ flexDirection: 'column', gap: 8 }}>
                        <Loader size="sm" color="blue" />
                        <Text size="sm" c="dimmed">
                            Carregando dados do relatório...
                        </Text>
                    </Center>
                ) : rows.length > 0 ? (
                    <Table striped highlightOnHover verticalSpacing="sm">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>{type === 'monthly' ? 'Data' : 'Mês'}</Table.Th>
                                <Table.Th>Faturamento</Table.Th>
                                <Table.Th>Custo</Table.Th>
                                <Table.Th>Lucro</Table.Th>
                                <Table.Th>Qtd. Vendida</Table.Th>
                                <Table.Th>Margem (%)</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {rows.map((row, index) => {
                                const rowMargin = row.revenue > 0 ? (row.profit / row.revenue) * 100 : 0;
                                const rowMeta = getProfitIndicator(row.profit);
                                const RowIcon = rowMeta.Icon;

                                return (
                                    <Table.Tr key={index}>
                                        <Table.Td fw={600}>{row.label}</Table.Td>
                                        <Table.Td fw={500} c="blue">
                                            {formatCurrency(row.revenue)}
                                        </Table.Td>
                                        <Table.Td c="orange">{formatCurrency(row.cost)}</Table.Td>
                                        <Table.Td fw={700} c={rowMeta.textColor}>
                                            {row.profit === 0 ? '-' : formatCurrency(row.profit)}
                                        </Table.Td>
                                        <Table.Td fw={500}>{row.itemsSold} un.</Table.Td>
                                        <Table.Td>
                                            <Badge
                                                variant="light"
                                                color={rowMeta.badgeColor}
                                                leftSection={<RowIcon size={12} />}
                                            >
                                                {row.profit === 0 ? '-' : `${rowMargin.toFixed(1)}%`}
                                            </Badge>
                                        </Table.Td>
                                    </Table.Tr>
                                );
                            })}
                        </Table.Tbody>
                    </Table>
                ) : (
                    <Center py="xl" style={{ flexDirection: 'column', gap: 8 }}>
                        <Text c="dimmed" size="sm">
                            Nenhuma venda registrada para o período selecionado.
                        </Text>
                    </Center>
                )}
            </Paper>
        </Stack>
    );
}
