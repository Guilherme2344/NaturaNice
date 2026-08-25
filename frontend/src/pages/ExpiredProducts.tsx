import { useState } from 'react';
import { Alert, Stack } from '@mantine/core';
import { CheckCircle2 } from 'lucide-react';
import ProductsTable, { type Product } from '../components/ProductsTable';
import { DeleteModal } from '../components/DeleteModal';
import {
    useExpiredProductsQuery,
    useDeleteProductMutation,
} from '../hooks/useProductsQuery';

export default function ExpiredProducts() {
    const { data: products = [], isLoading: loading } = useExpiredProductsQuery();

    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [deleteError, setDeleteError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const deleteProductMutation = useDeleteProductMutation();

    const handleOpenDelete = (id: number) => {
        const prod = products.find((p) => p.id === id);
        if (prod) {
            setProductToDelete(prod);
            setDeleteError('');
            setDeleteModalOpened(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;
        try {
            setSuccessMessage('');
            setDeleteError('');
            await deleteProductMutation.mutateAsync(productToDelete.id);
            setDeleteModalOpened(false);
            setSuccessMessage(`Produto "${productToDelete.name}" excluído com sucesso!`);
            setProductToDelete(null);
        } catch (err: any) {
            if (err?.response?.status === 409) {
                const serverMsg = err?.response?.data?.details || err?.response?.data?.message;
                setDeleteError(
                    serverMsg || 'Não é possível excluir este produto pois existem vendas associadas a ele.'
                );
            } else {
                setDeleteError(
                    err?.response?.data?.message || 'Erro ao excluir o produto.'
                );
            }
        }
    };

    return (
        <Stack gap="md">
            {successMessage && (
                <Alert
                    icon={<CheckCircle2 size={18} />}
                    color="teal"
                    radius="md"
                    withCloseButton
                    onClose={() => setSuccessMessage('')}
                >
                    {successMessage}
                </Alert>
            )}

            <ProductsTable
                title="Produtos Vencidos"
                subtitle="Itens com data expirada que devem ser separados/descartados"
                products={products}
                loading={loading}
                onDelete={handleOpenDelete}
            />

            <DeleteModal
                opened={deleteModalOpened}
                onClose={() => setDeleteModalOpened(false)}
                onConfirm={handleConfirmDelete}
                title="Excluir Produto"
                itemDescription={productToDelete ? `o produto "${productToDelete.name}"` : 'este produto'}
                loading={deleteProductMutation.isPending}
                error={deleteError}
            />
        </Stack>
    );
}
