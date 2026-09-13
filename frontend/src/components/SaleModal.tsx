import { useState, useEffect } from 'react';
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
} from '@mantine/core';
import {
    DollarSign,
    TrendingUp,
    Package,
    User,
    Wallet,
    Boxes,
} from 'lucide-react';
import type { Product } from './ProductsTable';
import { customerService, type Customer } from '../services/customerService';
import { saleSchema, validateWithYup } from '../schemas/validationSchemas';
import { accentInsensitiveFilter } from '../utils/stringUtils';

interface SaleModalProps {
    opened: boolean;
    onClose: () => void;
    product: Product | null;
    onConfirmSale: (
        quantity: number,
        sellingPrice: number,
        amountPaid?: number,
        customerName?: string,
        observation?: string,
        isPersonalUse?: boolean,
        batchId?: string
    ) => Promise<void>;
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
    onConfirmSale,
}: SaleModalProps) {
    const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [sellingPrice, setSellingPrice] = useState<number>(0);
    const [amountPaid, setAmountPaid] = useState<number | string>(0);
    const [customerName, setCustomerName] = useState<string>('');
    const [observation, setObservation] = useState<string>('');
    const [isPersonalUse, setIsPersonalUse] = useState<boolean>(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (opened) {
            setErrors({});
            customerService
                .getAll()
                .then((data) => setCustomers(data))
                .catch((err) => console.error('Erro ao buscar clientes:', err));
        }
    }, [opened]);

    const sortedBatches = (product?.batches || []).slice().sort((a, b) => {
        if (!a.expirationDate && !b.expirationDate) return 0;
        if (!a.expirationDate) return 1;
        if (!b.expirationDate) return -1;
        return a.expirationDate.localeCompare(b.expirationDate);
    });

    useEffect(() => {
        if (product) {
            const batches = (product.batches || []).slice().sort((a, b) => {
                if (!a.expirationDate && !b.expirationDate) return 0;
                if (!a.expirationDate) return 1;
                if (!b.expirationDate) return -1;
                return a.expirationDate.localeCompare(b.expirationDate);
            });
            const firstBatch = batches[0];
            const initialQty = 1;
            const initialPrice = firstBatch ? firstBatch.sellingPrice : (product.sellingPrice || 0);
            setSelectedBatchId(firstBatch ? firstBatch.id : null);
            setQuantity(initialQty);
            setSellingPrice(initialPrice);
            setAmountPaid(initialQty * initialPrice);
            setCustomerName('');
            setObservation('');
            setIsPersonalUse(false);
        }
    }, [product]);

    // Recalculate amountPaid when quantity or sellingPrice changes
    const handleQuantityOrPriceChange = (newQty: number, newPrice: number) => {
        setQuantity(newQty);
        setSellingPrice(newPrice);
        if (!isPersonalUse) {
            setAmountPaid(newQty * newPrice);
        }
    };

    const handleTogglePersonalUse = (checked: boolean) => {
        setIsPersonalUse(checked);
        clearError('sellingPrice');
        if (checked) {
            setSellingPrice(0);
            setAmountPaid(0);
        } else {
            const selectedBatch = sortedBatches.find((b) => b.id === selectedBatchId);
            const defaultPrice = selectedBatch ? selectedBatch.sellingPrice : (product?.sellingPrice || 0);
            setSellingPrice(defaultPrice);
            setAmountPaid((quantity || 1) * defaultPrice);
        }
    };

    if (!product) return null;

    const selectedBatch = sortedBatches.find((b) => b.id === selectedBatchId);

    // Stock for the chosen batch (or total stock if no specific batch)
    const availableStock = selectedBatch
        ? selectedBatch.quantity
        : (product.quantity || 0);

    const currentSellingPrice = isPersonalUse ? 0 : sellingPrice || 0;

    const rawPurchasePrice = selectedBatch
        ? selectedBatch.purchasePrice
        : (product.purchasePrice || 0);

    const effectivePurchasePrice = isPersonalUse
        ? 0
        : rawPurchasePrice > 0
          ? rawPurchasePrice
          : Number((currentSellingPrice * 0.7).toFixed(2));

    const totalAmount = isPersonalUse
        ? 0
        : (quantity || 0) * currentSellingPrice;
    const currentAmountPaid = isPersonalUse ? 0 : Number(amountPaid) || 0;
    const remainingBalance = isPersonalUse
        ? 0
        : Math.max(0, totalAmount - currentAmountPaid);
    const totalProfit = isPersonalUse
        ? 0
        : (quantity || 0) * (currentSellingPrice - effectivePurchasePrice);

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

        const schema = saleSchema(availableStock, isPersonalUse);
        const { isValid, errors: validationErrors } = await validateWithYup(
            schema,
            {
                quantity: Number(quantity),
                sellingPrice: Number(sellingPrice),
                observation: observation.trim() || undefined,
            }
        );

        if (!isValid) {
            setErrors(validationErrors);
            return;
        }

        try {
            setLoading(true);
            await onConfirmSale(
                quantity,
                currentSellingPrice,
                currentAmountPaid,
                customerName.trim() || undefined,
                observation.trim() || undefined,
                isPersonalUse,
                selectedBatchId || undefined
            );
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
                        Efetivar Venda de Produto
                    </Text>
                </Group>
            }
            centered
            size="lg"
            radius="md"
        >
            <form onSubmit={handleSubmit} noValidate>
                <Stack gap="md">
                    <Paper p="sm" withBorder radius="md" bg="gray.0">
                        <Group justify="space-between" align="center">
                            <div>
                                <Text fw={700} size="md">
                                    {product.name}
                                </Text>
                                <Group gap="xs" mt={4}>
                                    <Badge
                                        variant="light"
                                        color="blue"
                                        size="sm"
                                    >
                                        {product.brand?.name || 'Sem Marca'}
                                    </Badge>
                                    <Badge
                                        variant="light"
                                        color="gray"
                                        size="sm"
                                    >
                                        {product.category?.name ||
                                            'Sem Categoria'}
                                    </Badge>
                                    {product.family?.name && (
                                        <Badge
                                            variant="outline"
                                            color="gray"
                                            size="sm"
                                        >
                                            {product.family.name}
                                        </Badge>
                                    )}
                                </Group>
                            </div>
                            <Group gap={4} align="center">
                                <Package size={16} color="#868e96" />
                                <Text
                                    size="sm"
                                    fw={600}
                                    c={availableStock > 0 ? 'teal' : 'red'}
                                >
                                    Estoque Lote: {availableStock} un. (Total: {product.quantity} un.)
                                </Text>
                            </Group>
                        </Group>
                    </Paper>

                    {/* Seleção do Lote (Ordenado do mais antigo para o mais novo) */}
                    {sortedBatches.length > 0 && (
                        <Select
                            label="Escolha o Lote para Venda"
                            description="Ordenados prioritariamente do mais antigo (vencimento mais próximo) para o mais novo"
                            leftSection={<Boxes size={16} color="#1c7ed6" />}
                            data={sortedBatches.map((batch, index) => ({
                                value: batch.id,
                                label: `Lote ${index + 1} | Venc: ${formatDate(batch.expirationDate)}`,
                            }))}
                            value={selectedBatchId}
                            onChange={(val) => {
                                setSelectedBatchId(val);
                                const batch = sortedBatches.find((b) => b.id === val);
                                if (batch) {
                                    const newPrice = isPersonalUse ? 0 : batch.sellingPrice || 0;
                                    setSellingPrice(newPrice);
                                    const newQty = Math.min(quantity || 1, batch.quantity);
                                    setQuantity(newQty);
                                    if (!isPersonalUse) {
                                        setAmountPaid(newQty * newPrice);
                                    }
                                }
                            }}
                            styles={{
                                dropdown: {
                                    maxHeight: 180,
                                    overflowY: 'auto',
                                },
                            }}
                        />
                    )}

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

                    <Grid>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <NumberInput
                                label="Quantidade Vendida"
                                placeholder="Informe a quantidade"
                                value={quantity}
                                error={errors.quantity}
                                onChange={(val) => {
                                    const newQty = Number(val) || 0;
                                    handleQuantityOrPriceChange(
                                        newQty,
                                        sellingPrice
                                    );
                                    clearError('quantity');
                                }}
                                min={1}
                                max={availableStock}
                                required
                                allowNegative={false}
                                allowDecimal={false}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <NumberInput
                                label="Preço de Venda Unitário"
                                placeholder="0,00"
                                value={sellingPrice}
                                error={errors.sellingPrice}
                                disabled={isPersonalUse}
                                onChange={(val) => {
                                    const newPrice = Number(val) || 0;
                                    handleQuantityOrPriceChange(
                                        quantity,
                                        newPrice
                                    );
                                    clearError('sellingPrice');
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
                                            remainingBalance === 0
                                                ? 'teal'
                                                : 'orange'
                                        }
                                        variant="filled"
                                        size="sm"
                                    >
                                        {remainingBalance === 0
                                            ? 'Totalmente Pago'
                                            : 'Parcialmente Pago'}
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
                                    max={totalAmount}
                                />

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
                            <Paper p="xs" withBorder radius="md">
                                <Text size="xs" c="dimmed" fw={600}>
                                    Preço de Custo Unit. (Lote Escolhido)
                                </Text>
                                <Text fw={600} size="sm">
                                    R${' '}
                                    {effectivePurchasePrice.toLocaleString(
                                        'pt-BR',
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }
                                    )}
                                </Text>
                            </Paper>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Paper p="xs" withBorder radius="md">
                                <Text size="xs" c="dimmed" fw={600}>
                                    Preço de Venda Unit.
                                </Text>
                                <Text fw={600} size="sm">
                                    R${' '}
                                    {currentSellingPrice.toLocaleString(
                                        'pt-BR',
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }
                                    )}
                                </Text>
                            </Paper>
                        </Grid.Col>
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
                                    {totalAmount.toLocaleString('pt-BR', {
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
                                        totalProfit >= 0
                                            ? 'rgba(9, 146, 104, 0.08)'
                                            : 'rgba(224, 49, 49, 0.08)',
                                }}
                            >
                                <Group gap={6}>
                                    <TrendingUp
                                        size={18}
                                        color={
                                            totalProfit >= 0 ? '#099268' : 'red'
                                        }
                                    />
                                    <Text
                                        size="xs"
                                        fw={700}
                                        c={totalProfit >= 0 ? 'teal' : 'red'}
                                    >
                                        Lucro Estimado
                                    </Text>
                                </Group>
                                <Text
                                    fw={800}
                                    size="lg"
                                    c={totalProfit >= 0 ? 'teal' : 'red'}
                                    mt={4}
                                >
                                    R${' '}
                                    {totalProfit.toLocaleString('pt-BR', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
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
                            disabled={availableStock <= 0}
                        >
                            {isPersonalUse
                                ? 'Registrar Uso Pessoal'
                                : 'Efetivar Venda'}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
