import { useEffect, useState } from 'react';
import EntityTable from '../components/EntityTable';
import type { Entity } from '../components/EntityTable';
import { EntityModal } from '../components/EntityModal';
import { entityService } from '../services/entityService';

export default function Categories() {
    const [categories, setCategories] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpened, setModalOpened] = useState(false);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await entityService.getCategories();
            setCategories(data);
        } catch (err) {
            console.error('Erro ao buscar categorias:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreate = async (values: { name: string }) => {
        await entityService.createCategory(values);
        await fetchCategories();
    };

    return (
        <>
            <EntityTable
                title="Categorias"
                subtitle="Categorias do estoque"
                items={categories}
                loading={loading}
                showColor={false}
                onAdd={() => setModalOpened(true)}
            />

            <EntityModal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title="Cadastrar Nova Categoria"
                showColor={false}
                onSubmit={handleCreate}
            />
        </>
    );
}
