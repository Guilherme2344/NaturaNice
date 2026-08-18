import { useState } from 'react';
import {
    AppShell,
    Burger,
    Group,
    NavLink,
    Text,
    Divider,
    Stack,
    Badge,
    Button,
    Modal,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    Package,
    Clock,
    AlertTriangle,
    Tag,
    Layers,
    FolderTree,
    Calendar,
    BarChart3,
    Shield,
    LogOut,
    User as UserIcon,
} from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

const stockNavItems = [
    { label: 'Todos os Produtos', icon: Package, href: '/' },
    {
        label: 'Produtos À Vencer',
        icon: Clock,
        href: '/products/near-expiration',
        color: 'orange',
    },
    {
        label: 'Produtos Vencidos',
        icon: AlertTriangle,
        href: '/products/expired',
        color: 'red',
    },
    { label: 'Marcas', icon: Tag, href: '/brands' },
    { label: 'Categorias', icon: Layers, href: '/categories' },
    { label: 'Famílias', icon: FolderTree, href: '/families' },
];

const reportNavItems = [
    {
        label: 'Relatório Mensal',
        icon: Calendar,
        href: '/reports/monthly',
        color: '#099268', // teal
    },
    {
        label: 'Relatório Anual',
        icon: BarChart3,
        href: '/reports/annual',
        color: '#1c7ed6', // blue
    },
];

export default function Header({ children }: { children?: React.ReactNode }) {
    const [opened, { toggle, close }] = useDisclosure();
    const [logoutOpened, setLogoutOpened] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();

    const handleConfirmLogout = () => {
        setLogoutOpened(false);
        logout();
        navigate('/login');
    };

    // Helper para fechar o menu mobile ao clicar em qualquer link
    const handleNavClick = () => {
        if (opened) {
            close();
        }
    };

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 280,
                breakpoint: 'sm',
                collapsed: { mobile: !opened },
            }}
            padding="md"
        >
            {/* Top Header */}
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between">
                    <Group gap="sm">
                        <Burger
                            opened={opened}
                            onClick={toggle}
                            hiddenFrom="sm"
                            size="sm"
                        />
                        <Text size="lg" fw={700}>
                            Natura Nice
                        </Text>
                    </Group>

                    {user && (
                        <Group gap="sm">
                            <Group gap="xs" visibleFrom="xs">
                                <UserIcon size={18} className="text-gray-600" />
                                <Text size="sm" fw={600}>
                                    {user.name}
                                </Text>
                                <Badge
                                    size="sm"
                                    color={user.role === 'ADMIN' ? 'blue' : 'gray'}
                                    variant="light"
                                >
                                    {user.role === 'ADMIN' ? 'ADMIN' : 'Comum'}
                                </Badge>
                            </Group>

                            <Button
                                variant="light"
                                color="red"
                                size="xs"
                                leftSection={<LogOut size={14} />}
                                onClick={() => setLogoutOpened(true)}
                            >
                                Sair
                            </Button>
                        </Group>
                    )}
                </Group>
            </AppShell.Header>

            {/* Sidebar Navigation */}
            <AppShell.Navbar p="md">
                <Stack gap="xs">
                    {isAdmin ? (
                        /* Painel exclusivo do Admin */
                        <div>
                            <Text
                                size="xs"
                                fw={700}
                                c="dimmed"
                                mb="xs"
                                tt="uppercase"
                            >
                                Administração
                            </Text>
                            <NavLink
                                component={Link}
                                to="/admin/users"
                                label="Gerenciar Usuários"
                                leftSection={<Shield size={18} color="#1c7ed6" />}
                                active={location.pathname === '/admin/users'}
                                onClick={handleNavClick}
                                style={{ borderRadius: '6px' }}
                            />
                        </div>
                    ) : (
                        /* Painel do Usuário Comum */
                        <>
                            <div>
                                <Text
                                    size="xs"
                                    fw={700}
                                    c="dimmed"
                                    mb="xs"
                                    tt="uppercase"
                                >
                                    Gestão do Estoque
                                </Text>
                                {stockNavItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.href;

                                    return (
                                        <NavLink
                                            key={item.label}
                                            component={Link}
                                            to={item.href}
                                            label={item.label}
                                            leftSection={
                                                <Icon size={18} color={item.color} />
                                            }
                                            active={isActive}
                                            onClick={handleNavClick}
                                            mb={4}
                                            style={{ borderRadius: '6px' }}
                                        />
                                    );
                                })}
                            </div>

                            <Divider my="xs" />

                            <div>
                                <Text
                                    size="xs"
                                    fw={700}
                                    c="dimmed"
                                    mb="xs"
                                    tt="uppercase"
                                >
                                    Relatórios
                                </Text>
                                {reportNavItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.href;

                                    return (
                                        <NavLink
                                            key={item.label}
                                            component={Link}
                                            to={item.href}
                                            label={item.label}
                                            leftSection={
                                                <Icon size={18} color={item.color} />
                                            }
                                            active={isActive}
                                            onClick={handleNavClick}
                                            mb={4}
                                            style={{ borderRadius: '6px' }}
                                        />
                                    );
                                })}
                            </div>
                        </>
                    )}
                </Stack>
            </AppShell.Navbar>

            {/* Área Principal de Conteúdo */}
            <AppShell.Main>{children || <Outlet />}</AppShell.Main>

            {/* Modal de Confirmação de Logout */}
            <Modal
                opened={logoutOpened}
                onClose={() => setLogoutOpened(false)}
                title={
                    <Group gap="xs">
                        <LogOut size={20} className="text-red-600" />
                        <Text fw={700}>Confirmar Saída</Text>
                    </Group>
                }
                centered
            >
                <Stack gap="md">
                    <Text size="sm">
                        Tem certeza que deseja encerrar sua sessão no sistema?
                    </Text>

                    <Group justify="flex-end" mt="xs">
                        <Button
                            variant="default"
                            onClick={() => setLogoutOpened(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            color="red"
                            onClick={handleConfirmLogout}
                        >
                            Sair da Conta
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </AppShell>
    );
}
