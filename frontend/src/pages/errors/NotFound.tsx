import { Container, Title, Text, Button, Group, Paper, Stack } from '@mantine/core';
import { FileQuestion, Home } from 'lucide-react';
import { Link } from 'react-router';

// 404 Page Not Found component
export default function NotFound() {
    return (
        <Container size="sm" py={80}>
            <Paper shadow="md" radius="lg" p="xl" withBorder style={{ textAlign: 'center' }}>
                <Stack align="center" gap="md">
                    <Paper p="md" radius="xl" bg="blue.0" style={{ display: 'inline-flex' }}>
                        <FileQuestion size={48} color="#1c7ed6" />
                    </Paper>

                    <div>
                        <Text size="xs" fw={800} c="blue" tt="uppercase">
                            Erro 404
                        </Text>
                        <Title order={2} mt={4}>
                            Página Não Encontrada
                        </Title>
                        <Text size="sm" c="dimmed" mt="xs" style={{ maxWidth: 400, margin: '0 auto' }}>
                            A página que você tentou acessar não existe, foi removida ou o endereço está incorreto.
                        </Text>
                    </div>

                    <Group justify="center" mt="md">
                        <Button
                            component={Link}
                            to="/"
                            color="blue"
                            size="md"
                            leftSection={<Home size={18} />}
                        >
                            Voltar para o Início
                        </Button>
                    </Group>
                </Stack>
            </Paper>
        </Container>
    );
}
