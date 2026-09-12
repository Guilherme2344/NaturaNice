import React, { useState, useEffect } from 'react';
import {
    Modal,
    TextInput,
    NumberInput,
    Select,
    Autocomplete,
    Button,
    Group,
    Stack,
    Grid,
    ActionIcon,
    Text,
    ColorInput,
    Checkbox,
} from '@mantine/core';
import { Plus, Layers, FolderTree } from 'lucide-react';
import type { CreateProductDTO } from '../services/productService';
import type { Product } from '../components/ProductsTable';
import type { Entity } from '../components/EntityTable';
import { productSchema, validateWithYup } from '../schemas/validationSchemas';
import { useCreateBrandMutation } from '../hooks/useEntitiesQuery';
import { accentInsensitiveFilter } from '../utils/stringUtils';

interface ProductModalProps {
    opened: boolean;
    onClose: () => void;
    brands: Entity[];
    categories: Entity[];
    families: Entity[];
    initialData?: Product | null;
    onSubmit: (data: CreateProductDTO) => Promise<void>;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

export function ProductModal({
    opened,
    onClose,
    brands,
    categories,
    families,
    initialData,
    onSubmit,
}: ProductModalProps) {
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState<number | string>(1);
    const [purchaseDate, setPurchaseDate] = useState<string>(getTodayString());
    const [expirationDate, setExpirationDate] = useState('');
    const [isIndeterminateExpiration, setIsIndeterminateExpiration] = useState(false);
    const [purchasePrice, setPurchasePrice] = useState<number | string>(0);
    const [sellingPrice, setSellingPrice] = useState<number | string>(0);
    const [brandId, setBrandId] = useState<string | null>(null);
    const [categoryName, setCategoryName] = useState('');
    const [familyName, setFamilyName] = useState('');
    const [loading, setLoading] = useState(false);

    const createBrandMutation = useCreateBrandMutation();

    const [quickBrandModalOpened, setQuickBrandModalOpened] = useState(false);
    const [quickBrandName, setQuickBrandName] = useState('');
    const [quickBrandColor, setQuickBrandColor] = useState('#1c7ed6');
    const [quickBrandLoading, setQuickBrandLoading] = useState(false);
    const [quickBrandError, setQuickBrandError] = useState('');

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (opened) {
            setErrors({});
            if (initialData) {
                setName(initialData.name || '');
                setQuantity(initialData.quantity || 0);
                setPurchaseDate(initialData.purchaseDate || getTodayString());
                const hasExp = Boolean(initialData.expirationDate);
                setIsIndeterminateExpiration(!hasExp);
                setExpirationDate(initialData.expirationDate || '');
                setPurchasePrice(initialData.purchasePrice || 0);
                setSellingPrice(initialData.sellingPrice || 0);
                setBrandId(
                    initialData.brand?.id ? String(initialData.brand.id) : null
                );
                setCategoryName(initialData.category?.name || '');
                setFamilyName(initialData.family?.name || '');
            } else {
                setName('');
                setQuantity(1);
                setPurchaseDate(getTodayString());
                setIsIndeterminateExpiration(false);
                setExpirationDate('');
                setPurchasePrice(0);
                setSellingPrice(0);
                setBrandId(null);
                setCategoryName('');
                setFamilyName('');
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

    const handleOpenQuickBrand = () => {
        setQuickBrandName('');
        setQuickBrandColor('#1c7ed6');
        setQuickBrandError('');
        setQuickBrandModalOpened(true);
    };

    const handleSaveQuickBrand = async () => {
        const trimmed = quickBrandName.trim();
        if (!trimmed) {
            setQuickBrandError('O nome da marca é obrigatório.');
            return;
        }
        if (trimmed.length < 2) {
            setQuickBrandError('O nome deve ter no mínimo 2 caracteres.');
            return;
        }

        try {
            setQuickBrandLoading(true);
            setQuickBrandError('');

            const res = await createBrandMutation.mutateAsync({
                name: trimmed,
                hexColor: quickBrandColor || '#1c7ed6',
            });

            if (res?.id) {
                setBrandId(String(res.id));
                clearError('brandId');
            }

            setQuickBrandModalOpened(false);
        } catch (err: any) {
            setQuickBrandError(
                err?.response?.data?.message || 'Erro ao cadastrar marca.'
            );
        } finally {
            setQuickBrandLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const effectivePurchaseDate = purchaseDate || getTodayString();

        const formData = {
            name: name.trim(),
            brandId,
            categoryName: categoryName.trim(),
            familyName: familyName.trim(),
            quantity: Number(quantity),
            purchaseDate: effectivePurchaseDate,
            expirationDate: isIndeterminateExpiration ? null : expirationDate,
            isIndeterminateExpiration,
            purchasePrice: Number(purchasePrice),
            sellingPrice: Number(sellingPrice),
        };

        const { isValid, errors: validationErrors } = await validateWithYup(
            productSchema,
            formData
        );

        if (isValid && Number(sellingPrice) < Number(purchasePrice)) {
            validationErrors.sellingPrice =
                'Preço de venda inferior ao de compra.';
            setErrors(validationErrors);
            return;
        }

        if (!isValid) {
            setErrors(validationErrors);
            return;
        }

        try {
            setLoading(true);
            const matchedBrand = brands.find(
                (b) => String(b.id) === String(brandId)
            );
            const matchedCategory = categories.find(
                (c) =>
                    c.name.toLowerCase() === categoryName.trim().toLowerCase()
            );
            const availableFamilies = families.filter((f) => {
                if (!brandId) return true;
                return !f.brand?.id || String(f.brand.id) === String(brandId);
            });
            const matchedFamily = availableFamilies.find(
                (f) => f.name.toLowerCase() === familyName.trim().toLowerCase()
            ) || families.find(
                (f) => f.name.toLowerCase() === familyName.trim().toLowerCase()
            );

            const payload: CreateProductDTO = {
                name: name.trim(),
                quantity: Number(quantity) || 0,
                purchaseDate: effectivePurchaseDate,
                expirationDate: isIndeterminateExpiration ? undefined : (expirationDate || undefined),
                purchasePrice: Number(purchasePrice) || 0,
                sellingPrice: Number(sellingPrice) || 0,
                brandId: brandId || undefined,
                brandName: matchedBrand ? matchedBrand.name : undefined,
                categoryId: matchedCategory ? matchedCategory.id : undefined,
                categoryName: categoryName.trim(),
                familyId: matchedFamily ? matchedFamily.id : undefined,
                familyName: familyName.trim(),
            };

            await onSubmit(payload);
            onClose();
        } catch (error: any) {
            console.error(
                'Erro ao salvar produto:',
                error.response?.data || error
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Modal
                opened={opened}
                onClose={onClose}
                title={
                    initialData ? 'Editar Produto' : 'Cadastrar Novo Produto'
                }
                size="lg"
                centered
                radius="md"
            >
                <form onSubmit={handleSubmit} noValidate>
                    <Stack gap="md">
                        <Stack gap={4}>
                            <Group justify="space-between" align="center">
                                <Text size="sm" fw={500}>
                                    Nome do Produto{' '}
                                    <Text component="span" c="red">
                                        *
                                    </Text>
                                </Text>
                                <Text size="xs" c="dimmed">
                                    {name.length}/255
                                </Text>
                            </Group>
                            <TextInput
                                placeholder="Nome do produto"
                                required
                                maxLength={255}
                                value={name}
                                error={errors.name}
                                onChange={(e) => {
                                    setName(e.currentTarget.value);
                                    clearError('name');
                                }}
                            />
                        </Stack>

                        <Grid>
                            <Grid.Col span={4}>
                                <Stack gap={4}>
                                    <Group
                                        justify="space-between"
                                        align="center"
                                        style={{ minHeight: 22 }}
                                    >
                                        <Text size="sm" fw={500}>
                                            Marca{' '}
                                            <Text component="span" c="red">
                                                *
                                            </Text>
                                        </Text>
                                        <ActionIcon
                                            size="xs"
                                            variant="light"
                                            color="blue"
                                            title="Cadastrar Nova Marca"
                                            onClick={handleOpenQuickBrand}
                                        >
                                            <Plus size={12} />
                                        </ActionIcon>
                                    </Group>
                                    <Select
                                        data={brands.map((b) => ({
                                            value: String(b.id),
                                            label: b.name,
                                        }))}
                                        value={brandId}
                                        error={errors.brandId}
                                        onChange={(val) => {
                                            setBrandId(val);
                                            clearError('brandId');
                                        }}
                                        searchable
                                        filter={accentInsensitiveFilter}
                                        styles={{
                                            dropdown: {
                                                maxHeight: 140,
                                                overflowY: 'auto',
                                            },
                                        }}
                                        placeholder="Selecione a marca"
                                    />
                                </Stack>
                            </Grid.Col>

                            <Grid.Col span={4}>
                                <Stack gap={4}>
                                    <Group
                                        justify="space-between"
                                        align="center"
                                        style={{ minHeight: 22 }}
                                    >
                                        <Text size="sm" fw={500}>
                                            Categoria{' '}
                                            <Text component="span" c="red">
                                                *
                                            </Text>
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            {categoryName.length}/100
                                        </Text>
                                    </Group>
                                    <Autocomplete
                                        placeholder="Digite ou escolha uma categoria"
                                        data={categories.map((c) => c.name)}
                                        maxLength={100}
                                        value={categoryName}
                                        error={errors.categoryName}
                                        onChange={(val) => {
                                            setCategoryName(val);
                                            clearError('categoryName');
                                        }}
                                        filter={accentInsensitiveFilter}
                                        styles={{
                                            dropdown: {
                                                maxHeight: 140,
                                                overflowY: 'auto',
                                            },
                                        }}
                                        required
                                        leftSection={<Layers size={16} />}
                                    />
                                </Stack>
                            </Grid.Col>

                            <Grid.Col span={4}>
                                <Stack gap={4}>
                                    <Group
                                        justify="space-between"
                                        align="center"
                                        style={{ minHeight: 22 }}
                                    >
                                        <Text size="sm" fw={500}>
                                            Família{' '}
                                            <Text component="span" c="red">
                                                *
                                            </Text>
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            {familyName.length}/100
                                        </Text>
                                    </Group>
                                    <Autocomplete
                                        placeholder="Digite ou escolha uma família"
                                        data={families
                                            .filter((f) => !brandId || !f.brand?.id || String(f.brand.id) === String(brandId))
                                            .map((f) => f.name)}
                                        maxLength={100}
                                        value={familyName}
                                        error={errors.familyName}
                                        onChange={(val) => {
                                            setFamilyName(val);
                                            clearError('familyName');
                                        }}
                                        filter={accentInsensitiveFilter}
                                        styles={{
                                            dropdown: {
                                                maxHeight: 140,
                                                overflowY: 'auto',
                                            },
                                        }}
                                        required
                                        leftSection={<FolderTree size={16} />}
                                    />
                                </Stack>
                            </Grid.Col>
                        </Grid>

                        <Grid>
                            <Grid.Col span={4}>
                                <NumberInput
                                    label="Quantidade"
                                    required
                                    min={0}
                                    value={quantity}
                                    error={errors.quantity}
                                    onChange={(val) => {
                                        setQuantity(val);
                                        clearError('quantity');
                                    }}
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <TextInput
                                    type="date"
                                    label="Data de Compra"
                                    required
                                    value={purchaseDate}
                                    error={errors.purchaseDate}
                                    onChange={(e) => {
                                        setPurchaseDate(e.currentTarget.value);
                                        clearError('purchaseDate');
                                    }}
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <TextInput
                                    type="date"
                                    label="Data de Vencimento"
                                    required={!isIndeterminateExpiration}
                                    placeholder={isIndeterminateExpiration ? 'Validade indeterminada' : 'Selecione a data'}
                                    disabled={isIndeterminateExpiration}
                                    value={expirationDate}
                                    error={errors.expirationDate}
                                    onChange={(e) => {
                                        setExpirationDate(
                                            e.currentTarget.value
                                        );
                                        clearError('expirationDate');
                                    }}
                                />
                                <Checkbox
                                    mt={6}
                                    size="xs"
                                    label="Indeterminada"
                                    checked={isIndeterminateExpiration}
                                    onChange={(e) => {
                                        const checked = e.currentTarget.checked;
                                        setIsIndeterminateExpiration(checked);
                                        if (checked) {
                                            setExpirationDate('');
                                            clearError('expirationDate');
                                        }
                                    }}
                                />
                            </Grid.Col>
                        </Grid>

                        <Grid>
                            <Grid.Col span={6}>
                                <NumberInput
                                    label="Preço de Compra (R$)"
                                    decimalScale={2}
                                    decimalSeparator=","
                                    thousandSeparator="."
                                    selectAllOnFocus
                                    min={0}
                                    prefix="R$ "
                                    required
                                    value={purchasePrice}
                                    error={errors.purchasePrice}
                                    onChange={(val) => {
                                        setPurchasePrice(val);
                                        clearError('purchasePrice');
                                    }}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <NumberInput
                                    label="Preço de Venda (R$)"
                                    decimalScale={2}
                                    decimalSeparator=","
                                    thousandSeparator="."
                                    selectAllOnFocus
                                    min={0}
                                    prefix="R$ "
                                    required
                                    value={sellingPrice}
                                    error={errors.sellingPrice}
                                    onChange={(val) => {
                                        setSellingPrice(val);
                                        clearError('sellingPrice');
                                    }}
                                />
                            </Grid.Col>
                        </Grid>

                        <Group justify="flex-end" mt="md">
                            <Button
                                variant="default"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                color="blue"
                                loading={loading}
                            >
                                {initialData
                                    ? 'Salvar Alterações'
                                    : 'Cadastrar Produto'}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            <Modal
                opened={quickBrandModalOpened}
                onClose={() => setQuickBrandModalOpened(false)}
                title="Cadastrar Nova Marca"
                size="sm"
                centered
                radius="md"
            >
                <Stack gap="md">
                    <Stack gap={4}>
                        <Group justify="space-between" align="center">
                            <Text size="sm" fw={500}>
                                Nome da Marca{' '}
                                <Text component="span" c="red">
                                    *
                                </Text>
                            </Text>
                            <Text size="xs" c="dimmed">
                                {quickBrandName.length}/100
                            </Text>
                        </Group>
                        <TextInput
                            placeholder="Ex: Natura"
                            required
                            maxLength={100}
                            value={quickBrandName}
                            error={quickBrandError}
                            onChange={(e) => {
                                setQuickBrandName(e.currentTarget.value);
                                setQuickBrandError('');
                            }}
                        />
                    </Stack>

                    <ColorInput
                        label="Cor da Marca (opcional)"
                        placeholder="Escolha uma cor"
                        value={quickBrandColor}
                        onChange={setQuickBrandColor}
                        format="hex"
                        swatches={[
                            '#1c7ed6',
                            '#099268',
                            '#f59f00',
                            '#e03131',
                            '#748ffc',
                            '#f783ac',
                            '#ae3ec9',
                            '#4263eb',
                        ]}
                    />

                    <Group justify="flex-end" mt="sm">
                        <Button
                            variant="default"
                            size="xs"
                            onClick={() => setQuickBrandModalOpened(false)}
                            disabled={quickBrandLoading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            size="xs"
                            color="blue"
                            loading={quickBrandLoading}
                            onClick={handleSaveQuickBrand}
                        >
                            Cadastrar
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}
