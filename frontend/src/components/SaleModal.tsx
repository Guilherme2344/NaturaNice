import { useState, useEffect, useMemo } from 'react';
import {
    Modal,
    Button,
    Group,
    NumberInput,
    Text,
    Stack,
    Paper,
    Badge,
    Grid,
    Divider,
    Autocomplete,
    Checkbox,
    Textarea,
    Select,
    ScrollArea,
} from '@mantine/core';
import {
    DollarSign,
    TrendingUp,
    Package,
    User,
    Wallet,
    Boxes,
    ShoppingCart,
    CreditCard,
} from 'lucide-react';
import type { Product } from './ProductsTable';
import {
    customerService,
    type Customer,
    type PaymentMethod,
    PAYMENT_METHOD_OPTIONS,
} from '../services/customerService';
import { accentInsensitiveFilter } from '../utils/stringUtils';
import type { CreateSaleDTO } from '../services/saleService';

interface SaleModalProps {
    opened: boolean;
    onClose: () => void;
    product?: Product | null;
    products?: Product[] | null;
    onConfirmSale: (data: CreateSaleDTO) => Promise<void>;
}

interface SaleItemState {
    productId: string;
    product: Product;
    batchId: string | null;
    quantity: number;
    sellingPrice: number;
}

const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Indeterminada';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

export function SaleModal({
    opened,
    onClose,
    product,
    products,
    onConfirmSale,
}: SaleModalProps) {
    // Normalize target products array
    const targetProducts = useMemo(() => {
        if (products && products.length > 0) return products;
        if (product) return [product];
        return [];
    }, [product, products]);

    const [itemsState, setItemsState] = useState<SaleItemState[]>([]);
    const [amountPaid, setAmountPaid] = useState<number | string>(0);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
    const [customerName, setCustomerName] = useState<string>('');
    const [observation, setObservation] = useState<string>('');
    const [isPersonalUse, setIsPersonalUse] = useState<boolean>(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (opened) {
            setErrors({});
            setPaymentMethod(null);
            customerService
                .getAll()
                .then((data) => setCustomers(data))
                .catch((err) => console.error('Erro ao buscar clientes:', err));
        }
    }, [opened]);

    // Initialize item states when products change
    useEffect(() => {
        if (targetProducts.length > 0) {
            const initialItems: SaleItemState[] = targetProducts.map((p) => {
                const sortedBatches = (p.batches || []).slice().sort((a, b) => {
                    if (!a.expirationDate && !b.expirationDate) return 0;
                    if (!a.expirationDate) return 1;
                    if (!b.expirationDate) return -1;
                    return a.expirationDate.localeCompare(b.expirationDate);
                });
                const firstBatch = sortedBatches[0];
                const initialPrice = firstBatch
                    ? firstBatch.sellingPrice
                    : p.sellingPrice || 0;
                const initialQty = (p.quantity || 0) > 0 ? 1 : 0;
                return {
                    productId: p.id,
                    product: p,
                    batchId: firstBatch ? firstBatch.id : null,
                    quantity: initialQty,
                    sellingPrice: initialPrice,
                };
            });

            setItemsState(initialItems);
            setCustomerName('');
            setObservation('');
            setIsPersonalUse(false);
            setPaymentMethod(null);

            const initialTotal = initialItems.reduce(
                (sum, it) => sum + it.quantity * it.sellingPrice,
                0
            );
            setAmountPaid(initialTotal);
        }
    }, [targetProducts, opened]);

    if (!opened || targetProducts.length === 0) return null;

    const isSingleProduct = targetProducts.length === 1;

    // Financial calculations across all items
    let totalSaleAmount = 0;
    let totalEstimatedProfit = 0;

    const computedItems = itemsState.map((item) => {
        const sortedBatches = (item.product.batches || [])
            .slice()
            .sort((a, b) => {
                if (!a.expirationDate && !b.expirationDate) return 0;
                if (!a.expirationDate) return 1;
                if (!b.expirationDate) return -1;
                return a.expirationDate.localeCompare(b.expirationDate);
            });

        const selectedBatch = sortedBatches.find((b) => b.id === item.batchId);
        const availableStock = selectedBatch
            ? selectedBatch.quantity
            : item.product.quantity || 0;

        const currentSellingPrice = isPersonalUse ? 0 : item.sellingPrice || 0;
        const rawPurchasePrice = selectedBatch
            ? selectedBatch.purchasePrice
            : item.product.purchasePrice || 0;

        const effectivePurchasePrice = isPersonalUse
            ? 0
            : rawPurchasePrice > 0
              ? rawPurchasePrice
              : Number((currentSellingPrice * 0.7).toFixed(2));

        const itemTotal = (item.quantity || 0) * currentSellingPrice;
        const itemProfit = isPersonalUse
            ? 0
            : (item.quantity || 0) *
              (currentSellingPrice - effectivePurchasePrice);

        totalSaleAmount += itemTotal;
        totalEstimatedProfit += itemProfit;

        return {
            ...item,
            sortedBatches,
            selectedBatch,
            availableStock,
            currentSellingPrice,
            effectivePurchasePrice,
            itemTotal,
            itemProfit,
        };
    });

    const currentAmountPaid = isPersonalUse ? 0 : Number(amountPaid) || 0;
    const remainingBalance = isPersonalUse
        ? 0
        : Math.max(0, totalSaleAmount - currentAmountPaid);

    // Helpers to update individual items
    const handleUpdateItem = (
        productId: string,
        updates: Partial<SaleItemState>
    ) => {
        setItemsState((prev) => {
            const next = prev.map((it) => {
                if (it.productId !== productId) return it;
                return { ...it, ...updates };
            });

            if (!isPersonalUse) {
                const newTotal = next.reduce(
                    (sum, it) => sum + it.quantity * it.sellingPrice,
                    0
                );
                setAmountPaid(newTotal);
            }
            return next;
        });
    };

    const handleTogglePersonalUse = (checked: boolean) => {
        setIsPersonalUse(checked);
        if (checked) {
            setAmountPaid(0);
        } else {
            const recomputedTotal = itemsState.reduce(
                (sum, it) => sum + it.quantity * it.sellingPrice,
                0
            );
            setAmountPaid(recomputedTotal);
        }
    };

    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors((prev) => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    };

    // Form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};

        // Validation for each item
        computedItems.forEach((it, idx) => {
            if (it.quantity < 1) {
                newErrors[`item_${idx}_quantity`] =
                    'Quantidade mínima de 1 un.';
            } else if (it.quantity > it.availableStock) {
                newErrors[`item_${idx}_quantity`] =
                    `Estoque insuficiente (${it.availableStock} un.).`;
            }

            if (!isPersonalUse && it.sellingPrice <= 0) {
                newErrors[`item_${idx}_sellingPrice`] =
                    'Preço deve ser > R$ 0,00.';
            }
        });

        if (observation.length > 250) {
            newErrors['observation'] =
                'A observação deve ter no máximo 250 caracteres.';
        }

        if (
            !isPersonalUse &&
            Number(amountPaid) === totalSaleAmount &&
            totalSaleAmount > 0 &&
            !paymentMethod
        ) {
            newErrors['paymentMethod'] = 'Selecione o método de pagamento.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setLoading(true);
            const saleDTO: CreateSaleDTO = {
                items: computedItems.map((it) => ({
                    productId: it.productId,
                    batchId: it.batchId || undefined,
                    quantity: it.quantity,
                    sellingPrice: isPersonalUse ? 0 : it.sellingPrice,
                })),
                amountPaid: currentAmountPaid,
                customerName: customerName.trim() || undefined,
                observation: observation.trim() || undefined,
                isPersonalUse,
                paymentMethod:
                    !isPersonalUse &&
                    Number(amountPaid) === totalSaleAmount &&
                    totalSaleAmount > 0 &&
                    paymentMethod
                        ? paymentMethod
                        : undefined,
            };

            await onConfirmSale(saleDTO);
            onClose();
        } catch (error) {
            console.error('Erro ao registrar venda:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Group gap="xs">
                    <DollarSign size={22} color="#12b886" />
                    <Text fw={700} size="lg">
                        {isSingleProduct
                            ? 'Efetivar Venda de Produto'
                            : `Efetivar Venda (${targetProducts.length} Produtos)`}
                    </Text>
                </Group>
            }
            centered
            size={isSingleProduct ? 'lg' : '950px'}
            radius="md"
        >
            <form onSubmit={handleSubmit} noValidate>
                <Stack gap="md">
                    {/* Item list */}
                    {isSingleProduct ? (
                        /* Single product detailed card */
                        (() => {
                            const it = computedItems[0];
                            if (!it) return null;
                            return (
                                <Stack gap="md">
                                    <Paper
                                        p="sm"
                                        withBorder
                                        radius="md"
                                        bg="gray.0"
                                    >
                                        <Group
                                            justify="space-between"
                                            align="center"
                                        >
                                            <div>
                                                <Text fw={700} size="md">
                                                    {it.product.name}
                                                </Text>
                                                <Group gap="xs" mt={4}>
                                                    <Badge
                                                        variant="light"
                                                        color="blue"
                                                        size="sm"
                                                    >
                                                        {it.product.brand
                                                            ?.name ||
                                                            'Sem Marca'}
                                                    </Badge>
                                                    <Badge
                                                        variant="light"
                                                        color="gray"
                                                        size="sm"
                                                    >
                                                        {it.product.category
                                                            ?.name ||
                                                            'Sem Categoria'}
                                                    </Badge>
                                                    {it.product.family
                                                        ?.name && (
                                                        <Badge
                                                            variant="outline"
                                                            color="gray"
                                                            size="sm"
                                                        >
                                                            {
                                                                it.product
                                                                    .family.name
                                                            }
                                                        </Badge>
                                                    )}
                                                </Group>
                                            </div>
                                            <Group gap={4} align="center">
                                                <Package
                                                    size={16}
                                                    color="#868e96"
                                                />
                                                <Text
                                                    size="sm"
                                                    fw={600}
                                                    c={
                                                        it.availableStock > 0
                                                            ? 'teal'
                                                            : 'red'
                                                    }
                                                >
                                                    Estoque: {it.availableStock}{' '}
                                                    un. (Total:{' '}
                                                    {it.product.quantity} un.)
                                                </Text>
                                            </Group>
                                        </Group>
                                    </Paper>

                                    {/* Seleção do Lote */}
                                    {it.sortedBatches.length > 0 && (
                                        <Select
                                            label="Escolha o Lote para Venda"
                                            description="Ordenados do vencimento mais próximo para o mais distante"
                                            leftSection={
                                                <Boxes
                                                    size={16}
                                                    color="#1c7ed6"
                                                />
                                            }
                                            data={it.sortedBatches.map(
                                                (batch, index) => ({
                                                    value: batch.id,
                                                    label: `Lote ${index + 1} | Venc: ${formatDate(
                                                        batch.expirationDate
                                                    )} (Qtd: ${batch.quantity})`,
                                                })
                                            )}
                                            value={it.batchId}
                                            onChange={(val) => {
                                                const batch =
                                                    it.sortedBatches.find(
                                                        (b) => b.id === val
                                                    );
                                                const newPrice = isPersonalUse
                                                    ? 0
                                                    : batch
                                                      ? batch.sellingPrice
                                                      : it.product
                                                            .sellingPrice || 0;
                                                const newQty = batch
                                                    ? Math.min(
                                                          it.quantity || 1,
                                                          batch.quantity
                                                      )
                                                    : it.quantity;
                                                handleUpdateItem(it.productId, {
                                                    batchId: val,
                                                    sellingPrice: newPrice,
                                                    quantity: newQty,
                                                });
                                            }}
                                        />
                                    )}

                                    <Grid>
                                        <Grid.Col span={{ base: 12, sm: 6 }}>
                                            <NumberInput
                                                label="Quantidade Vendida"
                                                placeholder="Informe a quantidade"
                                                value={it.quantity}
                                                error={
                                                    errors[`item_0_quantity`]
                                                }
                                                onChange={(val) => {
                                                    handleUpdateItem(
                                                        it.productId,
                                                        {
                                                            quantity:
                                                                Number(val) ||
                                                                0,
                                                        }
                                                    );
                                                    clearError(
                                                        'item_0_quantity'
                                                    );
                                                }}
                                                min={1}
                                                max={it.availableStock}
                                                required
                                                allowNegative={false}
                                                allowDecimal={false}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 12, sm: 6 }}>
                                            <NumberInput
                                                label="Preço de Venda Unitário"
                                                placeholder="0,00"
                                                value={it.sellingPrice}
                                                error={
                                                    errors[
                                                        `item_0_sellingPrice`
                                                    ]
                                                }
                                                disabled={isPersonalUse}
                                                onChange={(val) => {
                                                    handleUpdateItem(
                                                        it.productId,
                                                        {
                                                            sellingPrice:
                                                                Number(val) ||
                                                                0,
                                                        }
                                                    );
                                                    clearError(
                                                        'item_0_sellingPrice'
                                                    );
                                                }}
                                                prefix="R$ "
                                                decimalScale={2}
                                                decimalSeparator=","
                                                thousandSeparator="."
                                                selectAllOnFocus
                                                required={!isPersonalUse}
                                                min={0}
                                            />
                                        </Grid.Col>
                                    </Grid>
                                </Stack>
                            );
                        })()
                    ) : (
                        /* Multi-product list */
                        <Stack gap="xs">
                            <Group justify="space-between" align="center">
                                <Group gap={6}>
                                    <ShoppingCart size={18} color="#1c7ed6" />
                                    <Text fw={700} size="sm">
                                        Itens Selecionados para Venda (
                                        {computedItems.length})
                                    </Text>
                                </Group>
                            </Group>

                            <ScrollArea.Autosize
                                mah={320}
                                type="always"
                                offsetScrollbars
                            >
                                <Stack gap="xs">
                                    {computedItems.map((it, idx) => {
                                        const hasMultipleBatches =
                                            it.sortedBatches.length > 1;
                                        return (
                                            <Paper
                                                key={it.productId}
                                                p="xs"
                                                withBorder
                                                radius="md"
                                                bg="gray.0"
                                            >
                                                <Grid align="center">
                                                    {/* Product info */}
                                                    <Grid.Col
                                                        span={{
                                                            base: 12,
                                                            md: hasMultipleBatches
                                                                ? 4.8
                                                                : 6.4,
                                                        }}
                                                    >
                                                        <Text
                                                            fw={600}
                                                            size="sm"
                                                            title={it.product.name}
                                                        >
                                                            {it.product.name}
                                                        </Text>
                                                        <Group gap={6} mt={2}>
                                                            <Badge
                                                                size="xs"
                                                                color="blue"
                                                                variant="light"
                                                            >
                                                                {it.product.brand?.name ||
                                                                    'Sem Marca'}
                                                            </Badge>
                                                            <Text
                                                                size="xs"
                                                                c={
                                                                    it.availableStock > 0
                                                                        ? 'dimmed'
                                                                        : 'red'
                                                                }
                                                            >
                                                                Estoque: {it.availableStock} un.
                                                            </Text>
                                                        </Group>
                                                    </Grid.Col>

                                                    {/* Batch selector (if multiple) */}
                                                    {hasMultipleBatches && (
                                                        <Grid.Col
                                                            span={{
                                                                base: 12,
                                                                sm: 4,
                                                                md: 2.6,
                                                            }}
                                                        >
                                                            <Select
                                                                size="xs"
                                                                label="Lote"
                                                                placeholder="Escolha o Lote"
                                                                data={it.sortedBatches.map(
                                                                    (batch, bIdx) => ({
                                                                        value: batch.id,
                                                                        label: `Lote ${bIdx + 1} (${batch.quantity} un.)`,
                                                                    })
                                                                )}
                                                                value={it.batchId}
                                                                onChange={(val) => {
                                                                    const batch =
                                                                        it.sortedBatches.find(
                                                                            (b) => b.id === val
                                                                        );
                                                                    handleUpdateItem(
                                                                        it.productId,
                                                                        {
                                                                            batchId: val,
                                                                            sellingPrice:
                                                                                isPersonalUse
                                                                                    ? 0
                                                                                    : batch?.sellingPrice ||
                                                                                      it.product
                                                                                          .sellingPrice ||
                                                                                      0,
                                                                            quantity:
                                                                                batch
                                                                                    ? Math.min(
                                                                                          it.quantity,
                                                                                          batch.quantity
                                                                                      )
                                                                                    : it.quantity,
                                                                        }
                                                                    );
                                                                }}
                                                            />
                                                        </Grid.Col>
                                                    )}

                                                    {/* Quantity */}
                                                    <Grid.Col
                                                        span={{
                                                            base: 6,
                                                            sm: hasMultipleBatches ? 4 : 6,
                                                            md: hasMultipleBatches
                                                                ? 1.8
                                                                : 2.3,
                                                        }}
                                                    >
                                                        <NumberInput
                                                            size="xs"
                                                            label="Qtd"
                                                            value={it.quantity}
                                                            error={
                                                                errors[
                                                                    `item_${idx}_quantity`
                                                                ]
                                                            }
                                                            onChange={(val) => {
                                                                handleUpdateItem(
                                                                    it.productId,
                                                                    {
                                                                        quantity:
                                                                            Number(
                                                                                val
                                                                            ) || 0,
                                                                    }
                                                                );
                                                                clearError(
                                                                    `item_${idx}_quantity`
                                                                );
                                                            }}
                                                            min={1}
                                                            max={it.availableStock}
                                                            allowNegative={false}
                                                            allowDecimal={false}
                                                        />
                                                    </Grid.Col>

                                                    {/* Unit Price */}
                                                    <Grid.Col
                                                        span={{
                                                            base: 6,
                                                            sm: hasMultipleBatches ? 4 : 6,
                                                            md: hasMultipleBatches
                                                                ? 2.8
                                                                : 3.3,
                                                        }}
                                                    >
                                                        <NumberInput
                                                            size="xs"
                                                            label="Preço Unit."
                                                            value={it.sellingPrice}
                                                            disabled={isPersonalUse}
                                                            error={
                                                                errors[
                                                                    `item_${idx}_sellingPrice`
                                                                ]
                                                            }
                                                            onChange={(val) => {
                                                                handleUpdateItem(
                                                                    it.productId,
                                                                    {
                                                                        sellingPrice:
                                                                            Number(
                                                                                val
                                                                            ) || 0,
                                                                    }
                                                                );
                                                                clearError(
                                                                    `item_${idx}_sellingPrice`
                                                                );
                                                            }}
                                                            prefix="R$ "
                                                            decimalScale={2}
                                                            fixedDecimalScale
                                                            decimalSeparator=","
                                                            thousandSeparator="."
                                                        />
                                                    </Grid.Col>
                                                </Grid>
                                            </Paper>
                                        );
                                    })}
                                </Stack>
                            </ScrollArea.Autosize>
                        </Stack>
                    )}

                    {/* Common section: Customer, Personal Use, Observation */}
                    <Autocomplete
                        label="Nome do Cliente (opcional)"
                        placeholder="Digite ou escolha um cliente"
                        data={customers.map((c) => c.name)}
                        maxLength={100}
                        value={customerName}
                        onChange={setCustomerName}
                        filter={accentInsensitiveFilter}
                        styles={{
                            dropdown: {
                                maxHeight: 140,
                                overflowY: 'auto',
                            },
                        }}
                        leftSection={<User size={16} />}
                    />

                    <Checkbox
                        label="Uso Pessoal"
                        checked={isPersonalUse}
                        onChange={(e) =>
                            handleTogglePersonalUse(e.currentTarget.checked)
                        }
                        color="teal"
                    />

                    <Textarea
                        label="Observação (opcional)"
                        placeholder="Digite alguma observação sobre a venda/uso (máx. 250 caracteres)..."
                        maxLength={250}
                        description={`${observation.length}/250`}
                        value={observation}
                        error={errors.observation}
                        onChange={(e) => {
                            setObservation(e.currentTarget.value);
                            clearError('observation');
                        }}
                    />

                    {/* Payment section */}
                    {!isPersonalUse && (
                        <Paper p="xs" withBorder radius="md" bg="blue.0">
                            <Stack gap="xs">
                                <Group justify="space-between">
                                    <Group gap={6}>
                                        <Wallet size={18} color="#1c7ed6" />
                                        <Text size="sm" fw={700} c="blue.9">
                                            Pagamento pelo Cliente
                                        </Text>
                                    </Group>
                                    <Badge
                                        color={
                                            (Number(amountPaid) || 0) <= 0
                                                ? 'red'
                                                : remainingBalance === 0
                                                  ? 'teal'
                                                  : 'orange'
                                        }
                                        variant="filled"
                                        size="sm"
                                    >
                                        {(Number(amountPaid) || 0) <= 0
                                            ? 'NÃO PAGO'
                                            : remainingBalance === 0
                                              ? 'TOTALMENTE PAGO'
                                              : 'PARCIALMENTE PAGO'}
                                    </Badge>
                                </Group>

                                <NumberInput
                                    label="Valor Já Pago pelo Cliente (R$)"
                                    placeholder="0,00"
                                    value={amountPaid}
                                    onChange={(val) =>
                                        setAmountPaid(
                                            val !== '' ? Number(val) : 0
                                        )
                                    }
                                    prefix="R$ "
                                    decimalScale={2}
                                    decimalSeparator=","
                                    thousandSeparator="."
                                    selectAllOnFocus
                                    min={0}
                                    max={totalSaleAmount}
                                />

                                {Number(amountPaid) === totalSaleAmount &&
                                    totalSaleAmount > 0 && (
                                        <Select
                                            label="Método de Pagamento"
                                            placeholder="Selecione a forma de pagamento"
                                            data={PAYMENT_METHOD_OPTIONS}
                                            value={paymentMethod}
                                            onChange={(val) => {
                                                setPaymentMethod(
                                                    val as PaymentMethod
                                                );
                                                clearError('paymentMethod');
                                            }}
                                            error={errors.paymentMethod}
                                            required
                                            leftSection={
                                                <CreditCard size={16} />
                                            }
                                            allowDeselect={false}
                                        />
                                    )}

                                {remainingBalance > 0 && (
                                    <Text size="xs" c="orange.8" fw={600}>
                                        ⚠️ Restante a Pagar / Devedor: R${' '}
                                        {remainingBalance.toLocaleString(
                                            'pt-BR',
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )}
                                    </Text>
                                )}
                            </Stack>
                        </Paper>
                    )}

                    <Divider
                        label="Resumo Financeiro da Transação"
                        labelPosition="center"
                    />

                    <Grid>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Paper
                                p="sm"
                                radius="md"
                                style={{
                                    backgroundColor: 'rgba(9, 146, 104, 0.08)',
                                }}
                            >
                                <Group gap={6}>
                                    <DollarSign size={18} color="#12b886" />
                                    <Text size="xs" fw={700} c="teal">
                                        Total da Venda
                                    </Text>
                                </Group>
                                <Text fw={800} size="lg" c="teal" mt={4}>
                                    R${' '}
                                    {totalSaleAmount.toLocaleString('pt-BR', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </Text>
                            </Paper>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Paper
                                p="sm"
                                radius="md"
                                style={{
                                    backgroundColor:
                                        totalEstimatedProfit >= 0
                                            ? 'rgba(9, 146, 104, 0.08)'
                                            : 'rgba(224, 49, 49, 0.08)',
                                }}
                            >
                                <Group gap={6}>
                                    <TrendingUp
                                        size={18}
                                        color={
                                            totalEstimatedProfit >= 0
                                                ? '#099268'
                                                : 'red'
                                        }
                                    />
                                    <Text
                                        size="xs"
                                        fw={700}
                                        c={
                                            totalEstimatedProfit >= 0
                                                ? 'teal'
                                                : 'red'
                                        }
                                    >
                                        Lucro Estimado
                                    </Text>
                                </Group>
                                <Text
                                    fw={800}
                                    size="lg"
                                    c={
                                        totalEstimatedProfit >= 0
                                            ? 'teal'
                                            : 'red'
                                    }
                                    mt={4}
                                >
                                    R${' '}
                                    {totalEstimatedProfit.toLocaleString(
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

                    <Group justify="flex-end" mt="md">
                        <Button
                            variant="default"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            color="teal"
                            leftSection={<DollarSign size={16} />}
                            loading={loading}
                        >
                            {isPersonalUse
                                ? 'Registrar Uso Pessoal'
                                : isSingleProduct
                                  ? 'Efetivar Venda'
                                  : `Efetivar Venda (${targetProducts.length} itens)`}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
