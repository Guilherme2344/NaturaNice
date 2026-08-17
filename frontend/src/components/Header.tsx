import { AppShell, Burger, Group, NavLink, Text, Divider, Stack } from '@mantine/core';
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
} from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router';

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

export default function Header({ children }: { children: React.ReactNode }) {
    const [opened, { toggle }] = useDisclosure();
    const location = useLocation();

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
                <Group h="100%" px="md">
                    <Burger
                        opened={opened}
                        onClick={toggle}
                        hiddenFrom="sm"
                        size="sm"
                    />
                    <Text size="lg" fw={700}>
                        Produtos Mãe
                    </Text>
                </Group>
            </AppShell.Header>

            {/* Sidebar Navigation */}
            <AppShell.Navbar p="md">
                <Stack gap="xs">
                    {/* Seção 1: Gestão do Estoque */}
                    <div>
                        <Text size="xs" fw={700} c="dimmed" mb="xs" tt="uppercase">
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
                                    leftSection={<Icon size={18} color={item.color} />}
                                    active={isActive}
                                    mb={4}
                                    style={{ borderRadius: '6px' }}
                                />
                            );
                        })}
                    </div>

                    <Divider my="xs" />

                    {/* Seção 2: Relatórios */}
                    <div>
                        <Text size="xs" fw={700} c="dimmed" mb="xs" tt="uppercase">
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
                                    leftSection={<Icon size={18} color={item.color} />}
                                    active={isActive}
                                    mb={4}
                                    style={{ borderRadius: '6px' }}
                                />
                            );
                        })}
                    </div>
                </Stack>
            </AppShell.Navbar>

            {/* Área Principal de Conteúdo */}
            <AppShell.Main>{children || <Outlet />}</AppShell.Main>
        </AppShell>
    );
}
