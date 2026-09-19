import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import {
    Container,
    Paper,
    Title,
    Text,
    TextInput,
    PasswordInput,
    PinInput,
    Button,
    Stack,
    Group,
    Modal,
    Alert,
    Center,
} from '@mantine/core';
import {
    Lock,
    Mail,
    AlertCircle,
    KeyRound,
    ArrowRight,
    ShieldCheck,
    RefreshCw,
    ArrowLeft,
    CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService, type User } from '../services/authService';
import {
    loginSchema,
    passwordResetSchema,
    validateWithYup,
} from '../schemas/validationSchemas';

export default function Login() {
    const navigate = useNavigate();
    const { login, verifyTwoFactor, updateUser } = useAuth();

    // Step 1 (credentials) vs Step 2 (2FA)
    const [step, setStep] = useState<1 | 2>(1);

    // Step 1 state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    // Step 2 (2FA) state
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [twoFactorError, setTwoFactorError] = useState('');
    const [twoFactorLoading, setTwoFactorLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    // First access password change state
    const [loggedUser, setLoggedUser] = useState<User | null>(null);
    const [firstAccessOpened, setFirstAccessOpened] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstAccessError, setFirstAccessError] = useState('');
    const [firstAccessFieldErrors, setFirstAccessFieldErrors] = useState<
        Record<string, string>
    >({});
    const [firstAccessLoading, setFirstAccessLoading] = useState(false);

    // Cooldown timer for resend 2FA
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (resendCooldown > 0) {
            timer = setTimeout(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);

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
            const response = await login(email.trim(), password);

            if (response.twoFactorRequired) {
                setStep(2);
                setTwoFactorCode('');
                setTwoFactorError('');
                setResendSuccess('');
                setResendCooldown(30);
            } else if (response.user) {
                if (response.user.firstAccess) {
                    setLoggedUser(response.user);
                    setFirstAccessOpened(true);
                } else {
                    redirectUser(response.user);
                }
            }
        } catch (err: any) {
            setError(
                err?.response?.data?.message || 'E-mail ou senha incorretos.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyTwoFactorSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (twoFactorCode.length < 6) {
            setTwoFactorError(
                'Por favor, digite o código completo de 6 dígitos.'
            );
            return;
        }
        setTwoFactorError('');

        try {
            setTwoFactorLoading(true);
            const user = await verifyTwoFactor(email.trim(), twoFactorCode);

            if (user.firstAccess) {
                setLoggedUser(user);
                setFirstAccessOpened(true);
            } else {
                redirectUser(user);
            }
        } catch (err: any) {
            setTwoFactorError(
                err?.response?.data?.message ||
                    'Código de verificação inválido ou expirado.'
            );
        } finally {
            setTwoFactorLoading(false);
        }
    };

    const handleResendTwoFactor = async () => {
        if (resendCooldown > 0 || resendLoading) return;
        setTwoFactorError('');
        setResendSuccess('');

        try {
            setResendLoading(true);
            const response = await authService.resendTwoFactor(email.trim());
            setResendSuccess(
                response.message ||
                    'Código reenviado com sucesso para seu e-mail!'
            );
            setResendCooldown(30);
        } catch (err: any) {
            setTwoFactorError(
                err?.response?.data?.message || 'Erro ao reenviar código.'
            );
        } finally {
            setResendLoading(false);
        }
    };

    const handleBackToLogin = () => {
        setStep(1);
        setTwoFactorCode('');
        setTwoFactorError('');
        setResendSuccess('');
        setError('');
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
            navigate('/');
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
                {step === 1 ? (
                    <Stack gap="md">
                        <Center style={{ flexDirection: 'column' }}>
                            <Paper
                                p="sm"
                                radius="xl"
                                bg="blue.0"
                                style={{
                                    display: 'inline-flex',
                                    marginBottom: 12,
                                }}
                            >
                                <Lock size={32} color="#1c7ed6" />
                            </Paper>
                            <Title order={2} ta="center">
                                Bem-vindo ao Sistema Natura Nice
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
                ) : (
                    <Stack gap="md">
                        <Center style={{ flexDirection: 'column' }}>
                            <Paper
                                p="sm"
                                radius="xl"
                                bg="blue.0"
                                style={{
                                    display: 'inline-flex',
                                    marginBottom: 12,
                                }}
                            >
                                <ShieldCheck size={32} color="#1c7ed6" />
                            </Paper>
                            <Title order={2} ta="center">
                                Verificação em Duas Etapas (2FA)
                            </Title>
                            <Text size="sm" c="dimmed" ta="center" mt={4}>
                                Digite o código de 6 dígitos enviado para:
                            </Text>
                            <Text size="sm" fw={700} c="blue" ta="center">
                                {email}
                            </Text>
                        </Center>

                        {twoFactorError && (
                            <Alert
                                icon={<AlertCircle size={16} />}
                                color="red"
                                radius="md"
                            >
                                {twoFactorError}
                            </Alert>
                        )}

                        {resendSuccess && (
                            <Alert
                                icon={<CheckCircle2 size={16} />}
                                color="teal"
                                radius="md"
                            >
                                {resendSuccess}
                            </Alert>
                        )}

                        <form onSubmit={handleVerifyTwoFactorSubmit} noValidate>
                            <Stack gap="lg" align="center">
                                <PinInput
                                    length={6}
                                    type="number"
                                    size="lg"
                                    value={twoFactorCode}
                                    onChange={(val) => {
                                        setTwoFactorCode(val);
                                        setTwoFactorError('');
                                    }}
                                    autoFocus
                                    placeholder="○"
                                    gap="xs"
                                />

                                <Button
                                    type="submit"
                                    color="blue"
                                    fullWidth
                                    size="md"
                                    loading={twoFactorLoading}
                                    disabled={twoFactorCode.length < 6}
                                    rightSection={<ArrowRight size={18} />}
                                >
                                    Verificar e Entrar
                                </Button>

                                <Group justify="space-between" w="100%">
                                    <Button
                                        variant="subtle"
                                        color="gray"
                                        size="xs"
                                        leftSection={<ArrowLeft size={14} />}
                                        onClick={handleBackToLogin}
                                    >
                                        Voltar ao login
                                    </Button>

                                    <Button
                                        variant="subtle"
                                        color="blue"
                                        size="xs"
                                        leftSection={<RefreshCw size={14} />}
                                        onClick={handleResendTwoFactor}
                                        loading={resendLoading}
                                        disabled={resendCooldown > 0}
                                    >
                                        {resendCooldown > 0
                                            ? `Reenviar código (${resendCooldown}s)`
                                            : 'Reenviar código'}
                                    </Button>
                                </Group>
                            </Stack>
                        </form>
                    </Stack>
                )}
            </Paper>

            {/* First Access Modal */}
            <Modal
                opened={firstAccessOpened}
                onClose={() => {}}
                withCloseButton={false}
                closeOnClickOutside={false}
                closeOnEscape={false}
                title={
                    <Group gap="xs">
                        <KeyRound size={22} color="#1c7ed6" />
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
