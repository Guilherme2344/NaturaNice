import { useState, useEffect } from 'react';
import { Alert, Stack } from '@mantine/core';
import { CheckCircle2 } from 'lucide-react';
import ProductsTable, { type Product, type ProductBatch } from '../components/ProductsTable';
import { ProductModal } from '../components/ProductModal';
import { SaleModal } from '../components/SaleModal';
import { DeleteModal } from '../components/DeleteModal';
import { ProductBatchModal } from '../components/ProductBatchModal';
import { BatchSelectionModal } from '../components/BatchSelectionModal';
import {
    useProductsQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useCreateSaleMutation,
} from '../hooks/useProductsQuery';
import { useCreateProductBatchMutation, useDeleteProductBatchMutation } from '../hooks/useProductBatchesQuery';
import {
    useBrandsQuery,
    useCategoriesQuery,
    useFamiliesQuery,
} from '../hooks/useEntitiesQuery';
import type { CreateProductDTO } from '../services/productService';
import type { CreateProductBatchDTO } from '../services/productBatchService';
import type { CreateSaleDTO } from '../services/saleService';

export default function Products() {
    const { data: products = [], isLoading: loadingProducts } = useProductsQuery();
    const { data: brands = [] } = useBrandsQuery();
    const { data: categories = [] } = useCategoriesQuery();
    const { data: families = [] } = useFamiliesQuery();

    const createProductMutation = useCreateProductMutation();
    const updateProductMutation = useUpdateProductMutation();
    const deleteProductMutation = useDeleteProductMutation();
    const createSaleMutation = useCreateSaleMutation();
    const createProductBatchMutation = useCreateProductBatchMutation();
    const deleteProductBatchMutation = useDeleteProductBatchMutation();

    // Modal states
    const [modalOpened, setModalOpened] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedBatchForEdit, setSelectedBatchForEdit] = useState<ProductBatch | null>(null);

    // Multi-batch Step 1 selection modal states (Edit)
    const [batchSelectionOpened, setBatchSelectionOpened] = useState(false);
    const [productForBatchSelection, setProductForBatchSelection] = useState<Product | null>(null);

    // Multi-batch Step 1 selection modal states (Delete)
    const [deleteBatchSelectionOpened, setDeleteBatchSelectionOpened] = useState(false);
    const [productForDeleteSelection, setProductForDeleteSelection] = useState<Product | null>(null);
    const [selectedBatchToDelete, setSelectedBatchToDelete] = useState<ProductBatch | null>(null);

    // Selection state
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

    // Sale modal states
    const [saleModalOpened, setSaleModalOpened] = useState(false);
    const [productsToSell, setProductsToSell] = useState<Product[]>([]);

    // Delete modal states
    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [deleteError, setDeleteError] = useState('');

    // ProductBatch modal states
    const [batchModalOpened, setBatchModalOpened] = useState(false);
    const [productForBatch, setProductForBatch] = useState<Product | null>(null);

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

    const handleOpenAdd = () => {
        setSelectedProduct(null);
        setSelectedBatchForEdit(null);
        setModalOpened(true);
    };

    const handleOpenEdit = (product: Product) => {
        const batches = product.batches || [];
        if (batches.length > 1) {
            setProductForBatchSelection(product);
            setBatchSelectionOpened(true);
        } else {
            setSelectedProduct(product);
            setSelectedBatchForEdit(batches[0] || null);
            setModalOpened(true);
        }
    };

    const handleSelectBatchToEdit = (batch: ProductBatch) => {
        setBatchSelectionOpened(false);
        if (productForBatchSelection) {
            setSelectedProduct(productForBatchSelection);
            setSelectedBatchForEdit(batch);
            setModalOpened(true);
        }
    };

    const handleOpenSale = (selected: Product[]) => {
        setProductsToSell(selected);
        setSaleModalOpened(true);
    };

    const handleOpenBatchModal = (product: Product) => {
        setProductForBatch(product);
        setBatchModalOpened(true);
    };

    const handleOpenDelete = (id: string) => {
        const prod = products.find((p) => p.id === id);
        if (prod) {
            const batches = prod.batches || [];
            if (batches.length > 1) {
                setProductForDeleteSelection(prod);
                setDeleteBatchSelectionOpened(true);
            } else {
                setProductToDelete(prod);
                setSelectedBatchToDelete(batches[0] || null);
                setDeleteError('');
                setDeleteModalOpened(true);
            }
        }
    };

    const handleSelectBatchToDelete = (batch: ProductBatch) => {
        setDeleteBatchSelectionOpened(false);
        if (productForDeleteSelection) {
            setProductToDelete(productForDeleteSelection);
            setSelectedBatchToDelete(batch);
            setDeleteError('');
            setDeleteModalOpened(true);
        }
    };

    const handleConfirmBatch = async (data: CreateProductBatchDTO) => {
        if (!productForBatch) return;
        setSuccessMessage('');
        await createProductBatchMutation.mutateAsync(data);
        setSuccessMessage(
            `Lote de ${data.quantity} un. cadastrado com sucesso para o produto "${productForBatch.name}"!`
        );
    };

    const handleSubmitProduct = async (data: CreateProductDTO) => {
        setSuccessMessage('');
        if (selectedProduct) {
            await updateProductMutation.mutateAsync({
                id: selectedProduct.id,
                data,
            });
            setSuccessMessage(`Produto "${data.name}" atualizado com sucesso!`);
        } else {
            await createProductMutation.mutateAsync(data);
            setSuccessMessage(`Produto "${data.name}" cadastrado com sucesso!`);
        }
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

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;
        try {
            setSuccessMessage('');
            setDeleteError('');
            const batches = productToDelete.batches || [];
            if (batches.length > 1 && selectedBatchToDelete) {
                const sortedBatches = batches.slice().sort((a, b) => {
                    if (!a.expirationDate && !b.expirationDate) return 0;
                    if (!a.expirationDate) return 1;
                    if (!b.expirationDate) return -1;
                    return a.expirationDate.localeCompare(b.expirationDate);
                });
                const batchIdx = sortedBatches.findIndex((b) => b.id === selectedBatchToDelete.id);
                const batchNum = batchIdx >= 0 ? batchIdx + 1 : 1;

                await deleteProductBatchMutation.mutateAsync(selectedBatchToDelete.id);
                setDeleteModalOpened(false);
                setSuccessMessage(
                    `Lote ${batchNum} do produto "${productToDelete.name}" excluído com sucesso!`
                );
            } else {
                await deleteProductMutation.mutateAsync(productToDelete.id);
                setDeleteModalOpened(false);
                setSuccessMessage(
                    `Produto "${productToDelete.name}" excluído com sucesso!`
                );
            }
            setSelectedProductIds([]);
            setProductToDelete(null);
            setSelectedBatchToDelete(null);
        } catch (err: any) {
            if (err?.response?.status === 409) {
                const serverMsg = err?.response?.data?.details || err?.response?.data?.message;
                setDeleteError(
                    serverMsg || 'Não é possível excluir pois existem vendas associadas.'
                );
            } else {
                setDeleteError(
                    err?.response?.data?.message || 'Erro ao excluir o lote/produto.'
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
                products={products}
                loading={loadingProducts}
                onAdd={handleOpenAdd}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                onSale={handleOpenSale}
                onAddLote={handleOpenBatchModal}
                selectedIds={selectedProductIds}
                onSelectedIdsChange={setSelectedProductIds}
            />

            {/* Modal de Escolha do Lote para Edição (Passo 1 quando o produto tem > 1 lote) */}
            <BatchSelectionModal
                opened={batchSelectionOpened}
                onClose={() => setBatchSelectionOpened(false)}
                product={productForBatchSelection}
                onSelectBatch={handleSelectBatchToEdit}
                mode="edit"
            />

            {/* Modal de Escolha do Lote para Exclusão (Passo 1 quando o produto tem > 1 lote) */}
            <BatchSelectionModal
                opened={deleteBatchSelectionOpened}
                onClose={() => setDeleteBatchSelectionOpened(false)}
                product={productForDeleteSelection}
                onSelectBatch={handleSelectBatchToDelete}
                mode="delete"
            />

            {/* Modal de Formulário de Edição do Produto e Lote (Passo 2) */}
            <ProductModal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                brands={brands}
                categories={categories}
                families={families}
                initialData={selectedProduct}
                initialBatch={selectedBatchForEdit}
                onSubmit={handleSubmitProduct}
            />

            <SaleModal
                opened={saleModalOpened}
                onClose={() => setSaleModalOpened(false)}
                products={productsToSell}
                onConfirmSale={handleConfirmSale}
            />

            <ProductBatchModal
                opened={batchModalOpened}
                onClose={() => setBatchModalOpened(false)}
                product={productForBatch}
                onConfirmBatch={handleConfirmBatch}
            />

            <DeleteModal
                opened={deleteModalOpened}
                onClose={() => setDeleteModalOpened(false)}
                onConfirm={handleConfirmDelete}
                title={
                    productToDelete && (productToDelete.batches || []).length > 1 && selectedBatchToDelete
                        ? 'Excluir Lote'
                        : 'Excluir Produto'
                }
                itemDescription={(() => {
                    if (!productToDelete) return 'este registro';
                    const batches = productToDelete.batches || [];
                    if (batches.length > 1 && selectedBatchToDelete) {
                        const sortedBatches = batches.slice().sort((a, b) => {
                            if (!a.expirationDate && !b.expirationDate) return 0;
                            if (!a.expirationDate) return 1;
                            if (!b.expirationDate) return -1;
                            return a.expirationDate.localeCompare(b.expirationDate);
                        });
                        const batchIdx = sortedBatches.findIndex((b) => b.id === selectedBatchToDelete.id);
                        const batchNum = batchIdx >= 0 ? batchIdx + 1 : 1;
                        return `o Lote ${batchNum} (${selectedBatchToDelete.quantity} un.) do produto "${productToDelete.name}"`;
                    }
                    return `o produto "${productToDelete.name}"`;
                })()}
                loading={deleteProductMutation.isPending || deleteProductBatchMutation.isPending}
                error={deleteError}
            />
        </Stack>
    );
}

