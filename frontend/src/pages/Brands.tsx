import { useEffect, useState } from 'react';
import EntityTable from '../components/EntityTable';
import type { Entity } from '../components/EntityTable';
import { EntityModal } from '../components/EntityModal';
import { entityService } from '../services/entityService';

export default function Brands() {
    const [brands, setBrands] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados de Modal
    const [modalOpened, setModalOpened] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState<Entity | null>(null);

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

    const handleOpenAdd = () => {
        setSelectedBrand(null);
        setModalOpened(true);
    };

    const handleOpenEdit = (item: Entity) => {
        setSelectedBrand(item);
        setModalOpened(true);
    };

    const handleSubmit = async (values: {
        name: string;
        hexColor?: string;
    }) => {
        if (selectedBrand) {
            // Executa o PUT
            await entityService.updateBrand(selectedBrand.id, values);
        } else {
            // Executa o POST
            await entityService.createBrand(values);
        }
        await fetchBrands();
    };

    return (
        <>
            <EntityTable
                title="Marcas"
                subtitle="Marcas cadastradas no estoque"
                items={brands}
                loading={loading}
                showColor={true}
                onAdd={handleOpenAdd}
                onEdit={handleOpenEdit}
            />

            <EntityModal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title={selectedBrand ? 'Editar Marca' : 'Cadastrar Nova Marca'}
                showColor={true}
                initialData={selectedBrand}
                onSubmit={handleSubmit}
            />
        </>
    );
}
