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
} from '@mantine/core';
import {
    UserCheck,
    DollarSign,
    CheckCircle2,
    Clock,
    Copy,
    Check,
    History,
} from 'lucide-react';
import {
    customerService,
    type Customer,
    type CustomerSummary,
    type CustomerPurchaseItem,
} from '../services/customerService';
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
    const [selectedItem, setSelectedItem] = useState<CustomerPurchaseItem | null>(null);
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
                        const updated = data.items.find((i) => i.saleId === selectedItem.saleId);
                        if (updated) setSelectedItem(updated);
                    }
                })
                .catch((err) => console.error('Erro ao buscar resumo do cliente:', err))
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

        const formattedTotal = summary.totalAmount.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        const formattedPaid = summary.totalPaid.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        const formattedRemaining = summary.totalRemaining.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        let text = `Olá, *${summary.customerName}*! 👋\n\n`;
        text += `Segue o resumo da sua conta na Natura Nice:\n\n`;

        if (summary.items && summary.items.length > 0) {
            text += `🛍️ *Produtos Comprados & Histórico de Parcelas:*\n`;
            summary.items.forEach((item) => {
                const dateStr = item.saleDate
                    ? new Date(item.saleDate).toLocaleDateString('pt-BR')
                    : '';
                const itemTotal = item.totalAmount.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });

                text += `• *${item.productName}* (x${item.quantity}) - Total: R$ ${itemTotal} [Data Compra: ${dateStr}]\n`;

                if (item.payments && item.payments.length > 0) {
                    item.payments.forEach((p, idx) => {
                        const pDateStr = p.paymentDate
                            ? new Date(p.paymentDate).toLocaleDateString('pt-BR')
                            : '';
                        const pAmount = p.amount.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        });
                        const pPaidAcc = p.cumulativePaid.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        });
                        const pRem = p.remainingToPay.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        });

                        text += `   - Parcela ${item.payments!.length - idx} (${pDateStr}): Valor Pago R$ ${pAmount} | *A Pagar: R$ ${pRem}*\n`;
                    });
                } else {
                    const itemPaid = item.amountPaid.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    });
                    const itemRemaining = item.remainingAmount.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    });
                    if (item.remainingAmount > 0) {
                        text += `   - Já Pago: R$ ${itemPaid} | *A Pagar: R$ ${itemRemaining}*\n`;
                    } else {
                        text += `   - Já Pago: R$ ${itemPaid} (Totalmente Pago 🎉)\n`;
                    }
                }
            });
            text += `\n`;
        }

        text += `📊 *Resumo Financeiro da Conta:*\n`;
        text += `• Valor Total Comprado: R$ ${formattedTotal}\n`;
        text += `• Valor Já Pago: R$ ${formattedPaid}\n`;

        if (summary.totalRemaining > 0) {
            text += `• *Valor Restante A Pagar: R$ ${formattedRemaining}*\n\n`;
            text += `Para combinar o pagamento do valor pendente, basta me responder por aqui! `;
        } else {
            text += `• *Situação: Conta Totalmente Quitada!* 🎉\n\n`;
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
                                    <Paper p="sm" withBorder radius="md" bg="gray.0">
                                        <Text size="xs" c="dimmed" fw={600}>
                                            Total de Compras
                                        </Text>
                                        <Text fw={800} size="lg" c="gray.8" mt={4}>
                                            R${' '}
                                            {summary.totalAmount.toLocaleString('pt-BR', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </Text>
                                    </Paper>
                                </Grid.Col>

                                <Grid.Col span={{ base: 12, sm: 4 }}>
                                    <Paper p="sm" withBorder radius="md" bg="teal.0">
                                        <Group gap={4}>
                                            <CheckCircle2 size={16} color="#099268" />
                                            <Text size="xs" c="teal.9" fw={700}>
                                                Valor Já Pago
                                            </Text>
                                        </Group>
                                        <Text fw={800} size="lg" c="teal.9" mt={4}>
                                            R${' '}
                                            {summary.totalPaid.toLocaleString('pt-BR', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </Text>
                                    </Paper>
                                </Grid.Col>

                                <Grid.Col span={{ base: 12, sm: 4 }}>
                                    <Paper
                                        p="sm"
                                        withBorder
                                        radius="md"
                                        bg={summary.totalRemaining > 0 ? 'red.0' : 'teal.0'}
                                    >
                                        <Group gap={4}>
                                            <Clock
                                                size={16}
                                                color={summary.totalRemaining > 0 ? '#e03131' : '#099268'}
                                            />
                                            <Text
                                                size="xs"
                                                c={summary.totalRemaining > 0 ? 'red.9' : 'teal.9'}
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
                                            c={summary.totalRemaining > 0 ? 'red.9' : 'teal.9'}
                                            mt={4}
                                        >
                                            R${' '}
                                            {summary.totalRemaining.toLocaleString('pt-BR', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
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
                                            Copie a mensagem formatada para enviar diretamente ao cliente.
                                        </Text>
                                    </div>
                                    <Button
                                        size="xs"
                                        color={copied ? 'teal' : 'blue'}
                                        leftSection={copied ? <Check size={14} /> : <Copy size={14} />}
                                        onClick={handleCopyWhatsappText}
                                    >
                                        {copied ? 'Copiado!' : 'Copiar Texto WhatsApp'}
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
                                        Texto copiado para a área de transferência com sucesso!
                                    </Alert>
                                )}
                            </Paper>

                            {/* Purchases Table (Cleaned up, only showing the products) */}
                            <Text fw={700} size="sm" mt="xs">
                                Produtos Comprados:
                            </Text>

                            <Table.ScrollContainer minWidth={0}>
                                <Table striped highlightOnHover verticalSpacing="sm">
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Data Compra</Table.Th>
                                            <Table.Th>Produto</Table.Th>
                                            <Table.Th style={{ textAlign: 'center' }}>Qtd</Table.Th>
                                            <Table.Th style={{ textAlign: 'right' }}>Total</Table.Th>
                                            <Table.Th style={{ textAlign: 'right' }}>Já Pago</Table.Th>
                                            <Table.Th style={{ textAlign: 'right' }}>A Pagar</Table.Th>
                                            <Table.Th style={{ textAlign: 'center' }}>Status</Table.Th>
                                            <Table.Th style={{ textAlign: 'center' }}>Ação</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {summary.items && summary.items.length > 0 ? (
                                            summary.items.map((item) => (
                                                <Table.Tr key={item.saleId}>
                                                    <Table.Td>
                                                        <Text size="xs">
                                                            {new Date(item.saleDate).toLocaleDateString('pt-BR')}
                                                        </Text>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Text size="xs" fw={600}>
                                                            {item.productName}
                                                        </Text>
                                                    </Table.Td>
                                                    <Table.Td align="center">
                                                        <Text size="xs">{item.quantity}</Text>
                                                    </Table.Td>
                                                    <Table.Td align="right">
                                                        <Text size="xs" fw={600}>
                                                            R${' '}
                                                            {item.totalAmount.toLocaleString('pt-BR', {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })}
                                                        </Text>
                                                    </Table.Td>
                                                    <Table.Td align="right">
                                                        <Text size="xs" c="teal.9">
                                                            R${' '}
                                                            {item.amountPaid.toLocaleString('pt-BR', {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })}
                                                        </Text>
                                                    </Table.Td>
                                                    <Table.Td align="right">
                                                        <Text
                                                            size="xs"
                                                            c={item.remainingAmount > 0 ? 'red.9' : 'gray.6'}
                                                            fw={item.remainingAmount > 0 ? 700 : 400}
                                                        >
                                                            R${' '}
                                                            {item.remainingAmount.toLocaleString('pt-BR', {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })}
                                                        </Text>
                                                    </Table.Td>
                                                    <Table.Td align="center">
                                                        <Badge
                                                            color={item.remainingAmount === 0 ? 'teal' : 'orange'}
                                                            size="xs"
                                                        >
                                                            {item.statusDescription}
                                                        </Badge>
                                                    </Table.Td>
                                                    <Table.Td align="center">
                                                        {item.remainingAmount > 0 ? (
                                                            <Button
                                                                size="xs"
                                                                color="orange"
                                                                variant="light"
                                                                leftSection={<DollarSign size={14} />}
                                                                onClick={() => handleOpenPaymentModal(item)}
                                                            >
                                                                Abater
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="xs"
                                                                color="blue"
                                                                variant="subtle"
                                                                leftSection={<History size={14} />}
                                                                onClick={() => handleOpenPaymentModal(item)}
                                                            >
                                                                Ver Histórico
                                                            </Button>
                                                        )}
                                                    </Table.Td>
                                                </Table.Tr>
                                            ))
                                        ) : (
                                            <Table.Tr>
                                                <Table.Td colSpan={8} align="center" py="md">
                                                    <Text size="xs" c="dimmed">
                                                        Nenhuma compra registrada para este cliente.
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
