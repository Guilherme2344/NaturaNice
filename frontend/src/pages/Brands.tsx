import { useState } from 'react';
import { Alert, Stack } from '@mantine/core';
import { CheckCircle2 } from 'lucide-react';
import EntityTable from '../components/EntityTable';
import type { Entity } from '../components/EntityTable';
import { EntityModal } from '../components/EntityModal';
import { DeleteModal } from '../components/DeleteModal';
import {
    useBrandsQuery,
    useCreateBrandMutation,
    useUpdateBrandMutation,
    useDeleteBrandMutation,
} from '../hooks/useEntitiesQuery';

export default function Brands() {
    const { data: brands = [], isLoading: loadingBrands } = useBrandsQuery();

    const createBrandMutation = useCreateBrandMutation();
    const updateBrandMutation = useUpdateBrandMutation();
    const deleteBrandMutation = useDeleteBrandMutation();

    // Estados de Modal
    const [modalOpened, setModalOpened] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState<Entity | null>(null);

    // Estado de Exclusão
    const [deleteOpened, setDeleteOpened] = useState(false);
    const [brandToDelete, setBrandToDelete] = useState<Entity | null>(null);

    // Mensagem Amigável de Sucesso
    const [successMessage, setSuccessMessage] = useState('');

    const handleOpenAdd = () => {
        setSelectedBrand(null);
        setModalOpened(true);
    };

    const handleOpenEdit = (item: Entity) => {
        setSelectedBrand(item);
        setModalOpened(true);
    };

    const handleOpenDelete = (id: number) => {
        const item = brands.find((b) => b.id === id);
        if (item) {
            setBrandToDelete(item);
            setDeleteOpened(true);
        }
    };

    const handleSubmit = async (values: { name: string; hexColor?: string }) => {
        setSuccessMessage('');
        if (selectedBrand) {
            await updateBrandMutation.mutateAsync({ id: selectedBrand.id, data: values });
            setSuccessMessage(`Marca "${values.name}" atualizada com sucesso!`);
        } else {
            await createBrandMutation.mutateAsync(values);
            setSuccessMessage(`Marca "${values.name}" cadastrada com sucesso!`);
        }
    };

    const handleConfirmDelete = async () => {
        if (!brandToDelete) return;
        try {
            setSuccessMessage('');
            await deleteBrandMutation.mutateAsync(brandToDelete.id);
            setDeleteOpened(false);
            setSuccessMessage(`Marca "${brandToDelete.name}" excluída com sucesso!`);
            setBrandToDelete(null);
        } catch (err) {
            console.error('Erro ao excluir marca:', err);
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
                title="Marcas"
                subtitle="Marcas cadastradas no estoque"
                items={brands}
                loading={loadingBrands}
                showColor={true}
                onAdd={handleOpenAdd}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
            />

            <EntityModal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title={selectedBrand ? 'Editar Marca' : 'Cadastrar Nova Marca'}
                showColor={true}
                initialData={selectedBrand}
                onSubmit={handleSubmit}
            />

            <DeleteModal
                opened={deleteOpened}
                onClose={() => setDeleteOpened(false)}
                onConfirm={handleConfirmDelete}
                title="Excluir Marca"
                itemDescription={brandToDelete ? `a marca "${brandToDelete.name}"` : 'esta marca'}
                loading={deleteBrandMutation.isPending}
            />
        </Stack>
    );
}
