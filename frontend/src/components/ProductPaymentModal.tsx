import { useState, useEffect } from 'react';
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
    NumberInput,
    Alert,
    Select,
} from '@mantine/core';
import {
    DollarSign,
    CheckCircle2,
    History,
    Copy,
    Check,
    MessageSquare,
    CreditCard,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import {
    type CustomerPurchaseItem,
    type PaymentMethod,
    PAYMENT_METHOD_OPTIONS,
    PAYMENT_METHOD_LABELS,
} from '../services/customerService';
import {
    formatDateDisplay,
    formatDateTimeDisplay,
} from '../utils/expirationUtils';
import {
    cleanProductNameForWhatsapp,
    cleanCustomerNameForWhatsapp,
} from '../utils/stringUtils';

interface ProductPaymentModalProps {
    opened: boolean;
    onClose: () => void;
    item: CustomerPurchaseItem | null;
    customerName?: string;
    onPaymentSuccess: () => void;
}

export function ProductPaymentModal({
    opened,
    onClose,
    item,
    customerName,
    onPaymentSuccess,
}: ProductPaymentModalProps) {
    const [amount, setAmount] = useState<number | ''>('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
        null
    );
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [copied, setCopied] = useState(false);

    const queryClient = useQueryClient();

    useEffect(() => {
        if (opened) {
            setAmount('');
            setPaymentMethod(null);
            setErrorMsg('');
            setSuccessMsg('');
            setCopied(false);
        }
    }, [opened, item?.saleId]);

    if (!item) return null;

    const handleAddSalePayment = async () => {
        if (!amount || Number(amount) <= 0) return;
        if (!paymentMethod) {
            setErrorMsg('Selecione a forma de pagamento.');
            return;
        }
        try {
            setLoading(true);
            setErrorMsg('');
            setSuccessMsg('');

            const val = Number(amount);
            await api.post(`/sales/${item.saleId}/payments`, {
                amount: val,
                paymentMethod,
            });

            setAmount('');
            setPaymentMethod(null);
            setSuccessMsg(
                `Abatimento de R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${PAYMENT_METHOD_LABELS[paymentMethod]}) registrado para ${item.productName}!`
            );
            setTimeout(() => {
                setSuccessMsg('');
            }, 4000);

            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['reports'] });

            onPaymentSuccess();
        } catch (err: any) {
            setErrorMsg(
                err?.response?.data?.message ||
                    'Erro ao registrar abatimento de pagamento.'
            );
        } finally {
            setLoading(false);
        }
    };

    const generateProductWhatsappText = (): string => {
        if (!item) return '';

        const cleanCustName = customerName
            ? cleanCustomerNameForWhatsapp(customerName)
            : '';
        const greeting = cleanCustName
            ? `Olá, *${cleanCustName}*!\n\n`
            : `Olá!\n\n`;

        let text = greeting;
        text += `🛍️ Segue resumo das suas compras:\n\n`;

        const saleDateStr = formatDateDisplay(item.saleDate);
        text += `*${saleDateStr}*\n`;

        if (item.products && item.products.length > 0) {
            item.products.forEach((p) => {
                const cleanName = cleanProductNameForWhatsapp(p.productName);
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
        } else if (item.productName.includes('\n')) {
            item.productName.split('\n').forEach((line) => {
                const cleanLine = cleanProductNameForWhatsapp(line);
                text += `° ${cleanLine}\n`;
            });
        } else {
            const cleanName = cleanProductNameForWhatsapp(item.productName);
            const prodLabel =
                item.quantity > 1
                    ? `${cleanName} (${item.quantity} un.)`
                    : cleanName;
            const prodPrice = (
                item.grossAmount || item.totalAmount + (item.discount || 0)
            ).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
            text += `° ${prodLabel} - R$ ${prodPrice}\n`;
        }
        text += `\n`;

        const grossTotal =
            item.grossAmount || item.totalAmount + (item.discount || 0);
        const formattedGross = grossTotal.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        const discountVal = item.discount || 0;
        const formattedDiscount = discountVal.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        text += `*Total comprado: R$ ${formattedGross}*\n\n`;
        text += `*Desconto: R$ ${formattedDiscount}*\n\n`;

        if (item.payments && item.payments.length > 0) {
            text += `💵 *Histórico de Pagamentos*\n`;
            const sortedPayments = item.payments.slice().sort((a, b) => {
                const dateA = new Date(a.paymentDate).getTime();
                const dateB = new Date(b.paymentDate).getTime();
                return dateA - dateB;
            });
            sortedPayments.forEach((p) => {
                const pDateStr = formatDateDisplay(p.paymentDate);
                const pAmountStr = p.amount.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });
                const methodStr =
                    p.paymentMethodDescription ||
                    (p.paymentMethod
                        ? PAYMENT_METHOD_LABELS[p.paymentMethod]
                        : '');
                text += `° ${pDateStr} - R$ ${pAmountStr}${methodStr ? ` - ${methodStr}` : ''}\n`;
            });
            text += `\n`;
        }

        const formattedRemaining = item.remainingAmount.toLocaleString(
            'pt-BR',
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );

        if (item.remainingAmount > 0) {
            text += `*Saldo a pagar: R$ ${formattedRemaining}*\n\n`;
        } else {
            text += `*Saldo a pagar: R$ 0,00 (Conta Quitada!)* 🎉\n\n`;
        }

        text += `Qualquer dúvida estou à disposição! 😊`;
        return text;
    };

    const handleCopyWhatsappText = async () => {
        const text = generateProductWhatsappText();
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch (err) {
            console.error('Erro ao copiar para área de transferência:', err);
        }
    };

    const isFullyPaid = item.remainingAmount <= 0;

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Group gap="xs">
                    <DollarSign size={22} color="#1c7ed6" />
                    <Text fw={700} size="lg">
                        {item.productName.includes('\n')
                            ? isFullyPaid
                                ? 'Histórico de Pagamento'
                                : 'Abater Pagamento'
                            : isFullyPaid
                              ? `Histórico de Pagamento - ${item.productName}`
                              : `Abater Pagamento - ${item.productName}`}
                    </Text>
                    {item.isPersonalUse ? (
                        <Badge color="teal" variant="light" size="sm">
                            Uso Pessoal
                        </Badge>
                    ) : (
                        <Badge
                            color={
                                item.status === 'PAID' ||
                                item.remainingAmount === 0
                                    ? 'teal'
                                    : item.status === 'UNPAID' ||
                                        item.amountPaid === 0
                                      ? 'red'
                                      : 'orange'
                            }
                            variant="light"
                            size="sm"
                        >
                            {item.statusDescription}
                        </Badge>
                    )}
                </Group>
            }
            centered
            size="900px"
            radius="md"
        >
            <Stack gap="md">
                {item.productName.includes('\n') && (
                    <Paper p="xs" withBorder radius="md" bg="blue.0">
                        <Text size="xs" fw={700} c="blue.9" mb={2}>
                            Produtos desta Venda:
                        </Text>
                        <Text
                            size="xs"
                            fw={600}
                            style={{ whiteSpace: 'pre-line' }}
                        >
                            {item.productName}
                        </Text>
                    </Paper>
                )}

                {item.observation && (
                    <Paper p="xs" withBorder radius="md" bg="yellow.0">
                        <Group gap="xs" align="flex-start" wrap="nowrap">
                            <MessageSquare
                                size={16}
                                color="#d97706"
                                style={{ marginTop: 2, flexShrink: 0 }}
                            />
                            <div>
                                <Text size="xs" fw={700} c="yellow.9">
                                    Observação:
                                </Text>
                                <Text size="xs" c="gray.8">
                                    {item.observation}
                                </Text>
                            </div>
                        </Group>
                    </Paper>
                )}

                {/* Summary Cards */}
                <Grid>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Paper p="xs" withBorder radius="md" bg="gray.0">
                            <Text size="xs" c="dimmed" fw={600}>
                                Valor Total
                            </Text>
                            <Text fw={800} size="sm" c="gray.8" mt={2}>
                                R${' '}
                                {item.totalAmount.toLocaleString('pt-BR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </Text>
                        </Paper>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Paper p="xs" withBorder radius="md" bg="teal.0">
                            <Text size="xs" c="teal.9" fw={700}>
                                Valor Já Pago
                            </Text>
                            <Text fw={800} size="sm" c="teal.9" mt={2}>
                                R${' '}
                                {item.amountPaid.toLocaleString('pt-BR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </Text>
                        </Paper>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Paper
                            p="xs"
                            withBorder
                            radius="md"
                            bg={isFullyPaid ? 'teal.0' : 'red.0'}
                        >
                            <Text
                                size="xs"
                                c={isFullyPaid ? 'teal.9' : 'red.9'}
                                fw={700}
                            >
                                {isFullyPaid ? 'Conta Quitada' : 'A Pagar'}
                            </Text>
                            <Text
                                fw={800}
                                size="sm"
                                c={isFullyPaid ? 'teal.9' : 'red.9'}
                                mt={2}
                            >
                                R${' '}
                                {item.remainingAmount.toLocaleString('pt-BR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </Text>
                        </Paper>
                    </Grid.Col>
                </Grid>

                {/* Abatimento Input Section (Hidden if fully paid) */}
                {!isFullyPaid && (
                    <Paper p="sm" withBorder radius="md" bg="orange.0">
                        <Text fw={700} size="sm" c="orange.9" mb="xs">
                            Digite os Dados para Abater Pagamento:
                        </Text>
                        <Grid align="flex-end">
                            <Grid.Col span={{ base: 12, sm: 4.5 }}>
                                <NumberInput
                                    label="Valor a Abater"
                                    placeholder="R$ 0,00"
                                    prefix="R$ "
                                    decimalScale={2}
                                    decimalSeparator=","
                                    thousandSeparator="."
                                    selectAllOnFocus
                                    min={0.01}
                                    max={item.remainingAmount}
                                    value={amount}
                                    onChange={(val) => {
                                        setAmount(
                                            val === '' ? '' : Number(val)
                                        );
                                        setErrorMsg('');
                                        setSuccessMsg('');
                                    }}
                                    size="sm"
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 4.5 }}>
                                <Select
                                    label="Forma de Pagamento"
                                    placeholder="Selecione..."
                                    data={PAYMENT_METHOD_OPTIONS}
                                    value={paymentMethod}
                                    onChange={(val) => {
                                        setPaymentMethod(val as PaymentMethod);
                                        setErrorMsg('');
                                        setSuccessMsg('');
                                    }}
                                    leftSection={<CreditCard size={16} />}
                                    size="sm"
                                    allowDeselect={false}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 3 }}>
                                <Button
                                    color="orange"
                                    size="sm"
                                    fullWidth
                                    leftSection={<DollarSign size={16} />}
                                    loading={loading}
                                    disabled={
                                        !amount ||
                                        Number(amount) <= 0 ||
                                        !paymentMethod
                                    }
                                    onClick={handleAddSalePayment}
                                >
                                    Abater
                                </Button>
                            </Grid.Col>
                        </Grid>
                        {errorMsg && (
                            <Text size="xs" c="red" mt={4}>
                                {errorMsg}
                            </Text>
                        )}
                        {successMsg && (
                            <Text size="xs" c="teal.8" mt={4} fw={600}>
                                {successMsg}
                            </Text>
                        )}
                    </Paper>
                )}

                {/* WhatsApp Text Preview & Copy Button for Product */}
                <Paper p="sm" withBorder radius="md" bg="blue.0">
                    <Group justify="space-between" align="center">
                        <div>
                            <Text fw={700} size="sm" c="blue.9">
                                Texto do Produto para WhatsApp
                            </Text>
                            <Text size="xs" c="dimmed">
                                Copie a mensagem formatada deste produto
                                específico para enviar ao cliente.
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
                            Texto do produto copiado para a área de
                            transferência com sucesso!
                        </Alert>
                    )}
                </Paper>

                {/* Histórico de Abatimentos do Produto */}
                <Group gap="xs" mt="xs">
                    <History size={18} color="#1c7ed6" />
                    <Text fw={700} size="sm">
                        Histórico de Abatimentos deste Produto:
                    </Text>
                </Group>

                <Table.ScrollContainer minWidth={550}>
                    <Table striped highlightOnHover verticalSpacing="xs">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Data do Pagamento</Table.Th>
                                <Table.Th>Forma de Pagamento</Table.Th>
                                <Table.Th style={{ textAlign: 'right' }}>
                                    Valor Pago
                                </Table.Th>
                                <Table.Th style={{ textAlign: 'right' }}>
                                    Total Acumulado
                                </Table.Th>
                                <Table.Th style={{ textAlign: 'right' }}>
                                    A Pagar
                                </Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {item.payments && item.payments.length > 0 ? (
                                item.payments.map((p, idx) => (
                                    <Table.Tr key={p.id || idx}>
                                        <Table.Td>
                                            <Text size="xs">
                                                {formatDateTimeDisplay(
                                                    p.paymentDate
                                                ) || '-'}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge
                                                size="xs"
                                                variant="light"
                                                color={
                                                    p.paymentMethod === 'PIX'
                                                        ? 'teal'
                                                        : p.paymentMethod ===
                                                            'CARD'
                                                          ? 'blue'
                                                          : 'gray'
                                                }
                                            >
                                                {p.paymentMethodDescription ||
                                                    (p.paymentMethod
                                                        ? PAYMENT_METHOD_LABELS[
                                                              p.paymentMethod
                                                          ]
                                                        : '-')}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td align="right">
                                            <Text size="xs" fw={700} c="teal.9">
                                                R${' '}
                                                {p.amount.toLocaleString(
                                                    'pt-BR',
                                                    {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    }
                                                )}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td align="right">
                                            <Text size="xs" c="blue.8">
                                                R${' '}
                                                {p.cumulativePaid.toLocaleString(
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
                                                    p.remainingToPay > 0
                                                        ? 'red.9'
                                                        : 'teal.9'
                                                }
                                                fw={
                                                    p.remainingToPay > 0
                                                        ? 700
                                                        : 400
                                                }
                                            >
                                                R${' '}
                                                {p.remainingToPay.toLocaleString(
                                                    'pt-BR',
                                                    {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    }
                                                )}
                                            </Text>
                                        </Table.Td>
                                    </Table.Tr>
                                ))
                            ) : (
                                <Table.Tr>
                                    <Table.Td
                                        colSpan={5}
                                        align="center"
                                        py="md"
                                    >
                                        <Text size="xs" c="dimmed">
                                            Nenhum histórico de parcela
                                            registrado para este produto.
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>
                            )}
                        </Table.Tbody>
                    </Table>
                </Table.ScrollContainer>

                <Group justify="flex-end" mt="sm">
                    <Button variant="default" onClick={onClose}>
                        Fechar
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
