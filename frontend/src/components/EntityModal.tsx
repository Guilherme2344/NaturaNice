import { useState, useEffect } from 'react';
import {
    Modal,
    TextInput,
    ColorInput,
    Button,
    Group,
    Stack,
} from '@mantine/core';
import type { Entity } from '../components/EntityTable';

interface EntityModalProps {
    opened: boolean;
    onClose: () => void;
    title: string;
    showColor?: boolean;
    initialData?: Entity | null;
    onSubmit: (values: { name: string; hexColor?: string }) => Promise<void>;
}

export function EntityModal({
    opened,
    onClose,
    title,
    showColor = false,
    initialData,
    onSubmit,
}: EntityModalProps) {
    const [name, setName] = useState('');
    const [hexColor, setHexColor] = useState('#206095');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (opened) {
            if (initialData) {
                setName(initialData.name);
                setHexColor(initialData.hexColor || '#206095');
            } else {
                setName('');
                setHexColor('#206095');
            }
        }
    }, [opened, initialData]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!name.trim()) {
            alert('Por favor, informe o nome.');
            return;
        }

        try {
            setLoading(true);
            await onSubmit({
                name: name.trim(),
                ...(showColor && { hexColor }),
            });
            onClose();
        } catch (error: any) {
            console.error(
                'Erro ao salvar registro:',
                error.response?.data || error
            );
            alert(
                'Erro ao salvar: ' +
                    (error.response?.data?.message || 'Verifique os dados.')
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={title}
            centered
            radius="md"
        >
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    <TextInput
                        label="Nome"
                        placeholder="Digite o nome..."
                        required
                        value={name}
                        onChange={(e) => setName(e.currentTarget.value)}
                    />

                    {showColor && (
                        <ColorInput
                            label="Cor da Marca"
                            placeholder="Escolha a cor"
                            value={hexColor}
                            onChange={setHexColor}
                            format="hex"
                        />
                    )}

                    <Group justify="flex-end" mt="md">
                        <Button
                            variant="default"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" color="blue" loading={loading}>
                            {initialData ? 'Salvar Alterações' : 'Cadastrar'}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
