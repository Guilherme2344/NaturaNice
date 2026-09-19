import { useState, useEffect } from 'react';
import { Alert, Stack } from '@mantine/core';
import { CheckCircle2 } from 'lucide-react';
import ProductsTable, { type Product } from '../components/ProductsTable';
import { ProductModal } from '../components/ProductModal';
import { SaleModal } from '../components/SaleModal';
import { DeleteModal } from '../components/DeleteModal';
import {
    useNearExpirationProductsQuery,
    useUpdateProductMutation,
    useCreateSaleMutation,
    useDeleteProductMutation,
} from '../hooks/useProductsQuery';
import {
    useBrandsQuery,
    useCategoriesQuery,
    useFamiliesQuery,
} from '../hooks/useEntitiesQuery';
import type { CreateProductDTO } from '../services/productService';
import type { CreateSaleDTO } from '../services/saleService';

export default function NearExpirationProducts() {
    const { data: products = [], isLoading: loading } = useNearExpirationProductsQuery();
    const { data: brands = [] } = useBrandsQuery();
    const { data: categories = [] } = useCategoriesQuery();
    const { data: families = [] } = useFamiliesQuery();

    // Edit modal states
    const [modalOpened, setModalOpened] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Selection state
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

    // Sale modal states
    const [saleModalOpened, setSaleModalOpened] = useState(false);
    const [productsToSell, setProductsToSell] = useState<Product[]>([]);

    // Delete modal states
    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [deleteError, setDeleteError] = useState('');

    // Feedback message
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const updateProductMutation = useUpdateProductMutation();
    const createSaleMutation = useCreateSaleMutation();
    const deleteProductMutation = useDeleteProductMutation();

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

    const handleOpenSale = (selected: Product[]) => {
        setProductsToSell(selected);
        setSaleModalOpened(true);
    };

    const handleConfirmSale = async (saleData: CreateSaleDTO) => {
        setSuccessMessage('');
        await createSaleMutation.mutateAsync(saleData);
        setSelectedProductIds([]);

        const now = new Date();
        const formattedTime = now.toLocaleTimeString('pt-BR');
        const formattedDate = now.toLocaleDateString('pt-BR');

        const count = saleData.items ? saleData.items.length : 1;
        const itemNames = productsToSell.map((p) => `"${p.name}"`).join(', ');

        setSuccessMessage(
            saleData.isPersonalUse
                ? `Uso pessoal (${count} produto(s): ${itemNames}) registrado com sucesso às ${formattedTime} do dia ${formattedDate}!`
                : `Venda (${count} produto(s): ${itemNames}) registrada com sucesso às ${formattedTime} do dia ${formattedDate}!`
        );
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
            setSelectedProductIds([]);
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
                onEdit={handleOpenEdit}
                onSale={handleOpenSale}
                onDelete={handleOpenDelete}
                selectedIds={selectedProductIds}
                onSelectedIdsChange={setSelectedProductIds}
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

            <SaleModal
                opened={saleModalOpened}
                onClose={() => setSaleModalOpened(false)}
                products={productsToSell}
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
