import { useEffect, useState } from 'react';
import { Loader, Center, Text } from '@mantine/core';
import EntityTable from '../components/EntityTable';
import type { Entity } from '../components/EntityTable';
import { entityService } from '../services/entityService';

export default function Brands() {
    const [brands, setBrands] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBrands = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await entityService.getBrands();
            setBrands(data);
        } catch (err) {
            console.error('Erro ao buscar marcas:', err);
            setError('Erro ao carregar as marcas do servidor.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
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
            title="Marcas"
            subtitle="Marcas cadastradas no sistema"
            items={brands}
            showColor={true} // Exibe a cor hexadecimal enviada pelo backend
            onAdd={() => console.log('Novo cadastro')}
            onEdit={(item) => console.log('Editar:', item)}
            onDelete={(id) => console.log('Excluir ID:', id)}
        />
    );
}
