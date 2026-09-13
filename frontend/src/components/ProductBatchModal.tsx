import { useState, useEffect } from 'react';
import {
    Modal,
    Button,
    Group,
    NumberInput,
    TextInput,
    Text,
    Stack,
    Paper,
    Badge,
    Grid,
    Checkbox,
} from '@mantine/core';
import { Boxes, Package, Plus } from 'lucide-react';
import type { Product } from './ProductsTable';
import type { CreateProductBatchDTO } from '../services/productBatchService';
import { getTodayString } from '../utils/expirationUtils';

interface ProductBatchModalProps {
    opened: boolean;
    onClose: () => void;
    product: Product | null;
    onConfirmBatch: (data: CreateProductBatchDTO) => Promise<void>;
}

export function ProductBatchModal({
    opened,
    onClose,
    product,
    onConfirmBatch,
}: ProductBatchModalProps) {
    const [quantity, setQuantity] = useState<number | string>(1);
    const [purchaseDate, setPurchaseDate] = useState<string>(getTodayString());
    const [expirationDate, setExpirationDate] = useState<string>('');
    const [isIndeterminateExpiration, setIsIndeterminateExpiration] = useState(false);
    const [purchasePrice, setPurchasePrice] = useState<number | string>(0);
    const [sellingPrice, setSellingPrice] = useState<number | string>(0);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (opened && product) {
            setErrors({});
            setQuantity(1);
            setPurchaseDate(getTodayString());
            setPurchasePrice(product.purchasePrice || 0);
            setSellingPrice(product.sellingPrice || 0);

            const hasExp = Boolean(product.expirationDate);
            setIsIndeterminateExpiration(!hasExp);
            setExpirationDate(product.expirationDate || '');
        }
    }, [opened, product]);

    if (!product) return null;

    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors((prev) => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    };

    const handleSubmitNewBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        const numQty = Number(quantity);
        if (!numQty || numQty < 1) {
            newErrors.quantity = 'A quantidade do lote deve ser no mínimo 1';
        }

        const numSell = Number(sellingPrice);
        if (numSell <= 0) {
            newErrors.sellingPrice = 'O preço de venda deve ser maior que zero';
        }

        if (!isIndeterminateExpiration && !expirationDate) {
            newErrors.expirationDate = 'Informe a data de vencimento ou marque como indeterminada';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setLoading(true);
            await onConfirmBatch({
                productId: product.id,
                quantity: numQty,
                purchaseDate: purchaseDate || getTodayString(),
                expirationDate: isIndeterminateExpiration ? null : expirationDate,
                purchasePrice: Number(purchasePrice) || 0,
                sellingPrice: numSell,
            });
            onClose();
        } catch (error: any) {
            const serverMsg = error?.response?.data?.message || 'Erro ao cadastrar lote.';
            setErrors({ submit: serverMsg });
        } finally {
            setLoading(false);
        }
    };

    const availableStock = product.quantity || 0;

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Group gap="xs">
                    <Boxes size={22} color="#1c7ed6" />
                    <Text fw={700} size="lg">
                        Cadastrar Novo Lote
                    </Text>
                </Group>
            }
            centered
            size="lg"
            radius="md"
        >
            <form onSubmit={handleSubmitNewBatch} noValidate>
                <Stack gap="md">
                    {/* Espaço reservado para o nome do produto idêntico ao SaleModal */}
                    <Paper p="sm" withBorder radius="md" bg="gray.0">
                        <Group justify="space-between" align="center">
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
                                    {product.family?.name && (
                                        <Badge variant="outline" color="gray" size="sm">
                                            {product.family.name}
                                        </Badge>
                                    )}
                                </Group>
                            </div>
                            <Group gap={4} align="center">
                                <Package size={16} color="#868e96" />
                                <Text size="sm" fw={600} c={availableStock > 0 ? 'teal' : 'red'}>
                                    Estoque Atual: {availableStock} un.
                                </Text>
                            </Group>
                        </Group>
                    </Paper>

                    {errors.submit && (
                        <Text c="red" size="sm" fw={600}>
                            {errors.submit}
                        </Text>
                    )}

                    <Grid>
                        <Grid.Col span={4}>
                            <NumberInput
                                label="Quantidade"
                                required
                                min={1}
                                value={quantity}
                                error={errors.quantity}
                                onChange={(val) => {
                                    setQuantity(val);
                                    clearError('quantity');
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <TextInput
                                type="date"
                                label="Data de Compra"
                                required
                                value={purchaseDate}
                                error={errors.purchaseDate}
                                onChange={(e) => {
                                    setPurchaseDate(e.currentTarget.value);
                                    clearError('purchaseDate');
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <TextInput
                                type="date"
                                label="Data de Vencimento"
                                required={!isIndeterminateExpiration}
                                placeholder={isIndeterminateExpiration ? 'Validade indeterminada' : 'Selecione a data'}
                                disabled={isIndeterminateExpiration}
                                value={expirationDate}
                                error={errors.expirationDate}
                                onChange={(e) => {
                                    setExpirationDate(e.currentTarget.value);
                                    clearError('expirationDate');
                                }}
                            />
                            <Checkbox
                                mt={6}
                                size="xs"
                                label="Indeterminada"
                                checked={isIndeterminateExpiration}
                                onChange={(e) => {
                                    const checked = e.currentTarget.checked;
                                    setIsIndeterminateExpiration(checked);
                                    if (checked) {
                                        setExpirationDate('');
                                        clearError('expirationDate');
                                    }
                                }}
                            />
                        </Grid.Col>
                    </Grid>

                    <Grid>
                        <Grid.Col span={6}>
                            <NumberInput
                                label="Preço de Compra (R$)"
                                decimalScale={2}
                                decimalSeparator=","
                                thousandSeparator="."
                                selectAllOnFocus
                                min={0}
                                prefix="R$ "
                                required
                                value={purchasePrice}
                                error={errors.purchasePrice}
                                onChange={(val) => {
                                    setPurchasePrice(val);
                                    clearError('purchasePrice');
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <NumberInput
                                label="Preço de Venda (R$)"
                                decimalScale={2}
                                decimalSeparator=","
                                thousandSeparator="."
                                selectAllOnFocus
                                min={0}
                                prefix="R$ "
                                required
                                value={sellingPrice}
                                error={errors.sellingPrice}
                                onChange={(val) => {
                                    setSellingPrice(val);
                                    clearError('sellingPrice');
                                }}
                            />
                        </Grid.Col>
                    </Grid>

                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" color="blue" loading={loading} leftSection={<Plus size={16} />}>
                            Cadastrar Lote
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}


