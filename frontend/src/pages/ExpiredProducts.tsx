import ProductsTable, { type Product } from '../components/ProductsTable';

const mockExpired: Product[] = [
    {
        id: 3,
        name: 'Creme Noturno Nutritivo',
        brand: { id: 12, name: 'Avon', color: '#C2185B' },
        category: { id: 1, name: 'Cuidados com a Pele' },
        family: { id: 4, name: 'Cremes' },
        quantity: 8,
        expirationDate: '2026-07-15',
        sellingPrice: 42.0,
        expirationStatus: 'EXPIRED',
        expirationStatusDescription: 'Vencido',
    },
];

export default function ExpiredProducts() {
    return (
        <ProductsTable
            title="Produtos Vencidos"
            subtitle="Itens fora do prazo de validade que devem ser descartados/separados"
            products={mockExpired}
            onEdit={(p) => console.log('Editar:', p)}
            onDelete={(id) => console.log('Excluir:', id)}
        />
    );
}
