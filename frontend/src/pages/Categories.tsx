import EntityTable from '../components/EntityTable';
import { type Entity } from '../components/EntityTable';

const mockCategories: Entity[] = [
    { id: 1, name: 'Cuidados com a Pele' },
    { id: 2, name: 'Maquiagem' },
    { id: 3, name: 'Perfumaria' },
];

export default function Categories() {
    return (
        <EntityTable
            title="Categorias"
            subtitle="Categorias principais do estoque"
            items={mockCategories}
            showColor={false}
            onAdd={() => console.log('Nova Categoria')}
            onEdit={(category) => console.log('Editar:', category)}
            onDelete={(id) => console.log('Excluir ID:', id)}
        />
    );
}
