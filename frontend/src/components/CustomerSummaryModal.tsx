import { useEffect, useState } from 'react';
import {
    Modal,
    Button,
    Group,
    Text,
    Stack,
    Paper,
    Badge,
    Grid,
    Table,
    Loader,
    Center,
    Alert,
    ActionIcon,
    Popover,
} from '@mantine/core';
import {
    UserCheck,
    DollarSign,
    CheckCircle2,
    Clock,
    Copy,
    Check,
    History,
    MessageSquare,
} from 'lucide-react';
import {
    customerService,
    type Customer,
    type CustomerSummary,
    type CustomerPurchaseItem,
    type PaymentMethod,
    PAYMENT_METHOD_LABELS,
} from '../services/customerService';
import { formatDateDisplay } from '../utils/expirationUtils';
import { cleanProductNameForWhatsapp } from '../utils/stringUtils';
import { ProductPaymentModal } from './ProductPaymentModal';

interface CustomerSummaryModalProps {
    opened: boolean;
    onClose: () => void;
    customer: Customer | null;
}

export function CustomerSummaryModal({
    opened,
    onClose,
    customer,
}: CustomerSummaryModalProps) {
    const [summary, setSummary] = useState<CustomerSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // Selected product for ProductPaymentModal
    const [selectedItem, setSelectedItem] =
        useState<CustomerPurchaseItem | null>(null);
    const [paymentModalOpened, setPaymentModalOpened] = useState(false);

    const fetchSummary = () => {
        if (customer?.id) {
            setLoading(true);
            customerService
                .getSummary(customer.id)
                .then((data) => {
                    setSummary(data);
                    // Update selectedItem if open
                    if (selectedItem) {
                        const updated = data.items.find(
                            (i) => i.saleId === selectedItem.saleId
                        );
                        if (updated) setSelectedItem(updated);
                    }
                })
                .catch((err) =>
                    console.error('Erro ao buscar resumo do cliente:', err)
                )
                .finally(() => setLoading(false));
        }
    };

    useEffect(() => {
        if (opened && customer?.id) {
            setCopied(false);
            fetchSummary();
        } else {
            setSummary(null);
        }
    }, [opened, customer]);

    if (!customer) return null;

    const handleOpenPaymentModal = (item: CustomerPurchaseItem) => {
        setSelectedItem(item);
        setPaymentModalOpened(true);
    };

    const generateWhatsappText = (): string => {
        if (!summary) return '';

        let text = `Olá, *${summary.customerName}*!\n\n`;
        text += `🛍️ Segue resumo das suas compras:\n\n`;

        // Sort items (sales) chronologically (oldest to newest)
        const sortedItems = (summary.items || []).slice().sort((a, b) => {
            const dateA = new Date(a.saleDate).getTime();
            const dateB = new Date(b.saleDate).getTime();
            return dateA - dateB;
        });

        // Group sales by date (format DD/MM/YYYY)
        const salesByDate: {
            dateStr: string;
            sales: CustomerPurchaseItem[];
        }[] = [];
        sortedItems.forEach((sale) => {
            const dateStr = formatDateDisplay(sale.saleDate);
            let group = salesByDate.find((g) => g.dateStr === dateStr);
            if (!group) {
                group = { dateStr, sales: [] };
                salesByDate.push(group);
            }
            group.sales.push(sale);
        });

        // Render each date group
        salesByDate.forEach((group) => {
            text += `*${group.dateStr}*\n`;
            group.sales.forEach((sale) => {
                if (sale.products && sale.products.length > 0) {
                    sale.products.forEach((p) => {
                        const cleanName = cleanProductNameForWhatsapp(
                            p.productName
                        );
                        const prodLabel =
                            p.quantity > 1
                                ? `${cleanName} (${p.quantity} un.)`
                                : cleanName;
                        const prodPrice = p.totalPrice.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        });
                        text += `° ${prodLabel} - R$ ${prodPrice}\n`;
                    });
                } else if (sale.productName) {
                    const lines = sale.productName.split('\n');
                    lines.forEach((line) => {
                        const cleanLine = cleanProductNameForWhatsapp(line);
                        text += `° ${cleanLine} - R$ ${sale.totalAmount.toLocaleString(
                            'pt-BR',
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }
                        )}\n`;
                    });
                }
            });
            text += `\n`;
        });

        const formattedTotal = summary.totalAmount.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        text += `*Total comprado: R$ ${formattedTotal}*\n\n`;

        // Collect all payments across all sales
        const allPayments: {
            date: string;
            amount: number;
            method?: PaymentMethod;
            methodDescription?: string;
        }[] = [];
        sortedItems.forEach((sale) => {
            if (sale.payments && sale.payments.length > 0) {
                sale.payments.forEach((p) => {
                    allPayments.push({
                        date: p.paymentDate,
                        amount: p.amount,
                        method: p.paymentMethod,
                        methodDescription: p.paymentMethodDescription,
                    });
                });
            }
        });

        // Sort payments chronologically
        allPayments.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateA - dateB;
        });

        // Payment history section
        if (allPayments.length > 0) {
            text += `💵 *Histórico de Pagamentos*\n`;
            allPayments.forEach((p) => {
                const pDateStr = formatDateDisplay(p.date);
                const pAmountStr = p.amount.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });
                const methodStr =
                    p.methodDescription ||
                    (p.method ? PAYMENT_METHOD_LABELS[p.method] : '');
                text += `° ${pDateStr} - R$ ${pAmountStr}${methodStr ? ` - ${methodStr}` : ''}\n`;
            });
            text += `\n`;
        }

        // Total section
        const formattedRemaining = summary.totalRemaining.toLocaleString(
            'pt-BR',
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );

        if (summary.totalRemaining > 0) {
            text += `*Saldo a pagar: R$ ${formattedRemaining}*\n\n`;
        } else {
            text += `*Saldo a pagar: R$ 0,00 (Conta Quitada!)* 🎉\n\n`;
        }

        text += `Qualquer dúvida estou à disposição! 😊`;

        return text;
    };

    const handleCopyWhatsappText = async () => {
        const text = generateWhatsappText();
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch (err) {
            console.error('Erro ao copiar para área de transferência:', err);
        }
    };

    return (
        <>
            <Modal
                opened={opened}
                onClose={onClose}
                title={
                    <Group gap="xs">
                        <UserCheck size={22} color="#1c7ed6" />
                        <Text fw={700} size="lg">
                            Resumo de Compras de {customer.name}
                        </Text>
                    </Group>
                }
                centered
                size="1100px"
                radius="md"
            >
                <Stack gap="md">
                    {loading ? (
                        <Center py="xl">
                            <Loader color="blue" size="md" />
                        </Center>
                    ) : summary ? (
                        <>
                            {/* Summary Cards */}
                            <Grid>
                                <Grid.Col span={{ base: 12, sm: 4 }}>
                                    <Paper
                                        p="sm"
                                        withBorder
                                        radius="md"
                                        bg="gray.0"
                                    >
                                        <Text size="xs" c="dimmed" fw={600}>
                                            Total de Compras
                                        </Text>
                                        <Text
                                            fw={800}
                                            size="lg"
                                            c="gray.8"
                                            mt={4}
                                        >
                                            R${' '}
                                            {summary.totalAmount.toLocaleString(
                                                'pt-BR',
                                                {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }
                                            )}
                                        </Text>
                                    </Paper>
                                </Grid.Col>

                                <Grid.Col span={{ base: 12, sm: 4 }}>
                                    <Paper
                                        p="sm"
                                        withBorder
                                        radius="md"
                                        bg="teal.0"
                                    >
                                        <Group gap={4}>
                                            <CheckCircle2
                                                size={16}
                                                color="#099268"
                                            />
                                            <Text size="xs" c="teal.9" fw={700}>
                                                Valor Já Pago
                                            </Text>
                                        </Group>
                                        <Text
                                            fw={800}
                                            size="lg"
                                            c="teal.9"
                                            mt={4}
                                        >
                                            R${' '}
                                            {summary.totalPaid.toLocaleString(
                                                'pt-BR',
                                                {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }
                                            )}
                                        </Text>
                                    </Paper>
                                </Grid.Col>

                                <Grid.Col span={{ base: 12, sm: 4 }}>
                                    <Paper
                                        p="sm"
                                        withBorder
                                        radius="md"
                                        bg={
                                            summary.totalRemaining > 0
                                                ? 'red.0'
                                                : 'teal.0'
                                        }
                                    >
                                        <Group gap={4}>
                                            <Clock
                                                size={16}
                                                color={
                                                    summary.totalRemaining > 0
                                                        ? '#e03131'
                                                        : '#099268'
                                                }
                                            />
                                            <Text
                                                size="xs"
                                                c={
                                                    summary.totalRemaining > 0
                                                        ? 'red.9'
                                                        : 'teal.9'
                                                }
                                                fw={700}
                                            >
                                                {summary.totalRemaining > 0
                                                    ? 'Quanto Ainda Resta a Pagar'
                                                    : 'Conta Quitada'}
                                            </Text>
                                        </Group>
                                        <Text
                                            fw={800}
                                            size="lg"
                                            c={
                                                summary.totalRemaining > 0
                                                    ? 'red.9'
                                                    : 'teal.9'
                                            }
                                            mt={4}
                                        >
                                            R${' '}
                                            {summary.totalRemaining.toLocaleString(
                                                'pt-BR',
                                                {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }
                                            )}
                                        </Text>
                                    </Paper>
                                </Grid.Col>
                            </Grid>

                            {/* WhatsApp Text Preview & Copy Button */}
                            <Paper p="sm" withBorder radius="md" bg="blue.0">
                                <Group justify="space-between" align="center">
                                    <div>
                                        <Text fw={700} size="sm" c="blue.9">
                                            Texto de Cobrança / Resumo WhatsApp
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            Copie a mensagem formatada para
                                            enviar diretamente ao cliente.
                                        </Text>
                                    </div>
                                    <Button
                                        size="xs"
                                        color={copied ? 'teal' : 'blue'}
                                        leftSection={
                                            copied ? (
                                                <Check size={14} />
                                            ) : (
                                                <Copy size={14} />
                                            )
                                        }
                                        onClick={handleCopyWhatsappText}
                                    >
                                        {copied
                                            ? 'Copiado!'
                                            : 'Copiar Texto WhatsApp'}
                                    </Button>
                                </Group>

                                {copied && (
                                    <Alert
                                        icon={<CheckCircle2 size={16} />}
                                        color="teal"
                                        variant="light"
                                        mt="xs"
                                        p="xs"
                                    >
                                        Texto copiado para a área de
                                        transferência com sucesso!
                                    </Alert>
                                )}
                            </Paper>

                            {/* Purchases Table (Cleaned up, only showing the products) */}
                            <Text fw={700} size="sm" mt="xs">
                                Produtos Comprados:
                            </Text>

                            <Table.ScrollContainer minWidth={0}>
                                <Table
                                    striped
                                    highlightOnHover
                                    verticalSpacing="sm"
                                >
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Data Compra</Table.Th>
                                            <Table.Th>Produto</Table.Th>
                                            <Table.Th
                                                style={{ textAlign: 'center' }}
                                            >
                                                Qtd
                                            </Table.Th>
                                            <Table.Th
                                                style={{ textAlign: 'right' }}
                                            >
                                                Total
                                            </Table.Th>
                                            <Table.Th
                                                style={{ textAlign: 'right' }}
                                            >
                                                Já Pago
                                            </Table.Th>
                                            <Table.Th
                                                style={{ textAlign: 'right' }}
                                            >
                                                A Pagar
                                            </Table.Th>
                                            <Table.Th
                                                style={{ textAlign: 'center' }}
                                            >
                                                Status
                                            </Table.Th>
                                            <Table.Th
                                                style={{ textAlign: 'center' }}
                                            >
                                                Ação
                                            </Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {summary.items &&
                                        summary.items.length > 0 ? (
                                            summary.items.map((item) => (
                                                <Table.Tr key={item.saleId}>
                                                    <Table.Td>
                                                        <Text size="xs">
                                                            {formatDateDisplay(
                                                                item.saleDate
                                                            )}
                                                        </Text>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Group
                                                            gap={6}
                                                            align="center"
                                                            wrap="nowrap"
                                                        >
                                                            <Text
                                                                size="xs"
                                                                fw={600}
                                                                style={{
                                                                    whiteSpace:
                                                                        'pre-line',
                                                                }}
                                                            >
                                                                {
                                                                    item.productName
                                                                }
                                                            </Text>
                                                            {item.isPersonalUse && (
                                                                <Badge
                                                                    color="teal"
                                                                    variant="light"
                                                                    size="xs"
                                                                >
                                                                    Uso Pessoal
                                                                </Badge>
                                                            )}
                                                            {item.observation && (
                                                                <Popover
                                                                    width={260}
                                                                    shadow="md"
                                                                    withArrow
                                                                    position="top"
                                                                >
                                                                    <Popover.Target>
                                                                        <ActionIcon
                                                                            variant="light"
                                                                            color="blue"
                                                                            size="xs"
                                                                            aria-label="Ver Observação"
                                                                            style={{
                                                                                cursor: 'pointer',
                                                                            }}
                                                                        >
                                                                            <MessageSquare
                                                                                size={
                                                                                    12
                                                                                }
                                                                            />
                                                                        </ActionIcon>
                                                                    </Popover.Target>
                                                                    <Popover.Dropdown p="xs">
                                                                        <Text
                                                                            size="xs"
                                                                            fw={
                                                                                700
                                                                            }
                                                                            c="dimmed"
                                                                            mb={
                                                                                4
                                                                            }
                                                                        >
                                                                            Observação
                                                                            da
                                                                            Venda:
                                                                        </Text>
                                                                        <Text
                                                                            size="xs"
                                                                            style={{
                                                                                whiteSpace:
                                                                                    'pre-wrap',
                                                                            }}
                                                                        >
                                                                            {
                                                                                item.observation
                                                                            }
                                                                        </Text>
                                                                    </Popover.Dropdown>
                                                                </Popover>
                                                            )}
                                                        </Group>
                                                    </Table.Td>
                                                    <Table.Td align="center">
                                                        <Text size="xs">
                                                            {item.quantity}
                                                        </Text>
                                                    </Table.Td>
                                                    <Table.Td align="right">
                                                        <Text
                                                            size="xs"
                                                            fw={600}
                                                        >
                                                            R${' '}
                                                            {item.totalAmount.toLocaleString(
                                                                'pt-BR',
                                                                {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                }
                                                            )}
                                                        </Text>
                                                    </Table.Td>
                                                    <Table.Td align="right">
                                                        <Text
                                                            size="xs"
                                                            c="teal.9"
                                                        >
                                                            R${' '}
                                                            {item.amountPaid.toLocaleString(
                                                                'pt-BR',
                                                                {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                }
                                                            )}
                                                        </Text>
                                                    </Table.Td>
                                                    <Table.Td align="right">
                                                        <Text
                                                            size="xs"
                                                            c={
                                                                item.remainingAmount >
                                                                0
                                                                    ? 'red.9'
                                                                    : 'gray.6'
                                                            }
                                                            fw={
                                                                item.remainingAmount >
                                                                0
                                                                    ? 700
                                                                    : 400
                                                            }
                                                        >
                                                            R${' '}
                                                            {item.remainingAmount.toLocaleString(
                                                                'pt-BR',
                                                                {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                }
                                                            )}
                                                        </Text>
                                                    </Table.Td>
                                                    <Table.Td align="center">
                                                        <Badge
                                                            color={
                                                                item.status ===
                                                                    'PAID' ||
                                                                item.remainingAmount ===
                                                                    0
                                                                    ? 'teal'
                                                                    : item.status ===
                                                                            'UNPAID' ||
                                                                        item.amountPaid ===
                                                                            0
                                                                      ? 'red'
                                                                      : 'orange'
                                                            }
                                                            size="xs"
                                                        >
                                                            {
                                                                item.statusDescription
                                                            }
                                                        </Badge>
                                                    </Table.Td>
                                                    <Table.Td align="center">
                                                        {item.remainingAmount >
                                                        0 ? (
                                                            <Button
                                                                size="xs"
                                                                color="orange"
                                                                variant="light"
                                                                leftSection={
                                                                    <DollarSign
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                }
                                                                onClick={() =>
                                                                    handleOpenPaymentModal(
                                                                        item
                                                                    )
                                                                }
                                                            >
                                                                Abater
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="xs"
                                                                color="blue"
                                                                variant="subtle"
                                                                leftSection={
                                                                    <History
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                }
                                                                onClick={() =>
                                                                    handleOpenPaymentModal(
                                                                        item
                                                                    )
                                                                }
                                                            >
                                                                Ver Histórico
                                                            </Button>
                                                        )}
                                                    </Table.Td>
                                                </Table.Tr>
                                            ))
                                        ) : (
                                            <Table.Tr>
                                                <Table.Td
                                                    colSpan={8}
                                                    align="center"
                                                    py="md"
                                                >
                                                    <Text size="xs" c="dimmed">
                                                        Nenhuma compra
                                                        registrada para este
                                                        cliente.
                                                    </Text>
                                                </Table.Td>
                                            </Table.Tr>
                                        )}
                                    </Table.Tbody>
                                </Table>
                            </Table.ScrollContainer>
                        </>
                    ) : (
                        <Text size="sm" c="dimmed">
                            Não foi possível carregar os dados do cliente.
                        </Text>
                    )}

                    <Group justify="flex-end" mt="sm">
                        <Button variant="default" onClick={onClose}>
                            Fechar
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Product Specific Payment Modal */}
            <ProductPaymentModal
                opened={paymentModalOpened}
                onClose={() => setPaymentModalOpened(false)}
                item={selectedItem}
                customerName={customer.name}
                onPaymentSuccess={fetchSummary}
            />
        </>
    );
}
