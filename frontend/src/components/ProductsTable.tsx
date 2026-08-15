import { useState } from 'react';
import {
    Table,
    Badge,
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

export type ExpirationStatus =
    | 'FAR_FROM_EXPIRING'
    | 'NEAR_EXPIRATION'
    | 'EXPIRED';

export type Product = {
    id: number;
    name: string;
    brand: { id: number; name: string; color: string };
    category: { id: number; name: string };
    family: { id: number; name: string };
    quantity: number;
    expirationDate: string;
    sellingPrice: number;
    expirationStatus: ExpirationStatus;
    expirationStatusDescription: string;
};

interface ProductsTableProps {
    title?: string;
    subtitle?: string;
    products?: Product[];
    onEdit?: (product: Product) => void;
    onDelete?: (id: number) => void;
    onAdd?: () => void;
}

export default function ProductsTable({
    title = 'Estoque de Produtos',
    subtitle = 'Listagem geral dos itens cadastrados no sistema',
    products = [],
    onEdit,
    onDelete,
    onAdd,
}: ProductsTableProps) {
    const [search, setSearch] = useState('');
    const [activePage, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<string | null>('5'); // 5 itens por página

    const itemsPerPage = Number(pageSize) || 5;

    const getStatusBadgeColor = (status: ExpirationStatus) => {
        switch (status) {
            case 'EXPIRED':
                return 'red';
            case 'NEAR_EXPIRATION':
                return 'yellow';
            default:
                return 'green';
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    // 1. Filtra os produtos com base na pesquisa
    const filteredProducts = products.filter((product) => {
        const query = search.toLowerCase();
        return (
            product.name.toLowerCase().includes(query) ||
            product.brand?.name.toLowerCase().includes(query) ||
            product.category?.name.toLowerCase().includes(query) ||
            product.family?.name.toLowerCase().includes(query)
        );
    });

    // 2. Calcula o total de páginas
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    // 3. Fatia o array para exibir apenas os itens da página atual
    const paginatedProducts = filteredProducts.slice(
        (activePage - 1) * itemsPerPage,
        activePage * itemsPerPage
    );

    const rows = paginatedProducts.map((product) => (
        <Table.Tr key={product.id}>
            <Table.Td fw={500}>{product.name}</Table.Td>

            <Table.Td>
                <Group gap="xs">
                    <ColorSwatch
                        color={product.brand?.color || '#ccc'}
                        size={14}
                    />
                    <Text size="sm">{product.brand?.name || '-'}</Text>
                </Group>
            </Table.Td>

            <Table.Td>
                <Text size="sm">{product.category?.name || '-'}</Text>
                <Text size="xs" c="dimmed">
                    {product.family?.name || '-'}
                </Text>
            </Table.Td>

            <Table.Td fw={500}>{product.quantity} un</Table.Td>
            <Table.Td>{formatDate(product.expirationDate)}</Table.Td>
            <Table.Td fw={600}>
                R$ {product.sellingPrice?.toFixed(2) || '0.00'}
            </Table.Td>

            <Table.Td>
                <Badge
                    color={getStatusBadgeColor(product.expirationStatus)}
                    variant="light"
                >
                    {product.expirationStatusDescription}
                </Badge>
            </Table.Td>

            <Table.Td align="right">
                <Group gap="xs" justify="flex-end">
                    <ActionIcon
                        variant="light"
                        color="blue"
                        title="Editar produto"
                        onClick={() => onEdit?.(product)}
                    >
                        <Edit size={16} />
                    </ActionIcon>

                    <ActionIcon
                        variant="light"
                        color="red"
                        title="Excluir produto"
                        onClick={() => onDelete?.(product.id)}
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
                        Novo Produto
                    </Button>
                )}
            </Group>

            {/* Barra de Pesquisa */}
            <TextInput
                placeholder="Pesquisar por nome, marca, categoria ou família..."
                leftSection={<Search size={16} />}
                value={search}
                onChange={(e) => {
                    setSearch(e.currentTarget.value);
                    setPage(1); // Volta para a primeira página ao pesquisar
                }}
                mb="md"
            />

            {/* Tabela */}
            <Table striped highlightOnHover verticalSpacing="sm">
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Produto</Table.Th>
                        <Table.Th>Marca</Table.Th>
                        <Table.Th>Categoria / Família</Table.Th>
                        <Table.Th>Qtd</Table.Th>
                        <Table.Th>Validade</Table.Th>
                        <Table.Th>Preço</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>
                            Ações
                        </Table.Th>
                    </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                    {paginatedProducts.length > 0 ? (
                        rows
                    ) : (
                        <Table.Tr>
                            <Table.Td colSpan={8} align="center" py="xl">
                                <Text c="dimmed">
                                    Nenhum produto encontrado.
                                </Text>
                            </Table.Td>
                        </Table.Tr>
                    )}
                </Table.Tbody>
            </Table>

            {/* Rodapé com Paginação */}
            {filteredProducts.length > 0 && (
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
