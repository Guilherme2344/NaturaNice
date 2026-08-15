import EntityTable from '../components/EntityTable';
import { type Entity } from '../components/EntityTable';

const mockFamilies: Entity[] = [
    { id: 1, name: 'Séruns e Tratamentos' },
    { id: 2, name: 'Batom e Lábios' },
    { id: 3, name: 'Hidratantes Corporais' },
];

export default function Families() {
    return (
        <EntityTable
            title="Famílias"
            subtitle="Subgrupos de produtos"
            items={mockFamilies}
            showColor={false}
            onAdd={() => console.log('Nova Família')}
            onEdit={(family) => console.log('Editar:', family)}
            onDelete={(id) => console.log('Excluir ID:', id)}
        />
    );
}
