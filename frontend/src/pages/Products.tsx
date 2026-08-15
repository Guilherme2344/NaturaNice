import { useEffect, useState } from 'react';
import ProductsTable, { type Product } from '../components/ProductsTable';
import { productService } from '../services/productService';

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <ProductsTable
            title="Todos os Produtos"
            subtitle="Listagem geral dos itens no estoque"
            products={products}
            loading={loading}
            onAdd={() => console.log('Novo produto')}
            onEdit={(p) => console.log('Editar:', p)}
            onDelete={(id) => console.log('Excluir:', id)}
        />
    );
}
