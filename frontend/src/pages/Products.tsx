import ProductsTable, { type Product } from '../components/ProductsTable';

const mockProducts: Product[] = [
    {
        id: 1,
        name: 'Sérum Preenchedor Facial',
        brand: { id: 10, name: 'Natura', color: '#E65100' },
        category: { id: 1, name: 'Cuidados com a Pele' },
        family: { id: 2, name: 'Séruns' },
        quantity: 15,
        expirationDate: '2026-09-20',
        sellingPrice: 89.9,
        expirationStatus: 'NEAR_EXPIRATION',
        expirationStatusDescription: 'Perto de Vencer',
    },
];

export default function Products() {
    return (
        <ProductsTable
            title="Todos os Produtos"
            subtitle="Listagem geral do estoque"
            products={mockProducts}
            onAdd={() => console.log('Novo produto')}
            onEdit={(p) => console.log('Editar:', p)}
            onDelete={(id) => console.log('Excluir:', id)}
        />
    );
}
