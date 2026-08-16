import { useEffect, useState } from 'react';
import ProductsTable, { type Product } from '../components/ProductsTable';
import { DeleteModal } from '../components/DeleteModal';
import { productService } from '../services/productService';

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados de Exclusão
    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null
    );
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getAll();
            setProducts(data);
        } catch (err) {
            console.error('Erro ao buscar produtos:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleOpenDelete = (id: number) => {
        const product = products.find((p) => p.id === id);
        if (product) {
            setSelectedProduct(product);
            setDeleteModalOpened(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedProduct) return;
        try {
            setDeleteLoading(true);
            await productService.delete(selectedProduct.id);
            setDeleteModalOpened(false);
            await fetchProducts();
        } catch (err: any) {
            alert(
                'Erro ao excluir produto: ' +
                    (err.response?.data?.message || err.message)
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <>
            <ProductsTable
                title="Todos os Produtos"
                subtitle="Listagem geral dos itens cadastrados no sistema"
                products={products}
                loading={loading}
                onDelete={handleOpenDelete}
            />

            <DeleteModal
                opened={deleteModalOpened}
                onClose={() => setDeleteModalOpened(false)}
                onConfirm={handleConfirmDelete}
                itemDescription={
                    selectedProduct?.name
                        ? `o produto "${selectedProduct.name}"`
                        : 'este produto'
                }
                loading={deleteLoading}
            />
        </>
    );
}
