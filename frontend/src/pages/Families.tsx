import { useEffect, useState } from 'react';
import EntityTable from '../components/EntityTable';
import type { Entity } from '../components/EntityTable';
import { EntityModal } from '../components/EntityModal';
import { entityService } from '../services/entityService';

export default function Families() {
    const [families, setFamilies] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpened, setModalOpened] = useState(false);

    const fetchFamilies = async () => {
        try {
            setLoading(true);
            const data = await entityService.getFamilies();
            setFamilies(data);
        } catch (err) {
            console.error('Erro ao buscar famílias:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFamilies();
    }, []);

    const handleCreate = async (values: { name: string }) => {
        await entityService.createFamily(values);
        await fetchFamilies();
    };

    return (
        <>
            <EntityTable
                title="Famílias"
                subtitle="Famílias e subgrupos de produtos"
                items={families}
                loading={loading}
                showColor={false}
                onAdd={() => setModalOpened(true)}
            />

            <EntityModal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title="Cadastrar Nova Família"
                showColor={false}
                onSubmit={handleCreate}
            />
        </>
    );
}
