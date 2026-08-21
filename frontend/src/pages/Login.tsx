import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import {
    Container,
    Paper,
    Title,
    Text,
    TextInput,
    PasswordInput,
    Button,
    Stack,
    Group,
    Modal,
    Alert,
    Center,
} from '@mantine/core';
import { Lock, Mail, AlertCircle, KeyRound, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService, type User } from '../services/authService';
import { loginSchema, passwordResetSchema, validateWithYup } from '../schemas/validationSchemas';

export default function Login() {
    const navigate = useNavigate();
    const { login, updateUser } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    // First access password change state
    const [loggedUser, setLoggedUser] = useState<User | null>(null);
    const [firstAccessOpened, setFirstAccessOpened] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstAccessError, setFirstAccessError] = useState('');
    const [firstAccessFieldErrors, setFirstAccessFieldErrors] = useState<Record<string, string>>({});
    const [firstAccessLoading, setFirstAccessLoading] = useState(false);

    const clearFieldError = (field: string) => {
        if (fieldErrors[field]) {
            setFieldErrors((prev) => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    };

    const clearFirstAccessFieldError = (field: string) => {
        if (firstAccessFieldErrors[field]) {
            setFirstAccessFieldErrors((prev) => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const { isValid, errors } = await validateWithYup(loginSchema, {
            email: email.trim(),
            password,
        });

        if (!isValid) {
            setFieldErrors(errors);
            return;
        }

        try {
            setLoading(true);
            const user = await login(email.trim(), password);

            if (user.firstAccess) {
                setLoggedUser(user);
                setFirstAccessOpened(true);
            } else {
                redirectUser(user);
            }
        } catch (err: any) {
            setError(
                err?.response?.data?.message || 'E-mail ou senha incorretos.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleFirstAccessSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFirstAccessError('');

        const { isValid, errors } = await validateWithYup(passwordResetSchema, {
            newPassword,
            confirmPassword,
        });

        if (!isValid) {
            setFirstAccessFieldErrors(errors);
            return;
        }

        if (!loggedUser) return;

        try {
            setFirstAccessLoading(true);
            const updatedUser = await authService.changeFirstPassword(
                loggedUser.id,
                newPassword
            );
            updateUser(updatedUser);
            setFirstAccessOpened(false);
            redirectUser(updatedUser);
        } catch (err: any) {
            setFirstAccessError(
                err?.response?.data?.message || 'Erro ao alterar senha.'
            );
        } finally {
            setFirstAccessLoading(false);
        }
    };

    const redirectUser = (user: User) => {
        if (user.role === 'ADMIN') {
            navigate('/admin/users');
        } else {
            navigate('/products');
        }
    };

    return (
        <Container
            size="xs"
            py="xl"
            style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}
        >
            <Paper
                shadow="md"
                p="xl"
                radius="lg"
                withBorder
                style={{ width: '100%' }}
            >
                <Stack gap="md">
                    <Center style={{ flexDirection: 'column' }}>
                        <Paper
                            p="sm"
                            radius="xl"
                            bg="blue.0"
                            style={{ display: 'inline-flex', marginBottom: 12 }}
                        >
                            <Lock size={32} className="text-blue-600" />
                        </Paper>
                        <Title order={2} ta="center">
                            Acesso ao Sistema
                        </Title>
                        <Text size="sm" c="dimmed" ta="center">
                            Informe suas credenciais para entrar na conta
                        </Text>
                    </Center>

                    {error && (
                        <Alert
                            icon={<AlertCircle size={16} />}
                            color="red"
                            radius="md"
                        >
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleLoginSubmit} noValidate>
                        <Stack gap="sm">
                            <TextInput
                                label="E-mail"
                                placeholder="seu.email@exemplo.com"
                                leftSection={<Mail size={16} />}
                                value={email}
                                error={fieldErrors.email}
                                onChange={(e) => {
                                    setEmail(e.currentTarget.value);
                                    clearFieldError('email');
                                }}
                                required
                            />

                            <PasswordInput
                                label="Senha"
                                placeholder="Sua senha"
                                leftSection={<Lock size={16} />}
                                value={password}
                                error={fieldErrors.password}
                                onChange={(e) => {
                                    setPassword(e.currentTarget.value);
                                    clearFieldError('password');
                                }}
                                required
                            />

                            <Group justify="flex-end">
                                <Text
                                    component={Link}
                                    to="/forgot-password"
                                    size="xs"
                                    c="blue"
                                    fw={600}
                                    style={{ textDecoration: 'none' }}
                                >
                                    Esqueceu sua senha?
                                </Text>
                            </Group>

                            <Button
                                type="submit"
                                color="blue"
                                fullWidth
                                mt="xs"
                                size="md"
                                loading={loading}
                                rightSection={<ArrowRight size={18} />}
                            >
                                Entrar no Sistema
                            </Button>
                        </Stack>
                    </form>
                </Stack>
            </Paper>

            {/* Modal de Alteração de Senha de Primeiro Acesso */}
            <Modal
                opened={firstAccessOpened}
                onClose={() => {}}
                withCloseButton={false}
                closeOnClickOutside={false}
                closeOnEscape={false}
                title={
                    <Group gap="xs">
                        <KeyRound size={22} className="text-blue-600" />
                        <Text fw={700} size="md">
                            Primeiro Acesso - Defina sua Nova Senha
                        </Text>
                    </Group>
                }
                centered
            >
                <form onSubmit={handleFirstAccessSubmit} noValidate>
                    <Stack gap="sm">
                        <Text size="sm" c="dimmed">
                            Você está acessando com uma senha temporária. Para
                            continuar com segurança, crie sua nova senha
                            pessoal.
                        </Text>

                        {firstAccessError && (
                            <Alert icon={<AlertCircle size={16} />} color="red">
                                {firstAccessError}
                            </Alert>
                        )}

                        <PasswordInput
                            label="Nova Senha"
                            placeholder="Mínimo 6 caracteres"
                            value={newPassword}
                            error={firstAccessFieldErrors.newPassword}
                            onChange={(e) => {
                                setNewPassword(e.currentTarget.value);
                                clearFirstAccessFieldError('newPassword');
                            }}
                            required
                        />

                        <PasswordInput
                            label="Confirme a Nova Senha"
                            placeholder="Repita a nova senha"
                            value={confirmPassword}
                            error={firstAccessFieldErrors.confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.currentTarget.value);
                                clearFirstAccessFieldError('confirmPassword');
                            }}
                            required
                        />

                        <Button
                            type="submit"
                            color="blue"
                            fullWidth
                            mt="md"
                            loading={firstAccessLoading}
                        >
                            Salvar Nova Senha e Continuar
                        </Button>
                    </Stack>
                </form>
            </Modal>
        </Container>
    );
}
