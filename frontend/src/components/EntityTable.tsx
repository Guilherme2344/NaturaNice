import { useState } from 'react';
import {
    Table,
    Group,
    ColorSwatch,
    Text,
    Paper,
    Title,
    ActionIcon,
    Button,
    TextInput,
    Pagination,
    Select,
} from '@mantine/core';
import { Edit, Trash2, Plus, Search } from 'lucide-react';

export type Entity = {
    id: number;
    name: string;
    color?: string;
};

interface EntityTableProps {
    title: string;
    subtitle?: string;
    items?: Entity[];
    showColor?: boolean;
    onEdit?: (item: Entity) => void;
    onDelete?: (id: number) => void;
    onAdd?: () => void;
}

export default function EntityTable({
    title,
    subtitle,
    items = [],
    showColor = false,
    onEdit,
    onDelete,
    onAdd,
}: EntityTableProps) {
    const [search, setSearch] = useState('');
    const [activePage, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<string | null>('5');

    const itemsPerPage = Number(pageSize) || 5;

    // 1. Filtra os itens com base na pesquisa (nome ou ID)
    const filteredItems = items.filter((item) => {
        const query = search.toLowerCase();
        return (
            item.name.toLowerCase().includes(query) ||
            item.id.toString().includes(query)
        );
    });

    // 2. Calcula o total de páginas
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    // 3. Fatia o array para a página atual
    const paginatedItems = filteredItems.slice(
        (activePage - 1) * itemsPerPage,
        activePage * itemsPerPage
    );

    const rows = paginatedItems.map((item) => (
        <Table.Tr key={item.id}>
            <Table.Td fw={500} w={80}>
                #{item.id}
            </Table.Td>

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

            {showColor && (
                <Table.Td>
                    <Text size="xs" c="dimmed">
                        {item.color || 'Sem cor definida'}
                    </Text>
                </Table.Td>
            )}

            <Table.Td align="right">
                <Group gap="xs" justify="flex-end">
                    <ActionIcon
                        variant="light"
                        color="blue"
                        title="Editar"
                        onClick={() => onEdit?.(item)}
                    >
                        <Edit size={16} />
                    </ActionIcon>

                    <ActionIcon
                        variant="light"
                        color="red"
                        title="Excluir"
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
            {/* Cabeçalho */}
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
                        color="blue"
                        onClick={onAdd}
                    >
                        Nova Cadastrar
                    </Button>
                )}
            </Group>

            {/* Barra de Pesquisa */}
            <TextInput
                placeholder={`Pesquisar ${title.toLowerCase()}...`}
                leftSection={<Search size={16} />}
                value={search}
                onChange={(e) => {
                    setSearch(e.currentTarget.value);
                    setPage(1); // Reseta para a página 1 durante a busca
                }}
                mb="md"
            />

            {/* Tabela */}
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
                    {paginatedItems.length > 0 ? (
                        rows
                    ) : (
                        <Table.Tr>
                            <Table.Td
                                colSpan={showColor ? 4 : 3}
                                align="center"
                                py="xl"
                            >
                                <Text c="dimmed">
                                    Nenhum registro encontrado.
                                </Text>
                            </Table.Td>
                        </Table.Tr>
                    )}
                </Table.Tbody>
            </Table>

            {/* Rodapé com Paginação */}
            {filteredItems.length > 0 && (
                <Group
                    justify="space-between"
                    mt="md"
                    pt="xs"
                    style={{ borderTop: '1px solid #eee' }}
                >
                    <Group gap="xs">
                        <Text size="sm" c="dimmed">
                            Exibindo itens por página:
                        </Text>
                        <Select
                            data={['5', '10', '20', '50']}
                            value={pageSize}
                            onChange={(val) => {
                                setPageSize(val);
                                setPage(1);
                            }}
                            style={{ width: 80 }}
                            size="xs"
                        />
                    </Group>

                    <Pagination
                        total={totalPages}
                        value={activePage}
                        onChange={setPage}
                        color="blue"
                        size="sm"
                        radius="md"
                    />
                </Group>
            )}
        </Paper>
    );
}
