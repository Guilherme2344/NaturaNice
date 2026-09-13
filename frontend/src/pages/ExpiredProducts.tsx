import { useState, useEffect } from 'react';
import { Alert, Stack } from '@mantine/core';
import { CheckCircle2 } from 'lucide-react';
import ProductsTable, { type Product } from '../components/ProductsTable';
import { ProductModal } from '../components/ProductModal';
import { DeleteModal } from '../components/DeleteModal';
import {
    useExpiredProductsQuery,
    useUpdateProductMutation,
    useDeleteProductMutation,
} from '../hooks/useProductsQuery';
import {
    useBrandsQuery,
    useCategoriesQuery,
    useFamiliesQuery,
} from '../hooks/useEntitiesQuery';
import type { CreateProductDTO } from '../services/productService';

export default function ExpiredProducts() {
    const { data: products = [], isLoading: loading } = useExpiredProductsQuery();
    const { data: brands = [] } = useBrandsQuery();
    const { data: categories = [] } = useCategoriesQuery();
    const { data: families = [] } = useFamiliesQuery();

    const updateProductMutation = useUpdateProductMutation();
    const deleteProductMutation = useDeleteProductMutation();

    const [modalOpened, setModalOpened] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [deleteError, setDeleteError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const handleOpenEdit = (product: Product) => {
        setSelectedProduct(product);
        setModalOpened(true);
    };

    const handleSubmitProduct = async (data: CreateProductDTO) => {
        if (!selectedProduct) return;
        setSuccessMessage('');
        await updateProductMutation.mutateAsync({
            id: selectedProduct.id,
            data,
        });
        setSuccessMessage(`Produto "${data.name}" atualizado com sucesso!`);
    };

    const handleOpenDelete = (id: string) => {
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
                subtitle="Itens com data de validade vencida"
                products={products}
                loading={loading}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
            />

            <ProductModal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                brands={brands}
                categories={categories}
                families={families}
                initialData={selectedProduct}
                onSubmit={handleSubmitProduct}
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
