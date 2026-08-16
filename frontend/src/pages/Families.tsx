import { useEffect, useState } from 'react';
import EntityTable from '../components/EntityTable';
import type { Entity } from '../components/EntityTable';
import { EntityModal } from '../components/EntityModal';
import { DeleteModal } from '../components/DeleteModal';
import { entityService } from '../services/entityService';

export default function Families() {
    const [families, setFamilies] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpened, setModalOpened] = useState(false);

    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [selectedFamily, setSelectedFamily] = useState<Entity | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

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

    const handleOpenDelete = (id: number) => {
        const family = families.find((f) => f.id === id);
        if (family) {
            setSelectedFamily(family);
            setDeleteModalOpened(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedFamily) return;
        try {
            setDeleteLoading(true);
            await entityService.deleteFamily(selectedFamily.id);
            setDeleteModalOpened(false);
            await fetchFamilies();
        } catch (err: any) {
            alert(
                'Erro ao excluir família: ' +
                    (err.response?.data?.message ||
                        'Verifique se existem produtos vinculados.')
            );
        } finally {
            setDeleteLoading(false);
        }
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
                onDelete={handleOpenDelete}
            />

            <EntityModal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title="Cadastrar Nova Família"
                showColor={false}
                onSubmit={handleCreate}
            />

            <DeleteModal
                opened={deleteModalOpened}
                onClose={() => setDeleteModalOpened(false)}
                onConfirm={handleConfirmDelete}
                itemDescription={
                    selectedFamily?.name
                        ? `a família "${selectedFamily.name}"`
                        : 'esta família'
                }
                loading={deleteLoading}
            />
        </>
    );
}
