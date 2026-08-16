import { useEffect, useState } from 'react';
import ProductsTable, { type Product } from '../components/ProductsTable';
import { ProductModal } from '../components/ProductModal';
import {
    productService,
    type CreateProductDTO,
} from '../services/productService';
import type { Entity } from '../components/EntityTable';
import { entityService } from '../services/entityService';

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [brands, setBrands] = useState<Entity[]>([]);
    const [categories, setCategories] = useState<Entity[]>([]);
    const [families, setFamilies] = useState<Entity[]>([]);

    const [loading, setLoading] = useState(true);
    const [modalOpened, setModalOpened] = useState(false);

    // Busca dados de produtos e os selects de marcas, categorias e famílias
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
            console.error('Erro ao buscar dados do servidor:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateProduct = async (data: CreateProductDTO) => {
        await productService.create(data);
        await fetchData(); // Recarrega os produtos na tabela após o POST
    };

    const handleDeleteProduct = async (id: number) => {
        if (confirm('Deseja realmente excluir este produto?')) {
            try {
                await productService.delete(id);
                await fetchData();
            } catch (err) {
                alert('Erro ao excluir produto.');
            }
        }
    };

    return (
        <>
            <ProductsTable
                title="Todos os Produtos"
                subtitle="Listagem geral dos itens cadastrados no sistema"
                products={products}
                loading={loading}
                onAdd={() => setModalOpened(true)}
                onDelete={handleDeleteProduct}
            />

            <ProductModal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                brands={brands}
                categories={categories}
                families={families}
                onSubmit={handleCreateProduct}
            />
        </>
    );
}
