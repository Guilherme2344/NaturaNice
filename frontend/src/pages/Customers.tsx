import { useState } from 'react';
import { Alert, Stack } from '@mantine/core';
import { CheckCircle2 } from 'lucide-react';
import EntityTable from '../components/EntityTable';
import type { Entity } from '../components/EntityTable';
import { EntityModal } from '../components/EntityModal';
import { DeleteModal } from '../components/DeleteModal';
import {
    useCustomersQuery,
    useCreateCustomerMutation,
    useUpdateCustomerMutation,
    useDeleteCustomerMutation,
} from '../hooks/useEntitiesQuery';

export default function Customers() {
    const { data: customers = [], isLoading: loadingCustomers } = useCustomersQuery();

    // mutations for database operations
    const createCustomerMutation = useCreateCustomerMutation();
    const updateCustomerMutation = useUpdateCustomerMutation();
    const deleteCustomerMutation = useDeleteCustomerMutation();

    // Modal states
    const [modalOpened, setModalOpened] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Entity | null>(null);

    // Delete states
    const [deleteOpened, setDeleteOpened] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<Entity | null>(null);
    const [deleteError, setDeleteError] = useState('');

    // friendly success message
    const [successMessage, setSuccessMessage] = useState('');

    const handleOpenAdd = () => {
        setSelectedCustomer(null);
        setModalOpened(true);
    };

    const handleOpenEdit = (item: Entity) => {
        setSelectedCustomer(item);
        setModalOpened(true);
    };

    const handleOpenDelete = (id: number) => {
        const item = customers.find((c) => c.id === id);
        if (item) {
            setCustomerToDelete(item);
            setDeleteError('');
            setDeleteOpened(true);
        }
    };

    // asynchronous operations
    const handleSubmit = async (values: {
        name: string;
    }) => {
        setSuccessMessage('');
        if (selectedCustomer) {
            await updateCustomerMutation.mutateAsync({
                id: selectedCustomer.id,
                data: values,
            });
            setSuccessMessage(`Cliente "${values.name}" atualizado com sucesso!`);
        } else {
            await createCustomerMutation.mutateAsync(values);
            setSuccessMessage(`Cliente "${values.name}" cadastrado com sucesso!`);
        }
    };

    const handleConfirmDelete = async () => {
        if (!customerToDelete) return;
        try {
            setSuccessMessage('');
            setDeleteError('');
            await deleteCustomerMutation.mutateAsync(customerToDelete.id);
            setDeleteOpened(false);
            setSuccessMessage(
                `Cliente "${customerToDelete.name}" excluído com sucesso!`
            );
            setCustomerToDelete(null);
        } catch (err: any) {
            if (err?.response?.status === 409) {
                const serverMsg = err?.response?.data?.details || err?.response?.data?.message;
                setDeleteError(
                    serverMsg || 'Não é possível excluir este cliente pois existem vendas associadas a ele.'
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
                title="Clientes"
                subtitle="Clientes cadastrados no sistema"
                addButtonLabel="Novo Cliente"
                items={customers}
                loading={loadingCustomers}
                showColor={false}
                onAdd={handleOpenAdd}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
            />

            <EntityModal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title={selectedCustomer ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
                showColor={false}
                initialData={selectedCustomer}
                onSubmit={handleSubmit}
            />

            <DeleteModal
                opened={deleteOpened}
                onClose={() => setDeleteOpened(false)}
                onConfirm={handleConfirmDelete}
                title="Excluir Cliente"
                itemDescription={
                    customerToDelete
                        ? `o cliente "${customerToDelete.name}"`
                        : 'este cliente'
                }
                loading={deleteCustomerMutation.isPending}
                error={deleteError}
            />
        </Stack>
    );
}
