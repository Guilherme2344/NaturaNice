import { useState } from 'react';
import { Alert, Stack } from '@mantine/core';
import { CheckCircle2 } from 'lucide-react';
import ProductsTable, { type Product } from '../components/ProductsTable';
import { ProductModal } from '../components/ProductModal';
import { SaleModal } from '../components/SaleModal';
import { DeleteModal } from '../components/DeleteModal';
import type { CreateProductDTO } from '../services/productService';
import {
    useProductsQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useCreateSaleMutation,
} from '../hooks/useProductsQuery';
import {
    useBrandsQuery,
    useCategoriesQuery,
    useFamiliesQuery,
} from '../hooks/useEntitiesQuery';

export default function Products() {
    const { data: products = [], isLoading: loadingProducts } =
        useProductsQuery();
    const { data: brands = [] } = useBrandsQuery();
    const { data: categories = [] } = useCategoriesQuery();
    const { data: families = [] } = useFamiliesQuery();

    // mutation used due to database modification
    const createProductMutation = useCreateProductMutation();
    const updateProductMutation = useUpdateProductMutation();
    const deleteProductMutation = useDeleteProductMutation();
    const createSaleMutation = useCreateSaleMutation();

    const [modalOpened, setModalOpened] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null
    );

    const [saleModalOpened, setSaleModalOpened] = useState(false);
    const [productToSell, setProductToSell] = useState<Product | null>(null);

    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(
        null
    );

    // friendly success message
    const [successMessage, setSuccessMessage] = useState('');

    const handleOpenAdd = () => {
        setSelectedProduct(null);
        setModalOpened(true);
    };

    const handleOpenEdit = (product: Product) => {
        setSelectedProduct(product);
        setModalOpened(true);
    };

    const handleOpenSale = (product: Product) => {
        setProductToSell(product);
        setSaleModalOpened(true);
    };

    const handleOpenDelete = (id: number) => {
        const prod = products.find((p) => p.id === id);
        if (prod) {
            setProductToDelete(prod);
            setDeleteModalOpened(true);
        }
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

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;
        try {
            setSuccessMessage('');
            await deleteProductMutation.mutateAsync(productToDelete.id);
            setDeleteModalOpened(false);
            setSuccessMessage(
                `Produto "${productToDelete.name}" excluído com sucesso!`
            );
            setProductToDelete(null);
        } catch (err) {
            console.error('Erro ao excluir produto:', err);
        }
    };

    return (
        <Stack gap="md">
            {successMessage && (
                <Alert
                    icon={<CheckCircle2 size={18} />}
                    color="blue"
                    radius="md"
                    withCloseButton
                    onClose={() => setSuccessMessage('')}
                >
                    {successMessage}
                </Alert>
            )}

            <ProductsTable
                title="Produtos"
                products={products}
                loading={loadingProducts}
                onAdd={handleOpenAdd}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                onSale={handleOpenSale}
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
                product={productToSell}
                onConfirmSale={handleConfirmSale}
            />

            <DeleteModal
                opened={deleteModalOpened}
                onClose={() => setDeleteModalOpened(false)}
                onConfirm={handleConfirmDelete}
                title="Excluir Produto"
                itemDescription={
                    productToDelete
                        ? `o produto "${productToDelete.name}"`
                        : 'este produto'
                }
                loading={deleteProductMutation.isPending}
            />
        </Stack>
    );
}
