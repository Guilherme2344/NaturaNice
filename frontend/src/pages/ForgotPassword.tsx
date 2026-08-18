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
    Alert,
    Center,
    PinInput,
    Group,
} from '@mantine/core';
import {
    Mail,
    KeyRound,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    ArrowRight,
} from 'lucide-react';
import { authService } from '../services/authService';

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Step 1: Send 6-digit code via email
    const handleStep1Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) {
            setError('Por favor, informe o e-mail cadastrado.');
            return;
        }

        try {
            setLoading(true);
            await authService.forgotPassword(email.trim());
            setStep(2);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                    'Erro ao solicitar envio do código.'
            );
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify 6-digit code
    const handleStep2Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!code || code.length < 6) {
            setError('Digite os 6 dígitos do código recebido.');
            return;
        }

        try {
            setLoading(true);
            await authService.verifyCode(email.trim(), code);
            setStep(3);
        } catch (err: any) {
            setError(
                err?.response?.data?.message || 'Código inválido ou expirado.'
            );
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset password
    const handleStep3Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!newPassword || newPassword.length < 6) {
            setError('A nova senha deve ter no mínimo 6 caracteres.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        try {
            setLoading(true);
            await authService.resetPassword(email.trim(), code, newPassword);
            setStep(4);
        } catch (err: any) {
            setError(
                err?.response?.data?.message || 'Erro ao redefinir a senha.'
            );
        } finally {
            setLoading(false);
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
                            bg="teal.0"
                            style={{ display: 'inline-flex', marginBottom: 12 }}
                        >
                            <KeyRound size={32} className="text-teal-600" />
                        </Paper>
                        <Title order={3} ta="center">
                            Recuperação de Senha
                        </Title>
                        <Text size="xs" c="dimmed" ta="center" mt={4}>
                            {step === 1 &&
                                'Etapa 1 de 3: Digite o e-mail da sua conta'}
                            {step === 2 &&
                                'Etapa 2 de 3: Digite o código de 6 dígitos'}
                            {step === 3 && 'Etapa 3 de 3: Crie sua nova senha'}
                            {step === 4 && 'Senha redefinida com sucesso!'}
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

                    {step === 1 && (
                        <form onSubmit={handleStep1Submit}>
                            <Stack gap="sm">
                                <Text size="sm">
                                    Insira o e-mail associado à sua conta.
                                    Enviaremos um código de verificação de 6
                                    dígitos para ele.
                                </Text>
                                <TextInput
                                    label="E-mail de Cadastro"
                                    placeholder="seu.email@exemplo.com"
                                    leftSection={<Mail size={16} />}
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.currentTarget.value)
                                    }
                                    required
                                />
                                <Button
                                    type="submit"
                                    color="teal"
                                    fullWidth
                                    mt="xs"
                                    loading={loading}
                                    rightSection={<ArrowRight size={16} />}
                                >
                                    Enviar Código de 6 Dígitos
                                </Button>
                            </Stack>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleStep2Submit}>
                            <Stack gap="md">
                                <Text size="sm" ta="center">
                                    Informe o código de 6 dígitos enviado para{' '}
                                    <b>{email}</b>:
                                </Text>

                                <Center>
                                    <PinInput
                                        length={6}
                                        value={code}
                                        onChange={setCode}
                                        type="number"
                                        size="lg"
                                        autoFocus
                                    />
                                </Center>

                                <Button
                                    type="submit"
                                    color="teal"
                                    fullWidth
                                    loading={loading}
                                    disabled={code.length < 6}
                                    rightSection={<ArrowRight size={16} />}
                                >
                                    Validar Código
                                </Button>

                                <Button
                                    variant="subtle"
                                    color="gray"
                                    size="xs"
                                    onClick={() => setStep(1)}
                                >
                                    Alterar E-mail
                                </Button>
                            </Stack>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleStep3Submit}>
                            <Stack gap="sm">
                                <PasswordInput
                                    label="Nova Senha"
                                    placeholder="Mínimo 6 caracteres"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.currentTarget.value)
                                    }
                                    required
                                />
                                <PasswordInput
                                    label="Confirme a Nova Senha"
                                    placeholder="Repita a nova senha"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(
                                            e.currentTarget.value
                                        )
                                    }
                                    required
                                />
                                <Button
                                    type="submit"
                                    color="teal"
                                    fullWidth
                                    mt="xs"
                                    loading={loading}
                                    leftSection={<CheckCircle2 size={16} />}
                                >
                                    Redefinir Senha
                                </Button>
                            </Stack>
                        </form>
                    )}

                    {step === 4 && (
                        <Stack gap="md" align="center">
                            <Alert
                                icon={<CheckCircle2 size={20} />}
                                color="green"
                                radius="md"
                            >
                                Sua senha foi redefinida com sucesso! Você já
                                pode efetuar o login com a nova senha.
                            </Alert>
                            <Button
                                color="teal"
                                fullWidth
                                onClick={() => navigate('/login')}
                            >
                                Voltar para o Login
                            </Button>
                        </Stack>
                    )}

                    {step !== 4 && (
                        <Group justify="center" mt="xs">
                            <Button
                                component={Link}
                                to="/login"
                                variant="subtle"
                                color="gray"
                                size="xs"
                                leftSection={<ArrowLeft size={14} />}
                            >
                                Voltar para o Login
                            </Button>
                        </Group>
                    )}
                </Stack>
            </Paper>
        </Container>
    );
}
