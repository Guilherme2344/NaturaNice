import { AppShell, Burger, Group, NavLink, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    Package,
    Clock,
    AlertTriangle,
    Tag,
    Layers,
    FolderTree,
} from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router';

const navItems = [
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

export default function Header({ children }: { children: React.ReactNode }) {
    // Hook do Mantine para controlar abertura/fechamento do menu mobile
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
                <Text size="xs" fw={700} c="dimmed" mb="sm">
                    GESTÃO DO ESTOQUE
                </Text>

                {navItems.map((item) => {
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
            </AppShell.Navbar>

            {/* Área Principal de Conteúdo */}
            <AppShell.Main>{children || <Outlet />}</AppShell.Main>
        </AppShell>
    );
}
