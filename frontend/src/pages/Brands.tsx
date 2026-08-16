import { useEffect, useState } from 'react';
import EntityTable from '../components/EntityTable';
import { type Entity } from '../components/EntityTable';
import { EntityModal } from '../components/EntityModal';
import { DeleteModal } from '../components/DeleteModal';
import { entityService } from '../services/entityService';

export default function Brands() {
    const [brands, setBrands] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpened, setModalOpened] = useState(false);

    // Estado para exclusão
    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState<Entity | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

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
        await fetchBrands();
    };

    const handleOpenDelete = (id: number) => {
        const brand = brands.find((b) => b.id === id);
        if (brand) {
            setSelectedBrand(brand);
            setDeleteModalOpened(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedBrand) return;
        try {
            setDeleteLoading(true);
            await entityService.deleteBrand(selectedBrand.id);
            setDeleteModalOpened(false);
            await fetchBrands();
        } catch (err: any) {
            alert(
                'Erro ao excluir marca: ' +
                    (err.response?.data?.message ||
                        'Verifique se existem produtos vinculados a esta marca.')
            );
        } finally {
            setDeleteLoading(false);
        }
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
                onDelete={handleOpenDelete}
            />

            <EntityModal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title="Cadastrar Nova Marca"
                showColor={true}
                onSubmit={handleCreate}
            />

            <DeleteModal
                opened={deleteModalOpened}
                onClose={() => setDeleteModalOpened(false)}
                onConfirm={handleConfirmDelete}
                itemDescription={
                    selectedBrand?.name
                        ? `a marca "${selectedBrand.name}"`
                        : 'esta marca'
                }
                loading={deleteLoading}
            />
        </>
    );
}
