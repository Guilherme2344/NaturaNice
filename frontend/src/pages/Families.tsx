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

    // mutation used due to database modification
    const createFamilyMutation = useCreateFamilyMutation();
    const updateFamilyMutation = useUpdateFamilyMutation();
    const deleteFamilyMutation = useDeleteFamilyMutation();

    const [modalOpened, setModalOpened] = useState(false);
    const [selectedFamily, setSelectedFamily] = useState<Entity | null>(null);

    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [familyToDelete, setFamilyToDelete] = useState<Entity | null>(null);

    // friendly success message
    const [successMessage, setSuccessMessage] = useState('');

    const handleOpenAdd = () => {
        setSelectedFamily(null);
        setModalOpened(true);
    };

    const handleOpenEdit = (family: Entity) => {
        setSelectedFamily(family);
        setModalOpened(true);
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

    const handleOpenDelete = (id: number) => {
        const family = families.find((f) => f.id === id);
        if (family) {
            setFamilyToDelete(family);
            setDeleteModalOpened(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (!familyToDelete) return;
        try {
            setSuccessMessage('');
            await deleteFamilyMutation.mutateAsync(familyToDelete.id);
            setDeleteModalOpened(false);
            setSuccessMessage(
                `Família "${familyToDelete.name}" excluída com sucesso!`
            );
            setFamilyToDelete(null);
        } catch (err: any) {
            console.error('Erro ao excluir família:', err);
        }
    };

    return (
        <Stack gap="md">
            {successMessage && (
                <Alert
                    icon={<CheckCircle2 size={18} />}
                    color="blue"
                    radius="md"
                    withCloseButton
                    onClose={() => setSuccessMessage('')}
                >
                    {successMessage}
                </Alert>
            )}

            <EntityTable
                title="Famílias"
                subtitle="Famílias e subgrupos de produtos cadastrados"
                items={families}
                loading={loadingFamilies}
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
                loading={deleteFamilyMutation.isPending}
            />
        </Stack>
    );
}
