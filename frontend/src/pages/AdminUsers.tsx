import { useEffect, useState } from 'react';
import {
    Paper,
    Title,
    Text,
    Group,
    Button,
    Table,
    Badge,
    ActionIcon,
    Modal,
    TextInput,
    Stack,
    Alert,
    Center,
    Loader,
    Code,
    CopyButton,
    Tooltip,
} from '@mantine/core';
import { UserPlus, Trash2, Shield, User, Key, AlertTriangle, Copy, Check } from 'lucide-react';
import { userService, type CreateUserResponse } from '../services/userService';
import type { User as UserType } from '../services/authService';

export default function AdminUsers() {
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);

    // Create Modal State
    const [createOpened, setCreateOpened] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [createError, setCreateError] = useState('');
    const [createLoading, setCreateLoading] = useState(false);

    // Password Result Modal State
    const [resultData, setResultData] = useState<CreateUserResponse | null>(null);
    const [resultOpened, setResultOpened] = useState(false);

    // Delete Modal State
    const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
    const [deleteOpened, setDeleteOpened] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateError('');

        if (!name.trim() || !email.trim()) {
            setCreateError('Nome e E-mail são obrigatórios.');
            return;
        }

        try {
            setCreateLoading(true);
            const response = await userService.create(name.trim(), email.trim());
            setCreateOpened(false);
            setName('');
            setEmail('');
            setResultData(response);
            setResultOpened(true);
            fetchUsers();
        } catch (err: any) {
            setCreateError(err?.response?.data?.message || 'Erro ao cadastrar usuário.');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;

        try {
            setDeleteLoading(true);
            await userService.delete(userToDelete.id);
            setDeleteOpened(false);
            setUserToDelete(null);
            fetchUsers();
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <Stack gap="lg">
            {/* Top Header Bar */}
            <Paper shadow="xs" p="md" radius="md" withBorder>
                <Group justify="space-between" align="center" wrap="wrap" gap="md">
                    <div>
                        <Group gap="xs">
                            <Shield size={24} className="text-blue-600" />
                            <Title order={3}>Gerenciamento de Usuários (Painel Admin)</Title>
                        </Group>
                        <Text size="sm" c="dimmed" mt={2}>
                            Cadastre novos usuários no sistema ou remova contas com exclusão em cascata de dados.
                        </Text>
                    </div>

                    <Button
                        leftSection={<UserPlus size={16} />}
                        color="blue"
                        onClick={() => {
                            setName('');
                            setEmail('');
                            setCreateError('');
                            setCreateOpened(true);
                        }}
                    >
                        Novo Usuário
                    </Button>
                </Group>
            </Paper>

            {/* Users Table */}
            <Paper shadow="xs" p="md" radius="md" withBorder>
                <Table.ScrollContainer minWidth={700}>
                    <Table striped highlightOnHover verticalSpacing="sm">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>ID</Table.Th>
                                <Table.Th>Nome</Table.Th>
                                <Table.Th>E-mail</Table.Th>
                                <Table.Th>Papel</Table.Th>
                                <Table.Th>Status de Acesso</Table.Th>
                                <Table.Th style={{ textAlign: 'right' }}>Ações</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {loading ? (
                                <Table.Tr>
                                    <Table.Td colSpan={6} align="center" py="xl">
                                        <Center style={{ flexDirection: 'column', gap: 8 }}>
                                            <Loader size="sm" color="blue" />
                                            <Text size="sm" c="dimmed">
                                                Carregando usuários...
                                            </Text>
                                        </Center>
                                    </Table.Td>
                                </Table.Tr>
                            ) : users.length > 0 ? (
                                users.map((user) => (
                                    <Table.Tr key={user.id}>
                                        <Table.Td fw={600}>#{user.id}</Table.Td>
                                        <Table.Td fw={500}>
                                            <Group gap="xs">
                                                <User size={16} className="text-gray-500" />
                                                <Text size="sm">{user.name}</Text>
                                            </Group>
                                        </Table.Td>
                                        <Table.Td>{user.email}</Table.Td>
                                        <Table.Td>
                                            <Badge
                                                color={user.role === 'ADMIN' ? 'blue' : 'gray'}
                                                variant="light"
                                            >
                                                {user.role === 'ADMIN' ? 'Administrador' : 'Comum'}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            {user.firstAccess ? (
                                                <Badge color="orange" variant="light">
                                                    Senha Provisória
                                                </Badge>
                                            ) : (
                                                <Badge color="green" variant="light">
                                                    Senha Definida
                                                </Badge>
                                            )}
                                        </Table.Td>
                                        <Table.Td align="right">
                                            {user.role !== 'ADMIN' && (
                                                <ActionIcon
                                                    variant="light"
                                                    color="red"
                                                    title="Excluir Usuário"
                                                    onClick={() => {
                                                        setUserToDelete(user);
                                                        setDeleteOpened(true);
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </ActionIcon>
                                            )}
                                        </Table.Td>
                                    </Table.Tr>
                                ))
                            ) : (
                                <Table.Tr>
                                    <Table.Td colSpan={6} align="center" py="xl">
                                        <Text c="dimmed">Nenhum usuário cadastrado.</Text>
                                    </Table.Td>
                                </Table.Tr>
                            )}
                        </Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
            </Paper>

            {/* Modal: Novo Usuário */}
            <Modal
                opened={createOpened}
                onClose={() => setCreateOpened(false)}
                title={
                    <Group gap="xs">
                        <UserPlus size={20} className="text-blue-600" />
                        <Text fw={700}>Cadastrar Novo Usuário</Text>
                    </Group>
                }
                centered
            >
                <form onSubmit={handleCreateSubmit}>
                    <Stack gap="sm">
                        <Text size="xs" c="dimmed">
                            Uma senha provisória de 8 caracteres será gerada automaticamente para o primeiro acesso deste usuário.
                        </Text>

                        {createError && (
                            <Alert icon={<AlertTriangle size={16} />} color="red">
                                {createError}
                            </Alert>
                        )}

                        <TextInput
                            label="Nome do Usuário"
                            placeholder="Ex: Maria Oliveira"
                            value={name}
                            onChange={(e) => setName(e.currentTarget.value)}
                            required
                        />

                        <TextInput
                            label="E-mail de Acesso"
                            placeholder="maria@exemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.currentTarget.value)}
                            required
                        />

                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={() => setCreateOpened(false)} disabled={createLoading}>
                                Cancelar
                            </Button>
                            <Button type="submit" color="blue" loading={createLoading}>
                                Cadastrar Usuário
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            {/* Modal: Exibição da Senha Provisória Gerada */}
            <Modal
                opened={resultOpened}
                onClose={() => setResultOpened(false)}
                title={
                    <Group gap="xs">
                        <Key size={20} className="text-green-600" />
                        <Text fw={700}>Usuário Cadastrado com Sucesso!</Text>
                    </Group>
                }
                centered
            >
                <Stack gap="md">
                    <Text size="sm">
                        O usuário <b>{resultData?.user.name}</b> foi criado. Forneça as credenciais abaixo para que ele possa efetuar o primeiro acesso:
                    </Text>

                    <Paper p="md" withBorder radius="md" bg="var(--mantine-color-gray-0)">
                        <Stack gap="xs">
                            <Group justify="space-between">
                                <Text size="xs" c="dimmed" fw={700}>
                                    E-MAIL:
                                </Text>
                                <Text size="sm" fw={600}>
                                    {resultData?.user.email}
                                </Text>
                            </Group>

                            <Group justify="space-between" align="center">
                                <Text size="xs" c="dimmed" fw={700}>
                                    SENHA PROVISÓRIA:
                                </Text>
                                <Group gap="xs">
                                    <Code fw={700} style={{ fontSize: 16, letterSpacing: 1 }}>
                                        {resultData?.generatedPassword}
                                    </Code>

                                    <CopyButton value={resultData?.generatedPassword || ''}>
                                        {({ copied, copy }) => (
                                            <Tooltip label={copied ? 'Copiado!' : 'Copiar Senha'}>
                                                <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                                </ActionIcon>
                                            </Tooltip>
                                        )}
                                    </CopyButton>
                                </Group>
                            </Group>
                        </Stack>
                    </Paper>

                    <Alert color="blue" radius="md">
                        No primeiro login, o sistema solicitará automaticamente que este usuário altere esta senha provisória.
                    </Alert>

                    <Button color="blue" fullWidth onClick={() => setResultOpened(false)}>
                        Entendi e Copiei a Senha
                    </Button>
                </Stack>
            </Modal>

            {/* Modal: Exclusão de Usuário */}
            <Modal
                opened={deleteOpened}
                onClose={() => setDeleteOpened(false)}
                title={
                    <Group gap="xs">
                        <AlertTriangle size={22} className="text-red-600" />
                        <Text fw={700} c="red">
                            Confirmar Exclusão de Usuário
                        </Text>
                    </Group>
                }
                centered
            >
                <Stack gap="md">
                    <Text size="sm">
                        Tem certeza que deseja excluir a conta de <b>{userToDelete?.name}</b> ({userToDelete?.email})?
                    </Text>

                    <Alert color="red" radius="md">
                        <b>Atenção:</b> Esta ação excluirá permanentemente <b>todos os produtos, clientes e histórico de vendas</b> pertencentes a este usuário!
                    </Alert>

                    <Group justify="flex-end">
                        <Button variant="default" onClick={() => setDeleteOpened(false)} disabled={deleteLoading}>
                            Cancelar
                        </Button>
                        <Button color="red" loading={deleteLoading} onClick={handleDeleteConfirm}>
                            Excluir Usuário e Dados
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Stack>
    );
}
