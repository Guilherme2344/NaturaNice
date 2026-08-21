import { Container, Title, Text, Button, Group, Paper, Stack } from '@mantine/core';
import { ServerOff, RotateCcw, Home } from 'lucide-react';
import { Link } from 'react-router';

interface ServerErrorProps {
    code?: number;
    title?: string;
    message?: string;
}

// 500 / 503 Server Error page
export default function ServerError({
    code = 503,
    title = 'Servidor Indisponível',
    message = 'O serviço está temporariamente indisponível para manutenção ou falha de conexão com o servidor.',
}: ServerErrorProps) {
    const handleReload = () => {
        window.location.reload();
    };

    return (
        <Container size="sm" py={80}>
            <Paper shadow="md" radius="lg" p="xl" withBorder style={{ textAlign: 'center' }}>
                <Stack align="center" gap="md">
                    <Paper p="md" radius="xl" bg="orange.0" style={{ display: 'inline-flex' }}>
                        <ServerOff size={48} color="#fd7e14" />
                    </Paper>

                    <div>
                        <Text size="xs" fw={800} c="orange" tt="uppercase">
                            Erro {code}
                        </Text>
                        <Title order={2} mt={4}>
                            {title}
                        </Title>
                        <Text size="sm" c="dimmed" mt="xs" style={{ maxWidth: 440, margin: '0 auto' }}>
                            {message}
                        </Text>
                    </div>

                    <Group justify="center" mt="md" gap="sm">
                        <Button
                            variant="default"
                            size="md"
                            leftSection={<RotateCcw size={18} />}
                            onClick={handleReload}
                        >
                            Tentar Novamente
                        </Button>
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
