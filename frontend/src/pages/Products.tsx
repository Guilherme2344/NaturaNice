import { useEffect, useState } from 'react';
import ProductsTable, { type Product } from '../components/ProductsTable';
import { ProductModal } from '../components/ProductModal';
import { SaleModal } from '../components/SaleModal';
import { DeleteModal } from '../components/DeleteModal';
import {
    productService,
    type CreateProductDTO,
} from '../services/productService';
import { saleService } from '../services/saleService';
import { entityService } from '../services/entityService';
import type { Entity } from '../components/EntityTable';

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [brands, setBrands] = useState<Entity[]>([]);
    const [categories, setCategories] = useState<Entity[]>([]);
    const [families, setFamilies] = useState<Entity[]>([]);

    const [loading, setLoading] = useState(true);
    const [modalOpened, setModalOpened] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null
    );

    const [saleModalOpened, setSaleModalOpened] = useState(false);
    const [productToSell, setProductToSell] = useState<Product | null>(null);

    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodsData, brandsData, categoriesData, familiesData] =
                await Promise.all([
                    productService.getAll(),
                    entityService.getBrands(),
                    entityService.getCategories(),
                    entityService.getFamilies(),
                ]);

            setProducts(prodsData);
            setBrands(brandsData);
            setCategories(categoriesData);
            setFamilies(familiesData);
        } catch (err) {
            console.error('Erro ao buscar dados:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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
        if (selectedProduct) {
            await productService.update(selectedProduct.id, data);
        } else {
            await productService.create(data);
        }
        await fetchData();
    };

    const handleConfirmSale = async (quantity: number, sellingPrice: number, customerName?: string) => {
        if (!productToSell) return;
        await saleService.createSale({
            productId: productToSell.id,
            quantity,
            sellingPrice,
            customerName,
        });
        await fetchData();
    };

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;
        try {
            setDeleting(true);
            await productService.delete(productToDelete.id);
            setDeleteModalOpened(false);
            setProductToDelete(null);
            await fetchData();
        } catch (err) {
            console.error('Erro ao excluir produto:', err);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <ProductsTable
                title="Todos os Produtos"
                products={products}
                loading={loading}
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
                itemDescription={productToDelete ? `o produto "${productToDelete.name}"` : 'este produto'}
                loading={deleting}
            />
        </>
    );
}
