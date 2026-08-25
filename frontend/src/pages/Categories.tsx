import { useState } from 'react';
import { Alert, Stack } from '@mantine/core';
import { CheckCircle2 } from 'lucide-react';
import EntityTable from '../components/EntityTable';
import type { Entity } from '../components/EntityTable';
import { EntityModal } from '../components/EntityModal';
import { DeleteModal } from '../components/DeleteModal';
import {
    useCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} from '../hooks/useEntitiesQuery';

export default function Categories() {
    const { data: categories = [], isLoading: loadingCategories } =
        useCategoriesQuery();

    const createCategoryMutation = useCreateCategoryMutation();
    const updateCategoryMutation = useUpdateCategoryMutation();
    const deleteCategoryMutation = useDeleteCategoryMutation();

    const [modalOpened, setModalOpened] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Entity | null>(
        null
    );

    const [deleteOpened, setDeleteOpened] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Entity | null>(
        null
    );
    const [deleteError, setDeleteError] = useState('');

    const [successMessage, setSuccessMessage] = useState('');

    const handleOpenAdd = () => {
        setSelectedCategory(null);
        setModalOpened(true);
    };

    const handleOpenEdit = (item: Entity) => {
        setSelectedCategory(item);
        setModalOpened(true);
    };

    const handleOpenDelete = (id: number) => {
        const item = categories.find((c) => c.id === id);
        if (item) {
            setCategoryToDelete(item);
            setDeleteError('');
            setDeleteOpened(true);
        }
    };

    const handleSubmit = async (values: { name: string }) => {
        setSuccessMessage('');
        if (selectedCategory) {
            await updateCategoryMutation.mutateAsync({
                id: selectedCategory.id,
                data: values,
            });
            setSuccessMessage(
                `Categoria "${values.name}" atualizada com sucesso!`
            );
        } else {
            await createCategoryMutation.mutateAsync(values);
            setSuccessMessage(
                `Categoria "${values.name}" cadastrada com sucesso!`
            );
        }
    };

    const handleConfirmDelete = async () => {
        if (!categoryToDelete) return;
        try {
            setSuccessMessage('');
            setDeleteError('');
            await deleteCategoryMutation.mutateAsync(categoryToDelete.id);
            setDeleteOpened(false);
            setSuccessMessage(
                `Categoria "${categoryToDelete.name}" excluída com sucesso!`
            );
            setCategoryToDelete(null);
        } catch (err: any) {
            if (err?.response?.status === 409) {
                const serverMsg = err?.response?.data?.details || err?.response?.data?.message;
                setDeleteError(
                    serverMsg || 'Não é possível excluir esta categoria pois existem produtos associados a ela.'
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
                title="Categorias"
                subtitle="Categorias de produtos no estoque"
                addButtonLabel="Nova Categoria"
                items={categories}
                loading={loadingCategories}
                onAdd={handleOpenAdd}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
            />

            <EntityModal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title={
                    selectedCategory
                        ? 'Editar Categoria'
                        : 'Cadastrar Nova Categoria'
                }
                initialData={selectedCategory}
                onSubmit={handleSubmit}
            />

            <DeleteModal
                opened={deleteOpened}
                onClose={() => setDeleteOpened(false)}
                onConfirm={handleConfirmDelete}
                title="Excluir Categoria"
                itemDescription={
                    categoryToDelete
                        ? `a categoria "${categoryToDelete.name}"`
                        : 'esta categoria'
                }
                loading={deleteCategoryMutation.isPending}
                error={deleteError}
            />
        </Stack>
    );
}
