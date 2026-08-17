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
} from '@mantine/core';
import { ShoppingCart, DollarSign, TrendingUp, Package } from 'lucide-react';
import type { Product } from './ProductsTable';

interface SaleModalProps {
    opened: boolean;
    onClose: () => void;
    product: Product | null;
    onConfirmSale: (quantity: number, sellingPrice: number) => Promise<void>;
}

export function SaleModal({
    opened,
    onClose,
    product,
    onConfirmSale,
}: SaleModalProps) {
    const [quantity, setQuantity] = useState<number>(1);
    const [sellingPrice, setSellingPrice] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (product) {
            setQuantity(1);
            setSellingPrice(product.sellingPrice || 0);
        }
    }, [product]);

    if (!product) return null;

    const availableStock = product.quantity || 0;
    const purchasePrice = product.purchasePrice || 0;
    const currentSellingPrice = sellingPrice || 0;

    const totalAmount = quantity * currentSellingPrice;
    const totalProfit = quantity * (currentSellingPrice - purchasePrice);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (quantity <= 0 || quantity > availableStock) return;

        try {
            setLoading(true);
            await onConfirmSale(quantity, currentSellingPrice);
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
                    <ShoppingCart size={22} className="text-teal-600" />
                    <Text fw={700} size="lg">
                        Efetivar Venda de Produto
                    </Text>
                </Group>
            }
            centered
            size="md"
            radius="md"
        >
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    <Paper p="sm" withBorder radius="md" bg="var(--mantine-color-gray-0)">
                        <Group justify="space-between" align="flex-start">
                            <div>
                                <Text fw={700} size="md">
                                    {product.name}
                                </Text>
                                <Group gap="xs" mt={4}>
                                    <Badge variant="light" color="blue" size="sm">
                                        {product.brand?.name || 'Sem Marca'}
                                    </Badge>
                                    <Badge variant="light" color="gray" size="sm">
                                        {product.category?.name || 'Sem Categoria'}
                                    </Badge>
                                </Group>
                            </div>
                            <Group gap={4} align="center">
                                <Package size={16} className="text-gray-500" />
                                <Text size="sm" fw={600} c={availableStock > 0 ? 'teal' : 'red'}>
                                    Estoque: {availableStock} un.
                                </Text>
                            </Group>
                        </Group>
                    </Paper>

                    <Grid>
                        <Grid.Col span={6}>
                            <NumberInput
                                label="Quantidade a Vender"
                                placeholder="Informe a quantidade"
                                value={quantity}
                                onChange={(val) => setQuantity(Number(val) || 1)}
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
                                placeholder="0.00"
                                value={sellingPrice}
                                onChange={(val) => setSellingPrice(Number(val) || 0)}
                                prefix="R$ "
                                decimalScale={2}
                                fixedDecimalScale
                                required
                                min={0}
                            />
                        </Grid.Col>
                    </Grid>

                    <Divider label="Resumo Financeiro da Transação" labelPosition="center" />

                    <Grid>
                        <Grid.Col span={6}>
                            <Paper p="xs" withBorder radius="md">
                                <Text size="xs" c="dimmed" fw={600}>
                                    Preço de Custo Unit.
                                </Text>
                                <Text fw={600} size="sm">
                                    R$ {purchasePrice.toFixed(2)}
                                </Text>
                            </Paper>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Paper p="xs" withBorder radius="md">
                                <Text size="xs" c="dimmed" fw={600}>
                                    Preço de Venda Unit.
                                </Text>
                                <Text fw={600} size="sm">
                                    R$ {currentSellingPrice.toFixed(2)}
                                </Text>
                            </Paper>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Paper p="sm" radius="md" style={{ backgroundColor: 'rgba(9, 146, 104, 0.08)' }}>
                                <Group gap={6}>
                                    <DollarSign size={18} className="text-teal-600" />
                                    <Text size="xs" fw={700} c="teal">
                                        Total da Venda
                                    </Text>
                                </Group>
                                <Text fw={800} size="lg" c="teal" mt={4}>
                                    R$ {totalAmount.toFixed(2)}
                                </Text>
                            </Paper>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Paper p="sm" radius="md" style={{ backgroundColor: totalProfit >= 0 ? 'rgba(43, 138, 62, 0.08)' : 'rgba(224, 49, 49, 0.08)' }}>
                                <Group gap={6}>
                                    <TrendingUp size={18} color={totalProfit >= 0 ? 'green' : 'red'} />
                                    <Text size="xs" fw={700} c={totalProfit >= 0 ? 'green' : 'red'}>
                                        Lucro Estimado
                                    </Text>
                                </Group>
                                <Text fw={800} size="lg" c={totalProfit >= 0 ? 'green' : 'red'} mt={4}>
                                    R$ {totalProfit.toFixed(2)}
                                </Text>
                            </Paper>
                        </Grid.Col>
                    </Grid>

                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={onClose} disabled={loading}>
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
