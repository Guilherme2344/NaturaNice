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
import { entitySchema, validateWithYup } from '../schemas/validationSchemas';

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
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (opened) {
            setErrors({});
            if (initialData) {
                setName(initialData.name);
                setHexColor(initialData.hexColor || '#206095');
            } else {
                setName('');
                setHexColor('206095');
            }
        }
    }, [opened, initialData]);

    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors((prev) => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const { isValid, errors: validationErrors } = await validateWithYup(
            entitySchema,
            { name: name.trim() }
        );
        if (!isValid) {
            setErrors(validationErrors);
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
            <form onSubmit={handleSubmit} noValidate>
                <Stack gap="md">
                    <TextInput
                        label="Nome"
                        placeholder="Digite o nome..."
                        required
                        value={name}
                        error={errors.name}
                        onChange={(e) => {
                            setName(e.currentTarget.value);
                            clearError('name');
                        }}
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
