import { useEffect, useState } from 'react';
import ProductsTable, { type Product } from '../components/ProductsTable';
import { productService } from '../services/productService';

export default function ExpiredProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getExpired();
            setProducts(data);
        } catch (err) {
            console.error('Erro ao buscar produtos vencidos:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <ProductsTable
            title="Produtos Vencidos"
            subtitle="Itens com data expirada que devem ser separados/descartados"
            products={products}
            loading={loading}
            onEdit={(p) => console.log('Editar:', p)}
            onDelete={(id) => console.log('Excluir:', id)}
        />
    );
}
