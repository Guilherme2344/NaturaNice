import React, { useState, useEffect } from 'react';
import {
    Modal,
    TextInput,
    NumberInput,
    Select,
    Button,
    Group,
    Stack,
    Grid,
} from '@mantine/core';
import type { CreateProductDTO } from '../services/productService';
import type { Product } from '../components/ProductsTable';
import type { Entity } from '../components/EntityTable';

interface ProductModalProps {
    opened: boolean;
    onClose: () => void;
    brands: Entity[];
    categories: Entity[];
    families: Entity[];
    initialData?: Product | null;
    onSubmit: (data: CreateProductDTO) => Promise<void>;
}

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
    const [expirationDate, setExpirationDate] = useState('');
    const [purchasePrice, setPurchasePrice] = useState<number | string>(0);
    const [sellingPrice, setSellingPrice] = useState<number | string>(0);
    const [brandId, setBrandId] = useState<string | null>(null);
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [familyId, setFamilyId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (opened) {
            if (initialData) {
                setName(initialData.name || '');
                setQuantity(initialData.quantity || 0);
                setExpirationDate(initialData.expirationDate || '');
                setPurchasePrice(initialData.purchasePrice || 0);
                setSellingPrice(initialData.sellingPrice || 0);
                setBrandId(
                    initialData.brand?.id ? String(initialData.brand.id) : null
                );
                setCategoryId(
                    initialData.category?.id
                        ? String(initialData.category.id)
                        : null
                );
                setFamilyId(
                    initialData.family?.id
                        ? String(initialData.family.id)
                        : null
                );
            } else {
                setName('');
                setQuantity(1);
                setExpirationDate('');
                setPurchasePrice(0);
                setSellingPrice(0);
                setBrandId(null);
                setCategoryId(null);
                setFamilyId(null);
            }
        }
    }, [opened, initialData]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const numBrandId = Number(brandId);
        const numCategoryId = Number(categoryId);
        const numFamilyId = Number(familyId);

        if (
            !name.trim() ||
            !numBrandId ||
            !numCategoryId ||
            !numFamilyId ||
            !expirationDate
        ) {
            alert('Preencha todos os campos obrigatórios.');
            return;
        }

        try {
            setLoading(true);
            const payload: CreateProductDTO = {
                name: name.trim(),
                quantity: Number(quantity) || 0,
                expirationDate,
                purchasePrice: Number(purchasePrice) || 0,
                sellingPrice: Number(sellingPrice) || 0,
                brandId: numBrandId,
                categoryId: numCategoryId,
                familyId: numFamilyId,
            };

            await onSubmit(payload);
            onClose();
        } catch (error: any) {
            console.error(
                'Erro ao salvar produto:',
                error.response?.data || error
            );
            alert('Erro ao salvar produto.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={initialData ? 'Editar Produto' : 'Cadastrar Novo Produto'}
            size="lg"
            centered
            radius="md"
        >
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    <TextInput
                        label="Nome do Produto"
                        required
                        value={name}
                        onChange={(e) => setName(e.currentTarget.value)}
                    />

                    <Grid>
                        <Grid.Col span={4}>
                            <Select
                                label="Marca"
                                required
                                data={brands.map((b) => ({
                                    value: String(b.id),
                                    label: b.name,
                                }))}
                                value={brandId}
                                onChange={setBrandId}
                                searchable
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Select
                                label="Categoria"
                                required
                                data={categories.map((c) => ({
                                    value: String(c.id),
                                    label: c.name,
                                }))}
                                value={categoryId}
                                onChange={setCategoryId}
                                searchable
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Select
                                label="Família"
                                required
                                data={families.map((f) => ({
                                    value: String(f.id),
                                    label: f.name,
                                }))}
                                value={familyId}
                                onChange={setFamilyId}
                                searchable
                            />
                        </Grid.Col>
                    </Grid>

                    <Grid>
                        <Grid.Col span={6}>
                            <NumberInput
                                label="Quantidade"
                                required
                                min={0}
                                value={quantity}
                                onChange={setQuantity}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                type="date"
                                label="Data de Vencimento"
                                required
                                value={expirationDate}
                                onChange={(e) =>
                                    setExpirationDate(e.currentTarget.value)
                                }
                            />
                        </Grid.Col>
                    </Grid>

                    <Grid>
                        <Grid.Col span={6}>
                            <NumberInput
                                label="Preço de Compra (R$)"
                                decimalScale={2}
                                fixedDecimalScale
                                min={0}
                                prefix="R$ "
                                required
                                value={purchasePrice}
                                onChange={setPurchasePrice}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <NumberInput
                                label="Preço de Venda (R$)"
                                decimalScale={2}
                                fixedDecimalScale
                                min={0}
                                prefix="R$ "
                                required
                                value={sellingPrice}
                                onChange={setSellingPrice}
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
                        <Button type="submit" color="blue" loading={loading}>
                            {initialData
                                ? 'Salvar Alterações'
                                : 'Cadastrar Produto'}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
