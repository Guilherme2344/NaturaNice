import { useState } from 'react';
import { formatExpirationStatus } from '../utils/expirationUtils';
import { normalizeText, accentInsensitiveFilter } from '../utils/stringUtils';
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
    Grid,
    CloseButton,
    Popover,
    Checkbox,
} from '@mantine/core';
import { Edit, Trash2, Plus, Search, DollarSign, Boxes } from 'lucide-react';

export type ExpirationStatus =
    | 'FAR_FROM_EXPIRING'
    | 'NEAR_EXPIRATION'
    | 'EXPIRED';

export type Brand = {
    id: string;
    name: string;
    hexColor?: string;
};

export type Category = {
    id: string;
    name: string;
};

export type Family = {
    id: string;
    name: string;
};

export type ProductBatch = {
    id: string;
    productId: string;
    productName?: string;
    quantity: number;
    purchaseDate: string;
    expirationDate?: string | null;
    purchasePrice: number;
    sellingPrice: number;
};

export type Product = {
    id: string;
    name: string;
    quantity: number;
    purchaseDate?: string;
    expirationDate?: string | null;
    purchasePrice: number;
    sellingPrice: number;
    profit: number;
    brand: Brand;
    category: Category;
    family: Family;
    expirationStatus?: ExpirationStatus | null;
    expirationStatusDescription?: string | null;
    canDelete?: boolean;
    batches?: ProductBatch[];
};

interface ProductsTableProps {
    title?: string;
    subtitle?: string;
    products?: Product[];
    loading?: boolean;
    onEdit?: (product: Product) => void;
    onDelete?: (id: string) => void;
    onAdd?: () => void;
    onSale?: (products: Product[]) => void;
    onAddLote?: (product: Product) => void;
    selectedIds?: string[];
    onSelectedIdsChange?: (ids: string[]) => void;
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
    onAddLote,
    selectedIds: controlledSelectedIds,
    onSelectedIdsChange,
}: ProductsTableProps) {
    const [search, setSearch] = useState('');
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    );
    const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
    const [activePage, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<string | null>('5');
    const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>(
        []
    );

    const selectedIds =
        controlledSelectedIds !== undefined
            ? controlledSelectedIds
            : internalSelectedIds;

    const setSelectedIds = (
        updater: string[] | ((prev: string[]) => string[])
    ) => {
        const next =
            typeof updater === 'function' ? updater(selectedIds) : updater;
        if (controlledSelectedIds !== undefined) {
            onSelectedIdsChange?.(next);
        } else {
            setInternalSelectedIds(next);
        }
    };

    const itemsPerPage = Number(pageSize) || 5;

    // using currency of Brazil
    const formatCurrency = (val?: number) => {
        return (val || 0).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return 'Indeterminada';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    // Extract unique options for filters
    const brandOptions = Array.from(
        new Set(
            products
                .map((p) => p.brand?.name)
                .filter((name): name is string => Boolean(name))
        )
    ).sort((a, b) => a.localeCompare(b));

    const categoryOptions = Array.from(
        new Set(
            products
                .map((p) => p.category?.name)
                .filter((name): name is string => Boolean(name))
        )
    ).sort((a, b) => a.localeCompare(b));

    const familyOptions = Array.from(
        new Set(
            products
                .filter(
                    (p) => !selectedBrand || p.brand?.name === selectedBrand
                )
                .map((p) => p.family?.name)
                .filter((name): name is string => Boolean(name))
        )
    ).sort((a, b) => a.localeCompare(b));

    const filteredProducts = (products || [])
        .filter((product) => {
            const query = normalizeText(search.trim());
            const matchesSearch =
                !query ||
                normalizeText(product.name || '').includes(query) ||
                normalizeText(product.brand?.name || '').includes(query) ||
                normalizeText(product.category?.name || '').includes(query) ||
                normalizeText(product.family?.name || '').includes(query);

            const matchesBrand =
                !selectedBrand || product.brand?.name === selectedBrand;
            const matchesCategory =
                !selectedCategory ||
                product.category?.name === selectedCategory;
            const matchesFamily =
                !selectedFamily || product.family?.name === selectedFamily;

            return (
                matchesSearch &&
                matchesBrand &&
                matchesCategory &&
                matchesFamily
            );
        })
        .sort((a, b) => {
            if (!a.expirationDate && !b.expirationDate) {
                return (a.name || '').localeCompare(b.name || '');
            }
            if (!a.expirationDate) return 1;
            if (!b.expirationDate) return -1;

            const cmp = a.expirationDate.localeCompare(b.expirationDate);
            if (cmp !== 0) return cmp;

            return (a.name || '').localeCompare(b.name || '');
        });

    // total pages
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;

    // slicing method to show only a quantity of products in the page
    const paginatedProducts = filteredProducts.slice(
        (activePage - 1) * itemsPerPage,
        activePage * itemsPerPage
    );

    const selectedProducts = products.filter((p) => selectedIds.includes(p.id));

    const handleToggleProduct = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    const handleClearSelection = () => {
        setSelectedIds([]);
    };

    return (
        <Paper shadow="xs" p="md" radius="md" withBorder>
            {/* Header */}
            <Group justify="space-between" mb="md">
                <div>
                    <Title order={3}>{title}</Title>
                    <Text size="sm" c="dimmed">
                        {subtitle}
                    </Text>
                </div>
                <Group>
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
            </Group>

            {/* Filter Bar */}
            <Grid mb="md" align="center">
                <Grid.Col span={{ base: 12, sm: 12, md: 4.5 }}>
                    <TextInput
                        placeholder="Pesquisar por nome, marca, categoria ou família..."
                        leftSection={<Search size={16} />}
                        rightSection={
                            search ? (
                                <CloseButton
                                    size="sm"
                                    onMouseDown={(event) =>
                                        event.preventDefault()
                                    }
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
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4, md: 2.5 }}>
                    <Select
                        placeholder="Filtrar por Marca"
                        data={brandOptions}
                        value={selectedBrand}
                        onChange={(val) => {
                            setSelectedBrand(val);
                            setSelectedFamily(null);
                            setPage(1);
                        }}
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
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4, md: 2.5 }}>
                    <Select
                        placeholder="Filtrar por Categoria"
                        data={categoryOptions}
                        value={selectedCategory}
                        onChange={(val) => {
                            setSelectedCategory(val);
                            setPage(1);
                        }}
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
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4, md: 2.5 }}>
                    <Select
                        placeholder="Filtrar por Família"
                        data={familyOptions}
                        value={selectedFamily}
                        onChange={(val) => {
                            setSelectedFamily(val);
                            setPage(1);
                        }}
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
                </Grid.Col>
            </Grid>

            {/* Action Bar when items are selected */}
            {selectedProducts.length > 0 && (
                <Paper
                    p="xs"
                    mb="md"
                    radius="md"
                    withBorder
                    style={{
                        position: 'sticky',
                        top: 60,
                        zIndex: 90,
                        backgroundColor: '#f4f9ff',
                        borderColor: '#74c0fc',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    }}
                >
                    <Group justify="space-between" wrap="wrap" gap="xs">
                        <Group gap="xs">
                            <Badge size="lg" variant="filled" color="blue">
                                {selectedProducts.length}{' '}
                                {selectedProducts.length === 1
                                    ? 'produto selecionado'
                                    : 'produtos selecionados'}
                            </Badge>
                            <Button
                                variant="subtle"
                                color="gray"
                                size="xs"
                                onClick={handleClearSelection}
                            >
                                Limpar seleção
                            </Button>
                        </Group>

                        <Group gap="xs" wrap="wrap">
                            {onSale && (
                                <Button
                                    size="xs"
                                    color="teal"
                                    leftSection={<DollarSign size={16} />}
                                    disabled={selectedProducts.every(
                                        (p) => (p.quantity || 0) <= 0
                                    )}
                                    onClick={() => onSale(selectedProducts)}
                                >
                                    {selectedProducts.length === 1
                                        ? 'Efetivar Venda'
                                        : `Efetivar Venda (${selectedProducts.length} itens)`}
                                </Button>
                            )}

                            {selectedProducts.length === 1 && onAddLote && (
                                <Button
                                    size="xs"
                                    variant="light"
                                    color="indigo"
                                    leftSection={<Boxes size={16} />}
                                    onClick={() =>
                                        onAddLote(selectedProducts[0])
                                    }
                                >
                                    Cadastrar Lote
                                </Button>
                            )}

                            {selectedProducts.length === 1 && onEdit && (
                                <Button
                                    size="xs"
                                    variant="light"
                                    color="blue"
                                    leftSection={<Edit size={16} />}
                                    onClick={() => onEdit(selectedProducts[0])}
                                >
                                    Editar
                                </Button>
                            )}

                            {selectedProducts.length === 1 && onDelete && (
                                <Button
                                    size="xs"
                                    variant="light"
                                    color="red"
                                    leftSection={<Trash2 size={16} />}
                                    disabled={
                                        selectedProducts[0].canDelete === false
                                    }
                                    title={
                                        selectedProducts[0].canDelete === false
                                            ? 'Não é possível excluir: existem vendas associadas a este produto'
                                            : undefined
                                    }
                                    onClick={() =>
                                        onDelete(selectedProducts[0].id)
                                    }
                                >
                                    Excluir
                                </Button>
                            )}
                        </Group>
                    </Group>
                </Paper>
            )}

            {/* Table */}
            <Table.ScrollContainer minWidth={1050}>
                <Table striped highlightOnHover verticalSpacing="sm">
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th
                                style={{ whiteSpace: 'nowrap', minWidth: 120 }}
                            >
                                Marca
                            </Table.Th>
                            <Table.Th style={{ minWidth: 150 }}>
                                Produto
                            </Table.Th>
                            <Table.Th style={{ minWidth: 150 }}>
                                Categoria / Família
                            </Table.Th>
                            <Table.Th
                                style={{ whiteSpace: 'nowrap', minWidth: 70 }}
                            >
                                Qtd
                            </Table.Th>
                            <Table.Th
                                style={{ whiteSpace: 'nowrap', minWidth: 160 }}
                            >
                                Data de Vencimento
                            </Table.Th>
                            <Table.Th style={{ whiteSpace: 'nowrap' }}>
                                Valor Compra
                            </Table.Th>
                            <Table.Th style={{ whiteSpace: 'nowrap' }}>
                                Valor Venda
                            </Table.Th>
                            <Table.Th
                                style={{
                                    textAlign: 'center',
                                    width: 50,
                                    whiteSpace: 'nowrap',
                                }}
                            />
                        </Table.Tr>
                    </Table.Thead>

                    <Table.Tbody>
                        {loading ? (
                            <Table.Tr>
                                <Table.Td colSpan={8} align="center" py="xl">
                                    <Center
                                        style={{
                                            flexDirection: 'column',
                                            gap: 8,
                                        }}
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
                                <Table.Tr
                                    key={product.id}
                                    style={
                                        selectedIds.includes(product.id)
                                            ? {
                                                  backgroundColor:
                                                      'rgba(28, 126, 214, 0.08)',
                                              }
                                            : undefined
                                    }
                                >
                                    <Table.Td style={{ whiteSpace: 'nowrap' }}>
                                        <Group gap="xs" wrap="nowrap">
                                            <ColorSwatch
                                                color={
                                                    product.brand?.hexColor ||
                                                    '#ccc'
                                                }
                                                size={14}
                                            />
                                            <Text
                                                size="sm"
                                                style={{ whiteSpace: 'nowrap' }}
                                            >
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

                                    <Table.Td
                                        fw={500}
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        {product.quantity} un
                                    </Table.Td>

                                    {/* Data de Vencimento formatada */}
                                    <Table.Td
                                        style={{
                                            whiteSpace: 'nowrap',
                                            minWidth: 160,
                                        }}
                                    >
                                        <Group
                                            gap={6}
                                            align="center"
                                            wrap="nowrap"
                                        >
                                            {product.expirationDate ? (
                                                <Stack
                                                    gap={4}
                                                    align="flex-start"
                                                    style={{
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    <Text
                                                        size="sm"
                                                        style={{
                                                            whiteSpace:
                                                                'nowrap',
                                                        }}
                                                    >
                                                        {formatDate(
                                                            product.expirationDate
                                                        )}
                                                    </Text>
                                                    {(() => {
                                                        const status =
                                                            formatExpirationStatus(
                                                                product.expirationDate
                                                            );
                                                        if (
                                                            status.type ===
                                                            'EXPIRED'
                                                        ) {
                                                            return (
                                                                <Text
                                                                    size="xs"
                                                                    fw={700}
                                                                    bg="red.6"
                                                                    c="white"
                                                                    px="xs"
                                                                    py={2}
                                                                    style={{
                                                                        borderRadius: 4,
                                                                        display:
                                                                            'inline-block',
                                                                        whiteSpace:
                                                                            'nowrap',
                                                                    }}
                                                                >
                                                                    {
                                                                        status.text
                                                                    }
                                                                </Text>
                                                            );
                                                        }
                                                        if (
                                                            status.type ===
                                                            'NEAR_EXPIRATION'
                                                        ) {
                                                            return (
                                                                <Text
                                                                    size="xs"
                                                                    fw={700}
                                                                    bg="yellow.4"
                                                                    c="dark"
                                                                    px="xs"
                                                                    py={2}
                                                                    style={{
                                                                        borderRadius: 4,
                                                                        display:
                                                                            'inline-block',
                                                                        whiteSpace:
                                                                            'nowrap',
                                                                    }}
                                                                >
                                                                    {
                                                                        status.text
                                                                    }
                                                                </Text>
                                                            );
                                                        }
                                                        return (
                                                            <Text
                                                                size="xs"
                                                                fw={700}
                                                                style={{
                                                                    whiteSpace:
                                                                        'nowrap',
                                                                }}
                                                            >
                                                                {status.text}
                                                            </Text>
                                                        );
                                                    })()}
                                                </Stack>
                                            ) : (
                                                <Badge
                                                    variant="light"
                                                    color="gray"
                                                    size="sm"
                                                >
                                                    Indeterminada
                                                </Badge>
                                            )}

                                            {(() => {
                                                const sortedBatches = (
                                                    product.batches || []
                                                )
                                                    .slice()
                                                    .sort((a, b) => {
                                                        if (
                                                            !a.expirationDate &&
                                                            !b.expirationDate
                                                        )
                                                            return 0;
                                                        if (!a.expirationDate)
                                                            return 1;
                                                        if (!b.expirationDate)
                                                            return -1;
                                                        return a.expirationDate.localeCompare(
                                                            b.expirationDate
                                                        );
                                                    });
                                                return sortedBatches.length >
                                                    1 ? (
                                                    <Popover
                                                        width={280}
                                                        shadow="md"
                                                        withArrow
                                                        position="top"
                                                    >
                                                        <Popover.Target>
                                                            <ActionIcon
                                                                size="xs"
                                                                variant="light"
                                                                color="blue"
                                                                style={{
                                                                    cursor: 'pointer',
                                                                }}
                                                            >
                                                                <Plus
                                                                    size={12}
                                                                />
                                                            </ActionIcon>
                                                        </Popover.Target>
                                                        <Popover.Dropdown p="xs">
                                                            <Text
                                                                size="xs"
                                                                fw={700}
                                                                c="dimmed"
                                                                mb={6}
                                                            >
                                                                Data de
                                                                Vencimento por
                                                                Lote (
                                                                {
                                                                    sortedBatches.length
                                                                }{' '}
                                                                lotes):
                                                            </Text>
                                                            <Stack
                                                                gap={4}
                                                                style={
                                                                    sortedBatches.length >=
                                                                    4
                                                                        ? {
                                                                              maxHeight: 75,
                                                                              overflowY:
                                                                                  'auto',
                                                                              paddingRight: 4,
                                                                          }
                                                                        : undefined
                                                                }
                                                            >
                                                                {sortedBatches.map(
                                                                    (
                                                                        batch,
                                                                        idx
                                                                    ) => (
                                                                        <Group
                                                                            key={
                                                                                batch.id ||
                                                                                idx
                                                                            }
                                                                            justify="space-between"
                                                                            wrap="nowrap"
                                                                        >
                                                                            <Text
                                                                                size="xs"
                                                                                fw={
                                                                                    500
                                                                                }
                                                                            >
                                                                                Lote{' '}
                                                                                {idx +
                                                                                    1}{' '}
                                                                                (
                                                                                {
                                                                                    batch.quantity
                                                                                }{' '}
                                                                                un.):
                                                                            </Text>
                                                                            <Text
                                                                                size="xs"
                                                                                fw={
                                                                                    700
                                                                                }
                                                                            >
                                                                                {formatDate(
                                                                                    batch.expirationDate
                                                                                )}
                                                                            </Text>
                                                                        </Group>
                                                                    )
                                                                )}
                                                            </Stack>
                                                        </Popover.Dropdown>
                                                    </Popover>
                                                ) : null;
                                            })()}
                                        </Group>
                                    </Table.Td>

                                    {/* Preço de Compra com vírgula */}
                                    <Table.Td
                                        fw={400}
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        <Group
                                            gap={4}
                                            align="center"
                                            wrap="nowrap"
                                        >
                                            <Text size="sm">
                                                R${' '}
                                                {formatCurrency(
                                                    product.purchasePrice
                                                )}
                                            </Text>
                                            {(() => {
                                                const sortedBatches = (
                                                    product.batches || []
                                                )
                                                    .slice()
                                                    .sort((a, b) => {
                                                        if (
                                                            !a.expirationDate &&
                                                            !b.expirationDate
                                                        )
                                                            return 0;
                                                        if (!a.expirationDate)
                                                            return 1;
                                                        if (!b.expirationDate)
                                                            return -1;
                                                        return a.expirationDate.localeCompare(
                                                            b.expirationDate
                                                        );
                                                    });
                                                return sortedBatches.length >
                                                    1 ? (
                                                    <Popover
                                                        width={280}
                                                        shadow="md"
                                                        withArrow
                                                        position="top"
                                                    >
                                                        <Popover.Target>
                                                            <ActionIcon
                                                                size="xs"
                                                                variant="light"
                                                                color="blue"
                                                                style={{
                                                                    cursor: 'pointer',
                                                                }}
                                                            >
                                                                <Plus
                                                                    size={12}
                                                                />
                                                            </ActionIcon>
                                                        </Popover.Target>
                                                        <Popover.Dropdown p="xs">
                                                            <Text
                                                                size="xs"
                                                                fw={700}
                                                                c="dimmed"
                                                                mb={6}
                                                            >
                                                                Preço de Compra
                                                                por Lote (
                                                                {
                                                                    sortedBatches.length
                                                                }{' '}
                                                                lotes):
                                                            </Text>
                                                            <Stack
                                                                gap={4}
                                                                style={
                                                                    sortedBatches.length >=
                                                                    4
                                                                        ? {
                                                                              maxHeight: 75,
                                                                              overflowY:
                                                                                  'auto',
                                                                              paddingRight: 4,
                                                                          }
                                                                        : undefined
                                                                }
                                                            >
                                                                {sortedBatches.map(
                                                                    (
                                                                        batch,
                                                                        idx
                                                                    ) => (
                                                                        <Group
                                                                            key={
                                                                                batch.id ||
                                                                                idx
                                                                            }
                                                                            justify="space-between"
                                                                            wrap="nowrap"
                                                                        >
                                                                            <Text
                                                                                size="xs"
                                                                                fw={
                                                                                    500
                                                                                }
                                                                            >
                                                                                Lote{' '}
                                                                                {idx +
                                                                                    1}{' '}
                                                                                (
                                                                                {
                                                                                    batch.quantity
                                                                                }{' '}
                                                                                un.):
                                                                            </Text>
                                                                            <Text
                                                                                size="xs"
                                                                                fw={
                                                                                    700
                                                                                }
                                                                            >
                                                                                R${' '}
                                                                                {formatCurrency(
                                                                                    batch.purchasePrice
                                                                                )}
                                                                            </Text>
                                                                        </Group>
                                                                    )
                                                                )}
                                                            </Stack>
                                                        </Popover.Dropdown>
                                                    </Popover>
                                                ) : null;
                                            })()}
                                        </Group>
                                    </Table.Td>

                                    {/* Preço de Venda com vírgula */}
                                    <Table.Td
                                        fw={400}
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        <Group
                                            gap={4}
                                            align="center"
                                            wrap="nowrap"
                                        >
                                            <Text size="sm">
                                                R${' '}
                                                {formatCurrency(
                                                    product.sellingPrice
                                                )}
                                            </Text>
                                            {(() => {
                                                const sortedBatches = (
                                                    product.batches || []
                                                )
                                                    .slice()
                                                    .sort((a, b) => {
                                                        if (
                                                            !a.expirationDate &&
                                                            !b.expirationDate
                                                        )
                                                            return 0;
                                                        if (!a.expirationDate)
                                                            return 1;
                                                        if (!b.expirationDate)
                                                            return -1;
                                                        return a.expirationDate.localeCompare(
                                                            b.expirationDate
                                                        );
                                                    });
                                                return sortedBatches.length >
                                                    1 ? (
                                                    <Popover
                                                        width={280}
                                                        shadow="md"
                                                        withArrow
                                                        position="top"
                                                    >
                                                        <Popover.Target>
                                                            <ActionIcon
                                                                size="xs"
                                                                variant="light"
                                                                color="blue"
                                                                style={{
                                                                    cursor: 'pointer',
                                                                }}
                                                            >
                                                                <Plus
                                                                    size={12}
                                                                />
                                                            </ActionIcon>
                                                        </Popover.Target>
                                                        <Popover.Dropdown p="xs">
                                                            <Text
                                                                size="xs"
                                                                fw={700}
                                                                c="dimmed"
                                                                mb={6}
                                                            >
                                                                Preço de Venda
                                                                por Lote (
                                                                {
                                                                    sortedBatches.length
                                                                }{' '}
                                                                lotes):
                                                            </Text>
                                                            <Stack
                                                                gap={4}
                                                                style={
                                                                    sortedBatches.length >=
                                                                    4
                                                                        ? {
                                                                              maxHeight: 75,
                                                                              overflowY:
                                                                                  'auto',
                                                                              paddingRight: 4,
                                                                          }
                                                                        : undefined
                                                                }
                                                            >
                                                                {sortedBatches.map(
                                                                    (
                                                                        batch,
                                                                        idx
                                                                    ) => (
                                                                        <Group
                                                                            key={
                                                                                batch.id ||
                                                                                idx
                                                                            }
                                                                            justify="space-between"
                                                                            wrap="nowrap"
                                                                        >
                                                                            <Text
                                                                                size="xs"
                                                                                fw={
                                                                                    500
                                                                                }
                                                                            >
                                                                                Lote{' '}
                                                                                {idx +
                                                                                    1}{' '}
                                                                                (
                                                                                {
                                                                                    batch.quantity
                                                                                }{' '}
                                                                                un.):
                                                                            </Text>
                                                                            <Text
                                                                                size="xs"
                                                                                fw={
                                                                                    700
                                                                                }
                                                                            >
                                                                                R${' '}
                                                                                {formatCurrency(
                                                                                    batch.sellingPrice
                                                                                )}
                                                                            </Text>
                                                                        </Group>
                                                                    )
                                                                )}
                                                            </Stack>
                                                        </Popover.Dropdown>
                                                    </Popover>
                                                ) : null;
                                            })()}
                                        </Group>
                                    </Table.Td>

                                    <Table.Td
                                        align="center"
                                        style={{ width: 50 }}
                                    >
                                        <Checkbox
                                            aria-label={`Selecionar produto ${product.name}`}
                                            checked={selectedIds.includes(
                                                product.id
                                            )}
                                            onChange={() =>
                                                handleToggleProduct(product.id)
                                            }
                                        />
                                    </Table.Td>
                                </Table.Tr>
                            ))
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
            </Table.ScrollContainer>

            {/* Pagination */}
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
