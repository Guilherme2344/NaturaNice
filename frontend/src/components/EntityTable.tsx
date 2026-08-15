import {
    Table,
    Group,
    ColorSwatch,
    Text,
    Paper,
    Title,
    Button,
    ActionIcon,
    TextInput,
} from '@mantine/core';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import { useState } from 'react';

// Interface base que serve para Marca, Categoria e Família
export interface Entity {
    id: number;
    name: string;
    color?: string; // Opcional (usado para Marcas)
}

interface EntityTableProps {
    title: string;
    subtitle?: string;
    items: Entity[];
    showColor?: boolean; // Se true, exibe a bolinha de cor (ColorSwatch)
    onEdit?: (item: Entity) => void;
    onDelete?: (id: number) => void;
    onAdd?: () => void;
}

export default function EntityTable({
    title,
    subtitle,
    items,
    showColor = false,
    onEdit,
    onDelete,
    onAdd,
}: EntityTableProps) {
    const [search, setSearch] = useState('');

    const filteredItems = items.filter((item) => {
        const query = search.toLowerCase();
        return (
            item.name.toLowerCase().includes(query) ||
            item.id.toString().includes(query)
        );
    });

    const rows = filteredItems.map((item) => (
        <Table.Tr key={item.id}>
            {/* ID do Cadastro */}
            <Table.Td fw={500} w={80}>
                #{item.id}
            </Table.Td>

            {/* Nome e Cor (se aplicável) */}
            <Table.Td>
                <Group gap="xs">
                    {showColor && item.color && (
                        <ColorSwatch color={item.color} size={16} />
                    )}
                    <Text size="sm" fw={500}>
                        {item.name}
                    </Text>
                </Group>
            </Table.Td>

            {/* Código Hexadecimal da Cor (apenas para Marcas) */}
            {showColor && (
                <Table.Td>
                    <Text size="xs" c="dimmed">
                        {item.color || 'Sem cor definida'}
                    </Text>
                </Table.Td>
            )}

            {/* Menu de Ações */}
            <Table.Td align="right">
                <Group gap="xs" justify="flex-end">
                    <ActionIcon
                        variant="light"
                        color="blue"
                        title="Editar produto"
                        onClick={() => onEdit?.(item)}
                    >
                        <Edit size={16} />
                    </ActionIcon>

                    <ActionIcon
                        variant="light"
                        color="red"
                        title="Excluir produto"
                        onClick={() => onDelete?.(item.id)}
                    >
                        <Trash2 size={16} />
                    </ActionIcon>
                </Group>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Paper shadow="xs" p="md" radius="md" withBorder>
            {/* Cabeçalho da Tabela */}
            <Group justify="space-between" mb="md">
                <div>
                    <Title order={3}>{title}</Title>
                    {subtitle && (
                        <Text size="sm" c="dimmed">
                            {subtitle}
                        </Text>
                    )}
                </div>
                {onAdd && (
                    <Button
                        leftSection={<Plus size={16} />}
                        color="green"
                        onClick={onAdd}
                    >
                        Inserir
                    </Button>
                )}
            </Group>

            <TextInput
                placeholder={`Pesquisar ${title.toLowerCase()}...`}
                leftSection={<Search size={16} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                mb="md"
            />

            {/* Tabela do Mantine */}
            <Table striped highlightOnHover verticalSpacing="sm">
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>ID</Table.Th>
                        <Table.Th>Nome</Table.Th>
                        {showColor && <Table.Th>Cor Hexadecimal</Table.Th>}
                        <Table.Th style={{ textAlign: 'right' }}>
                            Ações
                        </Table.Th>
                    </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                    {items.length > 0 ? (
                        rows
                    ) : (
                        <Table.Tr>
                            <Table.Td
                                colSpan={showColor ? 4 : 3}
                                align="center"
                                py="xl"
                            >
                                <Text c="dimmed">
                                    Nenhum registro cadastrado.
                                </Text>
                            </Table.Td>
                        </Table.Tr>
                    )}
                </Table.Tbody>
            </Table>
        </Paper>
    );
}
