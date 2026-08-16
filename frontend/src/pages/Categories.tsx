import { useEffect, useState } from 'react';
import EntityTable from '../components/EntityTable';
import type { Entity } from '../components/EntityTable';
import { EntityModal } from '../components/EntityModal';
import { DeleteModal } from '../components/DeleteModal';
import { entityService } from '../services/entityService';

export default function Categories() {
    const [categories, setCategories] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados do Modal de Formulário (POST / PUT)
    const [modalOpened, setModalOpened] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Entity | null>(
        null
    );

    // Estados do Modal de Confirmação de Exclusão (DELETE)
    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Entity | null>(
        null
    );
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Busca a lista de categorias do backend
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

    // Abertura do modal para Cadastro
    const handleOpenAdd = () => {
        setSelectedCategory(null);
        setModalOpened(true);
    };

    // Abertura do modal para Edição
    const handleOpenEdit = (category: Entity) => {
        setSelectedCategory(category);
        setModalOpened(true);
    };

    // Submissão do formulário (Decide entre POST e PUT)
    const handleSubmit = async (values: { name: string }) => {
        if (selectedCategory) {
            // PUT em /categories/{id}
            await entityService.updateCategory(selectedCategory.id, values);
        } else {
            // POST em /categories
            await entityService.createCategory(values);
        }
        await fetchCategories();
    };

    // Abertura do modal de confirmação de exclusão
    const handleOpenDelete = (id: number) => {
        const category = categories.find((c) => c.id === id);
        if (category) {
            setCategoryToDelete(category);
            setDeleteModalOpened(true);
        }
    };

    // Confirmação de exclusão (DELETE)
    const handleConfirmDelete = async () => {
        if (!categoryToDelete) return;
        try {
            setDeleteLoading(true);
            await entityService.deleteCategory(categoryToDelete.id);
            setDeleteModalOpened(false);
            await fetchCategories();
        } catch (err: any) {
            alert(
                'Erro ao excluir categoria: ' +
                    (err.response?.data?.message ||
                        'Verifique se não existem produtos vinculados a esta categoria.')
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <>
            <EntityTable
                title="Categorias"
                subtitle="Categorias cadastradas no sistema"
                items={categories}
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
                loading={deleteLoading}
            />
        </>
    );
}
