import { useState } from 'react';
import { Alert, Stack } from '@mantine/core';
import { CheckCircle2 } from 'lucide-react';
import EntityTable from '../components/EntityTable';
import type { Entity } from '../components/EntityTable';
import { EntityModal } from '../components/EntityModal';
import { DeleteModal } from '../components/DeleteModal';
import {
    useFamiliesQuery,
    useCreateFamilyMutation,
    useUpdateFamilyMutation,
    useDeleteFamilyMutation,
} from '../hooks/useEntitiesQuery';

export default function Families() {
    const { data: families = [], isLoading: loadingFamilies } =
        useFamiliesQuery();

    const createFamilyMutation = useCreateFamilyMutation();
    const updateFamilyMutation = useUpdateFamilyMutation();
    const deleteFamilyMutation = useDeleteFamilyMutation();

    const [modalOpened, setModalOpened] = useState(false);
    const [selectedFamily, setSelectedFamily] = useState<Entity | null>(null);

    const [deleteOpened, setDeleteOpened] = useState(false);
    const [familyToDelete, setFamilyToDelete] = useState<Entity | null>(null);
    const [deleteError, setDeleteError] = useState('');

    const [successMessage, setSuccessMessage] = useState('');

    const handleOpenAdd = () => {
        setSelectedFamily(null);
        setModalOpened(true);
    };

    const handleOpenEdit = (item: Entity) => {
        setSelectedFamily(item);
        setModalOpened(true);
    };

    const handleOpenDelete = (id: string) => {
        const item = families.find((f) => f.id === id);
        if (item) {
            setFamilyToDelete(item);
            setDeleteError('');
            setDeleteOpened(true);
        }
    };

    const handleSubmit = async (values: { name: string }) => {
        setSuccessMessage('');
        if (selectedFamily) {
            await updateFamilyMutation.mutateAsync({
                id: selectedFamily.id,
                data: values,
            });
            setSuccessMessage(
                `Família "${values.name}" atualizada com sucesso!`
            );
        } else {
            await createFamilyMutation.mutateAsync(values);
            setSuccessMessage(
                `Família "${values.name}" cadastrada com sucesso!`
            );
        }
    };

    const handleConfirmDelete = async () => {
        if (!familyToDelete) return;
        try {
            setSuccessMessage('');
            setDeleteError('');
            await deleteFamilyMutation.mutateAsync(familyToDelete.id);
            setDeleteOpened(false);
            setSuccessMessage(
                `Família "${familyToDelete.name}" excluída com sucesso!`
            );
            setFamilyToDelete(null);
        } catch (err: any) {
            if (err?.response?.status === 409) {
                const serverMsg = err?.response?.data?.details || err?.response?.data?.message;
                setDeleteError(
                    serverMsg || 'Não é possível excluir esta família pois existem produtos associados a ela.'
                );
            } else {
                setDeleteError(
                    err?.response?.data?.message || 'Erro ao excluir o registro.'
                );
            }
        }
    };

    return (
        <Stack gap="md">
            {successMessage && (
                <Alert
                    icon={<CheckCircle2 size={18} />}
                    color="teal"
                    radius="md"
                    withCloseButton
                    onClose={() => setSuccessMessage('')}
                >
                    {successMessage}
                </Alert>
            )}

            <EntityTable
                title="Famílias"
                subtitle="Famílias olfativas ou de linhas de produtos"
                addButtonLabel="Nova Família"
                items={families}
                loading={loadingFamilies}
                onAdd={handleOpenAdd}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
            />

            <EntityModal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title={
                    selectedFamily
                        ? 'Editar Família'
                        : 'Cadastrar Nova Família'
                }
                initialData={selectedFamily}
                onSubmit={handleSubmit}
            />

            <DeleteModal
                opened={deleteOpened}
                onClose={() => setDeleteOpened(false)}
                onConfirm={handleConfirmDelete}
                title="Excluir Família"
                itemDescription={
                    familyToDelete
                        ? `a família "${familyToDelete.name}"`
                        : 'esta família'
                }
                loading={deleteFamilyMutation.isPending}
                error={deleteError}
            />
        </Stack>
    );
}
