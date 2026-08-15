import { useEffect, useState } from 'react';
import { Loader, Center, Text } from '@mantine/core';
import EntityTable from '../components/EntityTable';
import type { Entity } from '../components/EntityTable';
import { entityService } from '../services/entityService';

export default function Categories() {
    const [categories, setCategories] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await entityService.getCategories();
            setCategories(data);
        } catch (err) {
            console.error('Erro ao buscar categorias:', err);
            setError('Erro ao carregar as categorias do servidor.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    if (loading) {
        return (
            <Center py="xl">
                <Loader size="lg" color="blue" />
            </Center>
        );
    }

    if (error) {
        return (
            <Center py="xl">
                <Text c="red">{error}</Text>
            </Center>
        );
    }

    return (
        <EntityTable
            title="Categorias"
            subtitle="Categorias de produtos no estoque"
            items={categories}
            showColor={false}
            onAdd={() => console.log('Novo cadastro')}
            onEdit={(item) => console.log('Editar:', item)}
            onDelete={(id) => console.log('Excluir ID:', id)}
        />
    );
}
