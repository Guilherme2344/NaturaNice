import { useEffect, useState } from 'react';
import {
    Paper,
    Title,
    Text,
    Group,
    Table,
    Button,
    Badge,
    ActionIcon,
    Modal,
    TextInput,
    Stack,
    Alert,
    Loader,
    Center,
} from '@mantine/core';
import {
    Shield,
    UserPlus,
    Trash2,
    AlertTriangle,
    User,
    CheckCircle2,
} from 'lucide-react';
import { userService, type UserAdminDTO } from '../services/userService';
import { userAdminSchema, validateWithYup } from '../schemas/validationSchemas';

export default function AdminUsers() {
    const [users, setUsers] = useState<UserAdminDTO[]>([]);
    const [loading, setLoading] = useState(true);

    // Register modal
    const [createOpened, setCreateOpened] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Delete modal
    const [deleteOpened, setDeleteOpened] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserAdminDTO | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // friendly success alert
    const [successMessage, setSuccessMessage] = useState('');

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

    const clearFieldError = (field: string) => {
        if (fieldErrors[field]) {
            setFieldErrors((prev) => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    };

    // validated by yup
    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateError('');
        setSuccessMessage('');

        const { isValid, errors } = await validateWithYup(userAdminSchema, {
            name: name.trim(),
            email: email.trim(),
        });

        if (!isValid) {
            setFieldErrors(errors);
            return;
        }

        try {
            setCreateLoading(true);
            const createdUser = await userService.create(
                name.trim(),
                email.trim()
            );
            setCreateOpened(false);
            setName('');
            setEmail('');
            setFieldErrors({});
            setSuccessMessage(
                `Usuário "${createdUser.name}" cadastrado com sucesso! A senha provisória de primeiro acesso foi enviada diretamente para o e-mail (${createdUser.email}).`
            );
            fetchUsers();
        } catch (err: any) {
            setCreateError(
                err?.response?.data?.message || 'Erro ao cadastrar usuário.'
            );
        } finally {
            setCreateLoading(false);
        }
    };

    // delete all user data from database
    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;

        const deletedName = userToDelete.name;
        try {
            setDeleteLoading(true);
            setSuccessMessage('');
            await userService.delete(userToDelete.id);
            setDeleteOpened(false);
            setSuccessMessage(
                `Usuário "${deletedName}" e todos os seus dados vinculados foram excluídos com sucesso!`
            );
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
                <Group
                    justify="space-between"
                    align="center"
                    wrap="wrap"
                    gap="md"
                >
                    <div>
                        <Group gap="xs">
                            <Shield size={24} color="#1c7ed6" />
                            <Title order={3}>Gerenciamento de Usuários</Title>
                        </Group>
                        <Text size="sm" c="dimmed" mt={2}>
                            Cadastre novos usuários no sistema ou gerencie
                            permissões de acesso
                        </Text>
                    </div>

                    <Button
                        leftSection={<UserPlus size={18} />}
                        color="blue"
                        onClick={() => {
                            setName('');
                            setEmail('');
                            setCreateError('');
                            setFieldErrors({});
                            setCreateOpened(true);
                        }}
                    >
                        Novo Usuário
                    </Button>
                </Group>
            </Paper>

            {/* Success Alert Banner */}
            {successMessage && (
                <Alert
                    icon={<CheckCircle2 size={18} />}
                    color="teal"
                    radius="md"
                    withCloseButton
                    onClose={() => setSuccessMessage('')}
                >
                    {successMessage}
                </Alert>
            )}

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
                                <Table.Th style={{ textAlign: 'right' }}>
                                    Ações
                                </Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {loading ? (
                                <Table.Tr>
                                    <Table.Td
                                        colSpan={6}
                                        align="center"
                                        py="xl"
                                    >
                                        <Center
                                            style={{
                                                flexDirection: 'column',
                                                gap: 8,
                                            }}
                                        >
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
                                                <User
                                                    size={16}
                                                    color="#868e96"
                                                />
                                                <Text size="sm">
                                                    {user.name}
                                                </Text>
                                            </Group>
                                        </Table.Td>
                                        <Table.Td>{user.email}</Table.Td>
                                        <Table.Td>
                                            <Badge
                                                color={
                                                    user.role === 'ADMIN'
                                                        ? 'blue'
                                                        : 'gray'
                                                }
                                                variant="light"
                                            >
                                                {user.role === 'ADMIN'
                                                    ? 'Administrador'
                                                    : 'Comum'}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            {user.firstAccess ? (
                                                <Badge
                                                    color="orange"
                                                    variant="light"
                                                >
                                                    Senha Provisória Enviada
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    color="green"
                                                    variant="light"
                                                >
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
                                    <Table.Td
                                        colSpan={6}
                                        align="center"
                                        py="xl"
                                    >
                                        <Text c="dimmed">
                                            Nenhum usuário cadastrado.
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>
                            )}
                        </Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
            </Paper>

            {/* Modal: New User */}
            <Modal
                opened={createOpened}
                onClose={() => setCreateOpened(false)}
                title={
                    <Group gap="xs">
                        <UserPlus size={20} color="#1c7ed6" />
                        <Text fw={700}>Cadastrar Novo Usuário</Text>
                    </Group>
                }
                centered
            >
                <form onSubmit={handleCreateSubmit} noValidate>
                    <Stack gap="sm">
                        <Text size="xs" c="dimmed">
                            Uma senha provisória de primeiro acesso será gerada
                            automaticamente e enviada ao e-mail informado.
                        </Text>

                        {createError && (
                            <Alert
                                icon={<AlertTriangle size={16} />}
                                color="red"
                            >
                                {createError}
                            </Alert>
                        )}

                        <TextInput
                            label="Nome do Usuário"
                            placeholder="Ex: Maria Oliveira"
                            value={name}
                            error={fieldErrors.name}
                            onChange={(e) => {
                                setName(e.currentTarget.value);
                                clearFieldError('name');
                            }}
                            required
                        />

                        <TextInput
                            label="E-mail de Acesso"
                            placeholder="maria@exemplo.com"
                            value={email}
                            error={fieldErrors.email}
                            onChange={(e) => {
                                setEmail(e.currentTarget.value);
                                clearFieldError('email');
                            }}
                            required
                        />

                        <Group justify="flex-end" mt="md">
                            <Button
                                variant="default"
                                onClick={() => setCreateOpened(false)}
                                disabled={createLoading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                color="blue"
                                loading={createLoading}
                            >
                                Cadastrar e Enviar E-mail
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            {/* Modal: User Delete */}
            <Modal
                opened={deleteOpened}
                onClose={() => setDeleteOpened(false)}
                title={
                    <Group gap="xs">
                        <AlertTriangle size={22} color="#fa5252" />
                        <Text fw={700} c="red">
                            Confirmar Exclusão de Usuário
                        </Text>
                    </Group>
                }
                centered
            >
                <Stack gap="md">
                    <Text size="sm">
                        Tem certeza que deseja excluir a conta de{' '}
                        <b>{userToDelete?.name}</b> ({userToDelete?.email})?
                    </Text>

                    <Alert color="red" radius="md">
                        Ao excluir este usuário, **todos os registros
                        cadastrados por ele** (produtos, marcas, categorias,
                        famílias, clientes e vendas) serão permanentemente
                        removidos.
                    </Alert>

                    <Group justify="flex-end" mt="md">
                        <Button
                            variant="default"
                            onClick={() => setDeleteOpened(false)}
                            disabled={deleteLoading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            color="red"
                            onClick={handleDeleteConfirm}
                            loading={deleteLoading}
                            leftSection={<Trash2 size={16} />}
                        >
                            Sim, Excluir Conta
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Stack>
    );
}
