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
import type { Entity } from '../components/EntityTable';

interface ProductModalProps {
    opened: boolean;
    onClose: () => void;
    brands: Entity[];
    categories: Entity[];
    families: Entity[];
    onSubmit: (data: CreateProductDTO) => Promise<void>;
}

export function ProductModal({
    opened,
    onClose,
    brands,
    categories,
    families,
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
            setName('');
            setQuantity(1);
            setExpirationDate('');
            setPurchasePrice(0);
            setSellingPrice(0);
            setBrandId(null);
            setCategoryId(null);
            setFamilyId(null);
        }
    }, [opened]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const numBrandId = Number(brandId);
        const numCategoryId = Number(categoryId);
        const numFamilyId = Number(familyId);

        // Validação: Garante que um item real da lista foi selecionado (ID > 0)
        if (!name.trim()) {
            alert('Informe o nome do produto.');
            return;
        }
        if (!brandId || numBrandId <= 0) {
            alert('Selecione uma Marca válida.');
            return;
        }
        if (!categoryId || numCategoryId <= 0) {
            alert('Selecione uma Categoria válida.');
            return;
        }
        if (!familyId || numFamilyId <= 0) {
            alert('Selecione uma Família válida.');
            return;
        }
        if (!expirationDate) {
            alert('Informe a data de vencimento.');
            return;
        }

        try {
            setLoading(true);

            // Payload plano com IDs numéricos reais
            const payload: CreateProductDTO = {
                name: name.trim(),
                quantity: Number(quantity) || 0,
                expirationDate, // "YYYY-MM-DD"
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
                'Erro retornado pelo Quarkus:',
                error.response?.data || error
            );
            alert(
                'Erro 400 ao cadastrar: ' +
                    (JSON.stringify(error.response?.data) ||
                        'Verifique se os campos atendem às validações do backend.')
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Cadastrar Novo Produto"
            size="lg"
            centered
            radius="md"
        >
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    <TextInput
                        label="Nome do Produto"
                        placeholder="Ex: Batom Ultramatte Vermelho"
                        required
                        value={name}
                        onChange={(e) => setName(e.currentTarget.value)}
                    />

                    <Grid>
                        <Grid.Col span={4}>
                            <Select
                                label="Marca"
                                placeholder="Selecione"
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
                                placeholder="Selecione"
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
                                placeholder="Selecione"
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
                                label="Quantidade em Estoque"
                                placeholder="0"
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
                                placeholder="0.00"
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
                                placeholder="0.00"
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
                            Cadastrar Produto
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
