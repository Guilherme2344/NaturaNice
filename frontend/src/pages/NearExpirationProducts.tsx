import { useEffect, useState } from 'react';
import ProductsTable, { type Product } from '../components/ProductsTable';
import { productService } from '../services/productService';

export default function NearExpirationProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <ProductsTable
            title="Produtos Perto de Vencer"
            subtitle="Itens com data de validade próxima que exigem atenção"
            products={products}
            loading={loading}
            onEdit={(p) => console.log('Editar:', p)}
            onDelete={(id) => console.log('Excluir:', id)}
        />
    );
}
