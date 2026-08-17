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
    Center,
    Loader,
    Stack,
} from '@mantine/core';
import { Edit, Trash2, Plus, Search, ShoppingCart } from 'lucide-react';

export type ExpirationStatus =
    | 'FAR_FROM_EXPIRING'
    | 'NEAR_EXPIRATION'
    | 'EXPIRED';

export type Brand = {
    id: number;
    name: string;
    hexColor?: string;
};

export type Category = {
    id: number;
    name: string;
};

export type Family = {
    id: number;
    name: string;
};

export type Product = {
    id: number;
    name: string;
    quantity: number;
    expirationDate: string;
    purchasePrice: number;
    sellingPrice: number;
    profit: number;
    brand: Brand;
    category: Category;
    family: Family;
    expirationStatus: ExpirationStatus;
    expirationStatusDescription: string;
};

interface ProductsTableProps {
    title?: string;
    subtitle?: string;
    products?: Product[];
    loading?: boolean;
    onEdit?: (product: Product) => void;
    onDelete?: (id: number) => void;
    onAdd?: () => void;
    onSale?: (product: Product) => void;
}

export default function ProductsTable({
    title = 'Estoque de Produtos',
    subtitle = 'Listagem geral dos itens cadastrados no sistema',
    products = [],
    loading = false,
    onEdit,
    onDelete,
    onAdd,
    onSale,
}: ProductsTableProps) {
    const [search, setSearch] = useState('');
    const [activePage, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<string | null>('5');

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

    const filteredProducts = (products || []).filter((product) => {
        const query = search.toLowerCase();
        return (
            product.name?.toLowerCase().includes(query) ||
            product.brand?.name?.toLowerCase().includes(query) ||
            product.category?.name?.toLowerCase().includes(query) ||
            product.family?.name?.toLowerCase().includes(query)
        );
    });

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;

    const paginatedProducts = filteredProducts.slice(
        (activePage - 1) * itemsPerPage,
        activePage * itemsPerPage
    );

    return (
        <Paper shadow="xs" p="md" radius="md" withBorder>
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

            <TextInput
                placeholder="Pesquisar por produto, marca, categoria ou família..."
                leftSection={<Search size={16} />}
                value={search}
                onChange={(e) => {
                    setSearch(e.currentTarget.value);
                    setPage(1);
                }}
                mb="md"
            />

            <Table striped highlightOnHover verticalSpacing="sm">
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Marca</Table.Th>
                        <Table.Th>Produto</Table.Th>
                        <Table.Th>Categoria / Família</Table.Th>
                        <Table.Th>Qtd</Table.Th>
                        <Table.Th>Data de Vencimento</Table.Th>
                        <Table.Th>Valor Compra</Table.Th>
                        <Table.Th>Valor Venda</Table.Th>
                        <Table.Th>Resultado</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>
                            Ações
                        </Table.Th>
                    </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                    {loading ? (
                        <Table.Tr>
                            <Table.Td colSpan={9} align="center" py="xl">
                                <Center
                                    style={{ flexDirection: 'column', gap: 8 }}
                                >
                                    <Loader size="sm" color="blue" />
                                    <Text size="sm" c="dimmed">
                                        Carregando produtos...
                                    </Text>
                                </Center>
                            </Table.Td>
                        </Table.Tr>
                    ) : paginatedProducts.length > 0 ? (
                        paginatedProducts.map((product) => (
                            <Table.Tr key={product.id}>
                                <Table.Td>
                                    <Group gap="xs">
                                        <ColorSwatch
                                            color={
                                                product.brand?.hexColor ||
                                                '#ccc'
                                            }
                                            size={14}
                                        />
                                        <Text size="sm">
                                            {product.brand?.name || '-'}
                                        </Text>
                                    </Group>
                                </Table.Td>

                                <Table.Td fw={500}>{product.name}</Table.Td>

                                <Table.Td>
                                    <Text size="sm">
                                        {product.category?.name || '-'}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        {product.family?.name || '-'}
                                    </Text>
                                </Table.Td>

                                <Table.Td fw={500}>
                                    {product.quantity} un
                                </Table.Td>

                                {/* Data de Vencimento formatada */}
                                <Table.Td>
                                    <Stack gap={4} align="flex-start">
                                        <Text size="sm">
                                            {formatDate(product.expirationDate)}
                                        </Text>
                                        <Badge
                                            color={getStatusBadgeColor(
                                                product.expirationStatus
                                            )}
                                            variant="light"
                                        >
                                            {
                                                product.expirationStatusDescription
                                            }
                                        </Badge>
                                    </Stack>
                                </Table.Td>

                                {/* Preço de Compra */}
                                <Table.Td fw={400}>
                                    R${' '}
                                    {product.purchasePrice?.toFixed(2) ||
                                        '0.00'}
                                </Table.Td>

                                {/* Preço de Venda */}
                                <Table.Td fw={400}>
                                    R${' '}
                                    {product.sellingPrice?.toFixed(2) || '0.00'}
                                </Table.Td>

                                <Table.Td fw={600}>
                                    R$ {product.profit?.toFixed(2) || '0.00'}
                                </Table.Td>

                                <Table.Td align="right">
                                    <Group gap="xs" justify="flex-end">
                                        {onSale && (
                                            <ActionIcon
                                                variant="light"
                                                color="teal"
                                                title={product.quantity > 0 ? 'Efetivar Venda' : 'Sem Estoque'}
                                                disabled={product.quantity <= 0}
                                                onClick={() => onSale(product)}
                                            >
                                                <ShoppingCart size={16} />
                                            </ActionIcon>
                                        )}

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
                                            onClick={() =>
                                                onDelete?.(product.id)
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
                            <Table.Td colSpan={9} align="center" py="xl">
                                <Text c="dimmed">
                                    Nenhum produto encontrado.
                                </Text>
                            </Table.Td>
                        </Table.Tr>
                    )}
                </Table.Tbody>
            </Table>

            {!loading && filteredProducts.length > 0 && (
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
