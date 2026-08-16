import { useEffect, useState } from 'react';
import EntityTable from '../components/EntityTable';
import type { Entity } from '../components/EntityTable';
import { EntityModal } from '../components/EntityModal';
import { entityService } from '../services/entityService';

export default function Brands() {
    const [brands, setBrands] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpened, setModalOpened] = useState(false);

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const data = await entityService.getBrands();
            setBrands(data);
        } catch (err) {
            console.error('Erro ao buscar marcas:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const handleCreate = async (values: {
        name: string;
        hexColor?: string;
    }) => {
        await entityService.createBrand(values);
        await fetchBrands(); // Recarrega a tabela após cadastrar
    };

    return (
        <>
            <EntityTable
                title="Marcas"
                subtitle="Marcas cadastradas no estoque"
                items={brands}
                loading={loading}
                showColor={true}
                onAdd={() => setModalOpened(true)}
            />

            <EntityModal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title="Cadastrar Nova Marca"
                showColor={true}
                onSubmit={handleCreate}
            />
        </>
    );
}
