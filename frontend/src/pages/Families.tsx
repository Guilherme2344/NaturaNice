import { useEffect, useState } from 'react';
import { Loader, Center, Text } from '@mantine/core';
import EntityTable from '../components/EntityTable';
import type { Entity } from '../components/EntityTable';
import { entityService } from '../services/entityService';

export default function Families() {
    const [families, setFamilies] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFamilies = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await entityService.getFamilies();
            setFamilies(data);
        } catch (err) {
            console.error('Erro ao buscar famílias:', err);
            setError('Erro ao carregar as famílias do servidor.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFamilies();
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
            title="Famílias"
            subtitle="Famílias e subgrupos de produtos"
            items={families}
            showColor={false}
            onAdd={() => console.log('Novo cadastro')}
            onEdit={(item) => console.log('Editar:', item)}
            onDelete={(id) => console.log('Excluir ID:', id)}
        />
    );
}
