import { useState } from 'react';
import { Alert, Stack } from '@mantine/core';
import { CheckCircle2 } from 'lucide-react';
import ProductsTable, { type Product } from '../components/ProductsTable';
import { SaleModal } from '../components/SaleModal';
import { DeleteModal } from '../components/DeleteModal';
import {
    useNearExpirationProductsQuery,
    useCreateSaleMutation,
    useDeleteProductMutation,
} from '../hooks/useProductsQuery';

export default function NearExpirationProducts() {
    const { data: products = [], isLoading: loading } = useNearExpirationProductsQuery();

    // Sale modal states
    const [saleModalOpened, setSaleModalOpened] = useState(false);
    const [productToSell, setProductToSell] = useState<Product | null>(null);

    // Delete modal states
    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [deleteError, setDeleteError] = useState('');

    // Feedback message
    const [successMessage, setSuccessMessage] = useState('');

    const createSaleMutation = useCreateSaleMutation();
    const deleteProductMutation = useDeleteProductMutation();

    const handleOpenSale = (product: Product) => {
        setProductToSell(product);
        setSaleModalOpened(true);
    };

    const handleConfirmSale = async (
        quantity: number,
        sellingPrice: number,
        customerName?: string
    ) => {
        if (!productToSell) return;
        setSuccessMessage('');
        await createSaleMutation.mutateAsync({
            productId: productToSell.id,
            quantity,
            sellingPrice,
            customerName,
        });

        const now = new Date();
        const formattedTime = now.toLocaleTimeString('pt-BR');
        const formattedDate = now.toLocaleDateString('pt-BR');

        setSuccessMessage(
            `Venda do produto "${productToSell.name}" (${quantity} un.) registrada com sucesso às ${formattedTime} do dia ${formattedDate}!`
        );
    };

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
                title="Produtos Perto de Vencer"
                subtitle="Itens com data de validade próxima que exigem atenção"
                products={products}
                loading={loading}
                onSale={handleOpenSale}
                onDelete={handleOpenDelete}
            />

            <SaleModal
                opened={saleModalOpened}
                onClose={() => setSaleModalOpened(false)}
                product={productToSell}
                onConfirmSale={handleConfirmSale}
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
