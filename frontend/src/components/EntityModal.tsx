import { useState, useEffect } from 'react';
import {
    Modal,
    TextInput,
    ColorInput,
    Select,
    Button,
    Group,
    Stack,
} from '@mantine/core';
import type { Entity } from '../components/EntityTable';
import { entitySchema, validateWithYup } from '../schemas/validationSchemas';
import { accentInsensitiveFilter } from '../utils/stringUtils';

interface EntityModalProps {
    opened: boolean;
    onClose: () => void;
    title: string;
    showColor?: boolean; // this modal is used for Brands (includes color data)
    showBrand?: boolean; // this modal is used for Families (optional brand assignment)
    brands?: Entity[];
    initialData?: Entity | null; // this modal is used for POST and PUT methods
    onSubmit: (values: { name: string; hexColor?: string; brandId?: string }) => Promise<void>;
}

export function EntityModal({
    opened,
    onClose,
    title,
    showColor = false,
    showBrand = false,
    brands = [],
    initialData,
    onSubmit,
}: EntityModalProps) {
    const [name, setName] = useState('');
    const [hexColor, setHexColor] = useState('#206095');
    const [brandId, setBrandId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (opened) {
            setErrors({});
            if (initialData) {
                setName(initialData.name);
                setHexColor(initialData.hexColor || '#206095');
                setBrandId(initialData.brand?.id || initialData.brandId || null);
            } else {
                setName('');
                setHexColor('#206095');
                setBrandId(null);
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

    // the form is validated using yup
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
                ...(showBrand && { brandId: brandId || undefined }),
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
                        maxLength={100}
                        description={`${name.length}/100`}
                        value={name}
                        error={errors.name}
                        onChange={(e) => {
                            setName(e.currentTarget.value);
                            clearError('name');
                        }}
                    />

                    {showBrand && (
                        <Select
                            label="Marca"
                            placeholder="Selecione a marca associada"
                            data={brands.map((b) => ({
                                value: String(b.id),
                                label: b.name,
                            }))}
                            value={brandId}
                            onChange={(val) => setBrandId(val)}
                            clearable
                            searchable
                            filter={accentInsensitiveFilter}
                            styles={{
                                dropdown: {
                                    maxHeight: 140,
                                    overflowY: 'auto',
                                },
                            }}
                        />
                    )}

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
