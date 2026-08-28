import { useState } from 'react';
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
} from '@mantine/core';
import { DollarSign, CheckCircle2, Clock, History, Copy, Check } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { CustomerPurchaseItem } from '../services/customerService';

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
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [copied, setCopied] = useState(false);

    const queryClient = useQueryClient();

    if (!item) return null;

    const handleAddSalePayment = async () => {
        if (!amount || Number(amount) <= 0) return;
        try {
            setLoading(true);
            setErrorMsg('');
            setSuccessMsg('');

            const val = Number(amount);
            await api.post(`/sales/${item.saleId}/payments`, { amount: val });

            setAmount('');
            setSuccessMsg(
                `Abatimento de R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} registrado para ${item.productName}!`
            );

            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['reports'] });

            onPaymentSuccess();
        } catch (err: any) {
            setErrorMsg(
                err?.response?.data?.message || 'Erro ao registrar abatimento de pagamento.'
            );
        } finally {
            setLoading(false);
        }
    };

    const generateProductWhatsappText = (): string => {
        if (!item) return '';

        const formattedTotal = item.totalAmount.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        const formattedPaid = item.amountPaid.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        const formattedRemaining = item.remainingAmount.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        const saleDateStr = item.saleDate
            ? new Date(item.saleDate).toLocaleDateString('pt-BR')
            : '';

        const greeting = customerName ? `Olá, *${customerName}*! 👋\n\n` : `Olá! 👋\n\n`;

        let text = greeting;
        text += `Segue o resumo do pagamento do produto *${item.productName}* na Natura Nice:\n\n`;
        text += `📦 *Detalhes da Compra:*\n`;
        text += `• Produto: *${item.productName}* (x${item.quantity})\n`;
        text += `• Data da Compra: ${saleDateStr}\n`;
        text += `• Valor Total do Produto: R$ ${formattedTotal}\n`;
        text += `• Valor Já Pago: R$ ${formattedPaid}\n`;

        if (item.remainingAmount > 0) {
            text += `• *Valor Restante A Pagar: R$ ${formattedRemaining}*\n\n`;
        } else {
            text += `• *Situação: Produto Totalmente Quitado!* 🎉\n\n`;
        }

        if (item.payments && item.payments.length > 0) {
            text += `💳 *Histórico de Abatimentos:*\n`;
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

                text += `• Parcela ${item.payments!.length - idx} (${pDateStr}): Abatido R$ ${pAmount} | *A Pagar R$ ${pRem}*\n`;
            });
            text += `\n`;
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
                        {isFullyPaid ? `Histórico de Pagamento - ${item.productName}` : `Abater Pagamento - ${item.productName}`}
                    </Text>
                </Group>
            }
            centered
            size="900px"
            radius="md"
        >
            <Stack gap="md">
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
                            Digite o Valor para Abater:
                        </Text>
                        <Group align="flex-end" gap="xs">
                            <NumberInput
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
                                    setAmount(val === '' ? '' : Number(val));
                                    setErrorMsg('');
                                }}
                                style={{ flex: 1 }}
                                size="sm"
                            />
                            <Button
                                color="orange"
                                size="sm"
                                leftSection={<DollarSign size={16} />}
                                loading={loading}
                                disabled={!amount || Number(amount) <= 0}
                                onClick={handleAddSalePayment}
                            >
                                Abater Pagamento
                            </Button>
                        </Group>
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
                                Copie a mensagem formatada deste produto específico para enviar ao cliente.
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
                            Texto do produto copiado para a área de transferência com sucesso!
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

                <Table.ScrollContainer minWidth={450}>
                    <Table striped highlightOnHover verticalSpacing="xs">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Data do Pagamento</Table.Th>
                                <Table.Th style={{ textAlign: 'right' }}>Valor Pago</Table.Th>
                                <Table.Th style={{ textAlign: 'right' }}>Total Acumulado</Table.Th>
                                <Table.Th style={{ textAlign: 'right' }}>A Pagar</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {item.payments && item.payments.length > 0 ? (
                                item.payments.map((p, idx) => (
                                    <Table.Tr key={p.id || idx}>
                                        <Table.Td>
                                            <Text size="xs">
                                                {p.paymentDate
                                                    ? new Date(p.paymentDate).toLocaleDateString('pt-BR') +
                                                      ' ' +
                                                      new Date(p.paymentDate).toLocaleTimeString('pt-BR', {
                                                          hour: '2-digit',
                                                          minute: '2-digit',
                                                      })
                                                    : '-'}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td align="right">
                                            <Text size="xs" fw={700} c="teal.9">
                                                R${' '}
                                                {p.amount.toLocaleString('pt-BR', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td align="right">
                                            <Text size="xs" c="blue.8">
                                                R${' '}
                                                {p.cumulativePaid.toLocaleString('pt-BR', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td align="right">
                                            <Text
                                                size="xs"
                                                c={p.remainingToPay > 0 ? 'red.9' : 'teal.9'}
                                                fw={p.remainingToPay > 0 ? 700 : 400}
                                            >
                                                R${' '}
                                                {p.remainingToPay.toLocaleString('pt-BR', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </Text>
                                        </Table.Td>
                                    </Table.Tr>
                                ))
                            ) : (
                                <Table.Tr>
                                    <Table.Td colSpan={4} align="center" py="md">
                                        <Text size="xs" c="dimmed">
                                            Nenhum histórico de parcela registrado para este produto.
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
