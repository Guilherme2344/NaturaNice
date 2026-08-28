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
} from '@mantine/core';
import {
    ShoppingCart,
    DollarSign,
    TrendingUp,
    Package,
    User,
    Wallet,
} from 'lucide-react';
import type { Product } from './ProductsTable';
import { customerService, type Customer } from '../services/customerService';
import { saleSchema, validateWithYup } from '../schemas/validationSchemas';

interface SaleModalProps {
    opened: boolean;
    onClose: () => void;
    product: Product | null;
    onConfirmSale: (
        quantity: number,
        sellingPrice: number,
        amountPaid?: number,
        customerName?: string
    ) => Promise<void>;
}

export function SaleModal({
    opened,
    onClose,
    product,
    onConfirmSale,
}: SaleModalProps) {
    const [quantity, setQuantity] = useState<number>(1);
    const [sellingPrice, setSellingPrice] = useState<number>(0);
    const [amountPaid, setAmountPaid] = useState<number | string>(0);
    const [customerName, setCustomerName] = useState<string>('');
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

    useEffect(() => {
        if (product) {
            const initialQty = 1;
            const initialPrice = product.sellingPrice || 0;
            setQuantity(initialQty);
            setSellingPrice(initialPrice);
            setAmountPaid(initialQty * initialPrice);
            setCustomerName('');
        }
    }, [product]);

    // Recalculate amountPaid when quantity or sellingPrice changes, if user hasn't modified it manually
    const handleQuantityOrPriceChange = (newQty: number, newPrice: number) => {
        setQuantity(newQty);
        setSellingPrice(newPrice);
        setAmountPaid(newQty * newPrice);
    };

    if (!product) return null;

    const availableStock = product.quantity || 0;
    const purchasePrice = product.purchasePrice || 0;
    const currentSellingPrice = sellingPrice || 0;

    const totalAmount = (quantity || 0) * currentSellingPrice;
    const currentAmountPaid = Number(amountPaid) || 0;
    const remainingBalance = Math.max(0, totalAmount - currentAmountPaid);
    const totalProfit = (quantity || 0) * (currentSellingPrice - purchasePrice);

    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors((prev) => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    };

    // form validated using yup
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const schema = saleSchema(availableStock);
        const { isValid, errors: validationErrors } = await validateWithYup(
            schema,
            {
                quantity: Number(quantity),
                sellingPrice: Number(sellingPrice),
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
                customerName
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
                    <ShoppingCart size={22} color="#12b886" />
                    <Text fw={700} size="lg">
                        Efetivar Venda de Produto
                    </Text>
                </Group>
            }
            centered
            size="md"
            radius="md"
        >
            <form onSubmit={handleSubmit} noValidate>
                <Stack gap="md">
                    <Paper
                        p="sm"
                        withBorder
                        radius="md"
                        bg="var(--mantine-color-gray-0)"
                    >
                        <Group justify="space-between" align="flex-start">
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
                                </Group>
                            </div>
                            <Group gap={4} align="center">
                                <Package size={16} color="#868e96" />
                                <Text
                                    size="sm"
                                    fw={600}
                                    c={availableStock > 0 ? 'teal' : 'red'}
                                >
                                    Estoque: {availableStock} un.
                                </Text>
                            </Group>
                        </Group>
                    </Paper>

                    <Autocomplete
                        label="Nome do Cliente (opcional)"
                        placeholder="Digite ou escolha um cliente cadastrado"
                        data={customers.map((c) => c.name)}
                        value={customerName}
                        onChange={setCustomerName}
                        leftSection={<User size={16} />}
                    />

                    <Grid>
                        <Grid.Col span={6}>
                            <NumberInput
                                label="Vendido"
                                placeholder="Informe a quantidade"
                                value={quantity}
                                error={errors.quantity}
                                onChange={(val) => {
                                    const newQty = Number(val) || 0;
                                    handleQuantityOrPriceChange(newQty, sellingPrice);
                                    clearError('quantity');
                                }}
                                min={1}
                                max={availableStock}
                                required
                                allowNegative={false}
                                allowDecimal={false}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <NumberInput
                                label="Preço de Venda Unitário"
                                placeholder="0,00"
                                value={sellingPrice}
                                error={errors.sellingPrice}
                                onChange={(val) => {
                                    const newPrice = Number(val) || 0;
                                    handleQuantityOrPriceChange(quantity, newPrice);
                                    clearError('sellingPrice');
                                }}
                                prefix="R$ "
                                decimalScale={2}
                                decimalSeparator=","
                                thousandSeparator="."
                                selectAllOnFocus
                                required
                                min={0}
                            />
                        </Grid.Col>
                    </Grid>

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
                                    color={remainingBalance === 0 ? 'teal' : 'orange'}
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
                                onChange={(val) => setAmountPaid(val !== '' ? Number(val) : 0)}
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
                                    {remainingBalance.toLocaleString('pt-BR', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </Text>
                            )}
                        </Stack>
                    </Paper>

                    <Divider
                        label="Resumo Financeiro da Transação"
                        labelPosition="center"
                    />

                    <Grid>
                        <Grid.Col span={6}>
                            <Paper p="xs" withBorder radius="md">
                                <Text size="xs" c="dimmed" fw={600}>
                                    Preço de Custo Unit.
                                </Text>
                                <Text fw={600} size="sm">
                                    R${' '}
                                    {purchasePrice.toLocaleString('pt-BR', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </Text>
                            </Paper>
                        </Grid.Col>
                        <Grid.Col span={6}>
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
                        <Grid.Col span={6}>
                            <Paper
                                p="sm"
                                radius="md"
                                style={{
                                    backgroundColor: 'rgba(9, 146, 104, 0.08)',
                                }}
                            >
                                <Group gap={6}>
                                    <DollarSign
                                        size={18}
                                        color="#12b886"
                                    />
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
                        <Grid.Col span={6}>
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
                            leftSection={<ShoppingCart size={16} />}
                            loading={loading}
                            disabled={availableStock <= 0}
                        >
                            Efetivar Venda
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
