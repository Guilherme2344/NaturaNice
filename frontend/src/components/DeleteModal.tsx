import { Modal, Button, Group, Text, Stack } from '@mantine/core';

interface DeleteModalProps {
    opened: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    title?: string;
    itemDescription?: string;
    loading?: boolean;
}

export function DeleteModal({
    opened,
    onClose,
    onConfirm,
    title = 'Confirmar Exclusão',
    itemDescription,
    loading = false,
}: DeleteModalProps) {
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={title}
            centered
            radius="md"
        >
            <Stack gap="md">
                <Text size="sm">
                    Tem certeza de que deseja excluir{' '}
                    {itemDescription ? (
                        <b>{itemDescription}</b>
                    ) : (
                        'este registro'
                    )}
                    ? Esta ação não poderá ser desfeita.
                </Text>

                <Group justify="flex-end" mt="md">
                    <Button
                        variant="default"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button color="red" onClick={onConfirm} loading={loading}>
                        Excluir
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
