import { useState } from 'react';
import { normalizeText } from '../utils/stringUtils';
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
    Center,
    Loader,
    CloseButton,
} from '@mantine/core';
import { Edit, Trash2, Plus, Search, Eye } from 'lucide-react';

export type Entity = {
    id: string;
    name: string;
    hexColor?: string; // used for Brands
    brand?: { id: string; name: string; hexColor?: string }; // used for Families
    brandId?: string;
    canDelete?: boolean;
};

interface EntityTableProps {
    title: string;
    subtitle?: string;
    items?: Entity[];
    loading?: boolean;
    showColor?: boolean;
    showBrand?: boolean;
    addButtonLabel?: string;
    onEdit?: (item: Entity) => void;
    onDelete?: (id: string) => void;
    onSummary?: (item: Entity) => void;
    onAdd?: () => void;
}

export default function EntityTable({
    title,
    subtitle,
    items = [],
    loading = false,
    showColor = false,
    showBrand = false,
    addButtonLabel,
    onEdit,
    onDelete,
    onSummary,
    onAdd,
}: EntityTableProps) {
    const [search, setSearch] = useState('');
    const [activePage, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<string | null>('5');

    const itemsPerPage = Number(pageSize) || 5;

    // filter items by searching
    const filteredItems = items.filter((item) => {
        const query = normalizeText(search.trim());
        if (!query) return true;
        return (
            normalizeText(item.name || '').includes(query) ||
            normalizeText(item.brand?.name || '').includes(query) ||
            normalizeText(item.id?.toString() || '').includes(query)
        );
    });

    // total pages
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;

    // slicing method to show only a quantity of items in the page
    const paginatedItems = filteredItems.slice(
        (activePage - 1) * itemsPerPage,
        activePage * itemsPerPage
    );

    return (
        <Paper shadow="xs" p="md" radius="md" withBorder>
            {/* Header */}
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
                        {addButtonLabel || 'Cadastrar'}
                    </Button>
                )}
            </Group>

            {/* Search */}
            <TextInput
                placeholder={`Pesquisar ${title.toLowerCase()}...`}
                leftSection={<Search size={16} />}
                rightSection={
                    search ? (
                        <CloseButton
                            size="sm"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                                setSearch('');
                                setPage(1);
                            }}
                            aria-label="Limpar pesquisa"
                        />
                    ) : null
                }
                value={search}
                onChange={(e) => {
                    setSearch(e.currentTarget.value);
                    setPage(1);
                }}
                mb="md"
            />

            {/* Table */}
            <Table.ScrollContainer minWidth={400}>
                <Table striped highlightOnHover verticalSpacing="sm">
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Nome</Table.Th>
                            {showBrand && <Table.Th>Marca</Table.Th>}
                            <Table.Th style={{ textAlign: 'right' }}>
                                Ações
                            </Table.Th>
                        </Table.Tr>
                    </Table.Thead>

                    <Table.Tbody>
                        {loading ? (
                            <Table.Tr>
                                <Table.Td colSpan={showBrand ? 3 : 2} align="center" py="xl">
                                    <Center
                                        style={{
                                            flexDirection: 'column',
                                            gap: 8,
                                        }}
                                    >
                                        <Loader size="sm" color="blue" />
                                        <Text size="sm" c="dimmed">
                                            Carregando dados...
                                        </Text>
                                    </Center>
                                </Table.Td>
                            </Table.Tr>
                        ) : paginatedItems.length > 0 ? (
                            paginatedItems.map((item) => (
                                <Table.Tr key={item.id}>
                                    <Table.Td>
                                        <Group gap="xs">
                                            {showColor && item.hexColor && (
                                                <ColorSwatch
                                                    color={item.hexColor}
                                                    size={16}
                                                />
                                            )}
                                            <Text size="sm" fw={500}>
                                                {item.name}
                                            </Text>
                                        </Group>
                                    </Table.Td>

                                    {showBrand && (
                                        <Table.Td>
                                            {item.brand ? (
                                                <Group gap="xs">
                                                    {item.brand.hexColor && (
                                                        <ColorSwatch
                                                            color={item.brand.hexColor}
                                                            size={14}
                                                        />
                                                    )}
                                                    <Text size="sm">
                                                        {item.brand.name}
                                                    </Text>
                                                </Group>
                                            ) : (
                                                <Text size="sm" c="dimmed">
                                                    -
                                                </Text>
                                            )}
                                        </Table.Td>
                                    )}

                                    <Table.Td align="right">
                                        <Group gap="xs" justify="flex-end">
                                            {onSummary && (
                                                <ActionIcon
                                                    variant="light"
                                                    color="teal"
                                                    title="Ver Resumo e Compras"
                                                    onClick={() => onSummary(item)}
                                                >
                                                    <Eye size={16} />
                                                </ActionIcon>
                                            )}

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
                                                title={
                                                    item.canDelete === false
                                                        ? 'Não é possível excluir: existem produtos associados'
                                                        : 'Excluir'
                                                }
                                                disabled={item.canDelete === false}
                                                onClick={() =>
                                                    onDelete?.(item.id)
                                                }
                                            >
                                                <Trash2 size={16} />
                                            </ActionIcon>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))
                        ) : (
                            <Table.Tr>
                                <Table.Td colSpan={showBrand ? 3 : 2} align="center" py="xl">
                                    <Text c="dimmed">
                                        Nenhum registro encontrado.
                                    </Text>
                                </Table.Td>
                            </Table.Tr>
                        )}
                    </Table.Tbody>
                </Table>
            </Table.ScrollContainer>

            {/* Pagination */}
            {!loading && filteredItems.length > 0 && (
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
