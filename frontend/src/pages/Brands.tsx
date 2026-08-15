import EntityTable from '../components/EntityTable';
import { type Entity } from '../components/EntityTable';

const mockBrands: Entity[] = [
    { id: 1, name: 'Natura', color: '#E65100' },
    { id: 2, name: 'O Boticário', color: '#2E7D32' },
    { id: 3, name: 'Avon', color: '#C2185B' },
];

export default function Brands() {
    return (
        <EntityTable
            title="Marcas"
            subtitle="Gerenciamento de marcas e suas cores de identificação"
            items={mockBrands}
            showColor={true} // Ativa a exibição do ColorSwatch
            onAdd={() => console.log('Nova Marca')}
            onEdit={(brand) => console.log('Editar:', brand)}
            onDelete={(id) => console.log('Excluir ID:', id)}
        />
    );
}
