import { useState, useEffect } from 'react';
import {
    Modal,
    Button,
    Group,
    Text,
    Stack,
    Paper,
    Badge,
} from '@mantine/core';
import { Boxes, Package, ArrowRight } from 'lucide-react';
import type { Product, ProductBatch } from './ProductsTable';

interface BatchSelectionModalProps {
    opened: boolean;
    onClose: () => void;
    product: Product | null;
    onSelectBatch: (batch: ProductBatch) => void;
    mode?: 'edit' | 'delete';
}

const formatDateDisplay = (dateString?: string | null) => {
    if (!dateString) return 'Indeterminada';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

const formatCurrencyDisplay = (val?: number) => {
    return (val || 0).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

export function BatchSelectionModal({
    opened,
    onClose,
    product,
    onSelectBatch,
    mode = 'edit',
}: BatchSelectionModalProps) {
    const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

    const isDelete = mode === 'delete';

    const batches = (product?.batches || []).slice().sort((a, b) => {
        if (!a.expirationDate && !b.expirationDate) return 0;
        if (!a.expirationDate) return 1;
        if (!b.expirationDate) return -1;
        return a.expirationDate.localeCompare(b.expirationDate);
    });

    useEffect(() => {
        if (opened && batches.length > 0) {
            setSelectedBatchId(batches[0].id);
        }
    }, [opened, product]);

    if (!product) return null;

    const availableStock = product.quantity || 0;
    const selectedBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];

    const handleConfirmSelection = () => {
        if (selectedBatch) {
            onSelectBatch(selectedBatch);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Group gap="xs">
                    <Boxes size={22} color={isDelete ? '#e03131' : '#1c7ed6'} />
                    <Text fw={700} size="lg">
                        {isDelete ? 'Selecione o Lote para Excluir' : 'Selecione o Lote para Editar'}
                    </Text>
                </Group>
            }
            centered
            size="md"
            radius="md"
        >
            <Stack gap="md">
                {/* Cabeçalho do Produto - Idêntico ao SaleModal (Efetivar Venda) */}
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
                                Estoque: {availableStock} un.
                            </Text>
                        </Group>
                    </Group>
                </Paper>

                <Text size="sm" c="dimmed">
                    Este produto possui <strong>{batches.length} lotes</strong> cadastrados.{' '}
                    {isDelete
                        ? 'Escolha qual lote deseja excluir:'
                        : 'Escolha qual lote deseja visualizar ou alterar os dados:'}
                </Text>

                <Stack gap="xs" style={{ maxHeight: 260, overflowY: 'auto' }}>
                    {batches.map((batch, idx) => {
                        const isSelected = batch.id === selectedBatchId;
                        return (
                            <Paper
                                key={batch.id || idx}
                                p="sm"
                                withBorder
                                radius="md"
                                bg={isSelected ? (isDelete ? 'red.0' : 'blue.0') : 'white'}
                                style={{
                                    borderColor: isSelected ? (isDelete ? '#e03131' : '#1c7ed6') : '#dee2e6',
                                    borderWidth: isSelected ? 2 : 1,
                                    cursor: 'pointer',
                                }}
                                onClick={() => setSelectedBatchId(batch.id)}
                            >
                                <div>
                                    <Group gap="xs" align="center">
                                        <Text size="xs" fw={700} c={isSelected ? (isDelete ? 'red.8' : 'blue.8') : 'dark.8'}>
                                            Lote #{idx + 1}{idx === 0 ? ' (Mais Antigo)' : ''}
                                        </Text>
                                        <Text size="xs" fw={600} c="dimmed">
                                            {batch.quantity} un.
                                        </Text>
                                    </Group>
                                    <Group gap="md" mt={4} wrap="nowrap">
                                        <Text size="xs" c="dimmed">
                                            Vencimento: <strong>{formatDateDisplay(batch.expirationDate)}</strong>
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            Compra: R$ {formatCurrencyDisplay(batch.purchasePrice)}
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            Venda: R$ {formatCurrencyDisplay(batch.sellingPrice)}
                                        </Text>
                                    </Group>
                                </div>
                            </Paper>
                        );
                    })}
                </Stack>

                <Group justify="flex-end" mt="sm">
                    <Button variant="default" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        color={isDelete ? 'red' : 'blue'}
                        onClick={handleConfirmSelection}
                        disabled={!selectedBatchId}
                        rightSection={<ArrowRight size={16} />}
                    >
                        {isDelete ? 'Excluir Lote Selecionado' : 'Editar Lote Selecionado'}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
