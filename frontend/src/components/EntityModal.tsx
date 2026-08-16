import { useState, useEffect } from 'react';
import {
    Modal,
    TextInput,
    ColorInput,
    Button,
    Group,
    Stack,
} from '@mantine/core';

interface EntityModalProps {
    opened: boolean;
    onClose: () => void;
    title: string;
    showColor?: boolean;
    onSubmit: (values: { name: string; hexColor?: string }) => Promise<void>;
}

export function EntityModal({
    opened,
    onClose,
    title,
    showColor = false,
    onSubmit,
}: EntityModalProps) {
    const [name, setName] = useState('');
    const [hexColor, setHexColor] = useState('#206095');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (opened) {
            setName('');
            setHexColor('#206095');
        }
    }, [opened]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!name.trim()) {
            alert('Por favor, informe o nome.');
            return;
        }

        try {
            setLoading(true);

            // Envia apenas o nome e hexColor (se aplicável, como em Marcas)
            await onSubmit({
                name: name.trim(),
                ...(showColor && { hexColor }),
            });

            onClose();
        } catch (error: any) {
            console.error(
                'Erro ao cadastrar registro:',
                error.response?.data || error
            );
            alert(
                'Erro ao cadastrar: ' +
                    (error.response?.data?.message ||
                        'Verifique os dados informados.')
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
                            swatches={[
                                '#25262b',
                                '#868e96',
                                '#fa5252',
                                '#e64980',
                                '#be4bdb',
                                '#7950f2',
                                '#4c6ef5',
                                '#228be6',
                                '#15aabf',
                                '#12b886',
                                '#40c057',
                                '#82c91e',
                                '#fab005',
                                '#fd7e14',
                            ]}
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
                            Cadastrar
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
