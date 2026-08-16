import { useEffect, useState } from 'react';
import ProductsTable, { type Product } from '../components/ProductsTable';
import { ProductModal } from '../components/ProductModal';
import {
    productService,
    type CreateProductDTO,
} from '../services/productService';
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

    const handleSubmitProduct = async (data: CreateProductDTO) => {
        if (selectedProduct) {
            // Executa o PUT
            await productService.update(selectedProduct.id, data);
        } else {
            // Executa o POST
            await productService.create(data);
        }
        await fetchData();
    };

    return (
        <>
            <ProductsTable
                title="Todos os Produtos"
                products={products}
                loading={loading}
                onAdd={handleOpenAdd}
                onEdit={handleOpenEdit}
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
        </>
    );
}
