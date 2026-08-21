import { Container, Title, Text, Button, Group, Paper, Stack } from '@mantine/core';
import { ShieldAlert, Home } from 'lucide-react';
import { Link } from 'react-router';

// 403 Forbidden Access error page
export default function Forbidden() {
    return (
        <Container size="sm" py={80}>
            <Paper shadow="md" radius="lg" p="xl" withBorder style={{ textAlign: 'center' }}>
                <Stack align="center" gap="md">
                    <Paper p="md" radius="xl" bg="red.0" style={{ display: 'inline-flex' }}>
                        <ShieldAlert size={48} color="#fa5252" />
                    </Paper>

                    <div>
                        <Text size="xs" fw={800} c="red" tt="uppercase">
                            Erro 403
                        </Text>
                        <Title order={2} mt={4}>
                            Acesso Restrito
                        </Title>
                        <Text size="sm" c="dimmed" mt="xs" style={{ maxWidth: 420, margin: '0 auto' }}>
                            Você não possui permissão de administrador para visualizar este recurso ou gerenciar este modulo.
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
