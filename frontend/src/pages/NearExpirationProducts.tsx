import ProductsTable, { type Product } from '../components/ProductsTable';

const mockNearExpiration: Product[] = [
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

export default function NearExpirationProducts() {
    return (
        <ProductsTable
            title="Produtos À Vencer"
            subtitle="Itens que exigem atenção devido ao prazo de validade"
            products={mockNearExpiration}
            onEdit={(p) => console.log('Editar:', p)}
            onDelete={(id) => console.log('Excluir:', id)}
        />
    );
}
