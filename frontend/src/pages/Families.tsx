import { useEffect, useState } from 'react';
import EntityTable from '../components/EntityTable';
import type { Entity } from '../components/EntityTable';
import { EntityModal } from '../components/EntityModal';
import { DeleteModal } from '../components/DeleteModal';
import { entityService } from '../services/entityService';

export default function Families() {
    const [families, setFamilies] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados do Modal de Formulário (POST / PUT)
    const [modalOpened, setModalOpened] = useState(false);
    const [selectedFamily, setSelectedFamily] = useState<Entity | null>(null);

    // Estados do Modal de Confirmação de Exclusão (DELETE)
    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [familyToDelete, setFamilyToDelete] = useState<Entity | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Busca a lista de famílias do backend
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

    // Abertura do modal para Cadastro
    const handleOpenAdd = () => {
        setSelectedFamily(null);
        setModalOpened(true);
    };

    // Abertura do modal para Edição
    const handleOpenEdit = (family: Entity) => {
        setSelectedFamily(family);
        setModalOpened(true);
    };

    // Submissão do formulário (Decide entre POST e PUT)
    const handleSubmit = async (values: { name: string }) => {
        if (selectedFamily) {
            // PUT
            await entityService.updateFamily(selectedFamily.id, values);
        } else {
            // POST
            await entityService.createFamily(values);
        }
        await fetchFamilies();
    };

    // Abertura do modal de confirmação de exclusão
    const handleOpenDelete = (id: number) => {
        const family = families.find((f) => f.id === id);
        if (family) {
            setFamilyToDelete(family);
            setDeleteModalOpened(true);
        }
    };

    // Confirmação de exclusão (DELETE)
    const handleConfirmDelete = async () => {
        if (!familyToDelete) return;
        try {
            setDeleteLoading(true);
            await entityService.deleteFamily(familyToDelete.id);
            setDeleteModalOpened(false);
            await fetchFamilies();
        } catch (err: any) {
            alert(
                'Erro ao excluir família: ' +
                    (err.response?.data?.message ||
                        'Verifique se não existem produtos vinculados a esta família.')
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <>
            <EntityTable
                title="Famílias"
                subtitle="Famílias e subgrupos de produtos cadastrados"
                items={families}
                loading={loading}
                showColor={false}
                onAdd={handleOpenAdd}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
            />

            <EntityModal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title={
                    selectedFamily ? 'Editar Família' : 'Cadastrar Nova Família'
                }
                showColor={false}
                initialData={selectedFamily}
                onSubmit={handleSubmit}
            />

            <DeleteModal
                opened={deleteModalOpened}
                onClose={() => setDeleteModalOpened(false)}
                onConfirm={handleConfirmDelete}
                itemDescription={
                    familyToDelete?.name
                        ? `a família "${familyToDelete.name}"`
                        : 'esta família'
                }
                loading={deleteLoading}
            />
        </>
    );
}
