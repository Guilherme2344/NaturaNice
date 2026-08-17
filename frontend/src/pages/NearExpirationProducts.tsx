import { useEffect, useState } from 'react';
import ProductsTable, { type Product } from '../components/ProductsTable';
import { DeleteModal } from '../components/DeleteModal';
import { productService } from '../services/productService';

export default function NearExpirationProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getNearExpiration();
            setProducts(data);
        } catch (err) {
            console.error('Erro ao buscar produtos perto de vencer:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleOpenDelete = (id: number) => {
        const prod = products.find((p) => p.id === id);
        if (prod) {
            setProductToDelete(prod);
            setDeleteModalOpened(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;
        try {
            setDeleting(true);
            await productService.delete(productToDelete.id);
            setDeleteModalOpened(false);
            setProductToDelete(null);
            await fetchProducts();
        } catch (err) {
            console.error('Erro ao excluir produto:', err);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <ProductsTable
                title="Produtos Perto de Vencer"
                subtitle="Itens com data de validade próxima que exigem atenção"
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
                loading={deleting}
            />
        </>
    );
}
