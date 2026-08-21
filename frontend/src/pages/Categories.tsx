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

    // mutation used due to database modification
    const createCategoryMutation = useCreateCategoryMutation();
    const updateCategoryMutation = useUpdateCategoryMutation();
    const deleteCategoryMutation = useDeleteCategoryMutation();

    const [modalOpened, setModalOpened] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Entity | null>(
        null
    );

    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Entity | null>(
        null
    );

    // friendly success message
    const [successMessage, setSuccessMessage] = useState('');

    const handleOpenAdd = () => {
        setSelectedCategory(null);
        setModalOpened(true);
    };

    const handleOpenEdit = (category: Entity) => {
        setSelectedCategory(category);
        setModalOpened(true);
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

    const handleOpenDelete = (id: number) => {
        const category = categories.find((c) => c.id === id);
        if (category) {
            setCategoryToDelete(category);
            setDeleteModalOpened(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (!categoryToDelete) return;
        try {
            setSuccessMessage('');
            await deleteCategoryMutation.mutateAsync(categoryToDelete.id);
            setDeleteModalOpened(false);
            setSuccessMessage(
                `Categoria "${categoryToDelete.name}" excluída com sucesso!`
            );
            setCategoryToDelete(null);
        } catch (err: any) {
            console.error('Erro ao excluir categoria:', err);
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
                subtitle="Categorias cadastradas no sistema"
                items={categories}
                loading={loadingCategories}
                showColor={false}
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
                showColor={false}
                initialData={selectedCategory}
                onSubmit={handleSubmit}
            />

            <DeleteModal
                opened={deleteModalOpened}
                onClose={() => setDeleteModalOpened(false)}
                onConfirm={handleConfirmDelete}
                itemDescription={
                    categoryToDelete?.name
                        ? `a categoria "${categoryToDelete.name}"`
                        : 'esta categoria'
                }
                loading={deleteCategoryMutation.isPending}
            />
        </Stack>
    );
}
