import { useEffect, useState } from 'react';
import EntityTable from '../components/EntityTable';
import type { Entity } from '../components/EntityTable';
import { EntityModal } from '../components/EntityModal';
import { DeleteModal } from '../components/DeleteModal';
import { entityService } from '../services/entityService';

export default function Categories() {
    const [categories, setCategories] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpened, setModalOpened] = useState(false);

    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Entity | null>(
        null
    );
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await entityService.getCategories();
            setCategories(data);
        } catch (err) {
            console.error('Erro ao buscar categorias:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreate = async (values: { name: string }) => {
        await entityService.createCategory(values);
        await fetchCategories();
    };

    const handleOpenDelete = (id: number) => {
        const category = categories.find((c) => c.id === id);
        if (category) {
            setSelectedCategory(category);
            setDeleteModalOpened(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedCategory) return;
        try {
            setDeleteLoading(true);
            await entityService.deleteCategory(selectedCategory.id);
            setDeleteModalOpened(false);
            await fetchCategories();
        } catch (err: any) {
            alert(
                'Erro ao excluir categoria: ' +
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
                title="Categorias"
                subtitle="Categorias do estoque"
                items={categories}
                loading={loading}
                showColor={false}
                onAdd={() => setModalOpened(true)}
                onDelete={handleOpenDelete}
            />

            <EntityModal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title="Cadastrar Nova Categoria"
                showColor={false}
                onSubmit={handleCreate}
            />

            <DeleteModal
                opened={deleteModalOpened}
                onClose={() => setDeleteModalOpened(false)}
                onConfirm={handleConfirmDelete}
                itemDescription={
                    selectedCategory?.name
                        ? `a categoria "${selectedCategory.name}"`
                        : 'esta categoria'
                }
                loading={deleteLoading}
            />
        </>
    );
}
