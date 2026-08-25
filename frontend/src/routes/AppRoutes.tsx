import { useEffect } from 'react';
import { useRoutes, Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import AdminUsers from '../pages/AdminUsers';
import Products from '../pages/Products';
import Brands from '../pages/Brands';
import Categories from '../pages/Categories';
import Families from '../pages/Families';
import NearExpirationProducts from '../pages/NearExpirationProducts';
import ExpiredProducts from '../pages/ExpiredProducts';
import MonthlyReport from '../pages/MonthlyReport';
import AnnualReport from '../pages/AnnualReport';
import Customers from '../pages/Customers';
import NotFound from '../pages/errors/NotFound';
import Forbidden from '../pages/errors/Forbidden';
import ServerError from '../pages/errors/ServerError';

// Dynamic titles for each route
const PAGE_TITLES: Record<string, string> = {
    '/login': 'Login',
    '/forgot-password': 'Recuperação de Senha',
    '/': 'Produtos',
    '/products/near-expiration': 'Produtos à Vencer',
    '/products/expired': 'Produtos Vencidos',
    '/brands': 'Marcas',
    '/categories': 'Categorias',
    '/families': 'Famílias',
    '/customers': 'Clientes',
    '/reports/monthly': 'Relatório Mensal',
    '/reports/annual': 'Relatório Anual',
    '/admin/users': 'Gerenciar Usuários',
    '/403': 'Acesso Restrito',
    '/503': 'Servidor Indisponível',
    '/404': 'Página Não Encontrada',
};

function ProtectedLayout() {
    // simple middleware
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return <Layout />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
    const { isAdmin } = useAuth();
    if (!isAdmin) {
        return <Forbidden />;
    }
    return <>{children}</>;
}

export default function AppRoutes() {
    const location = useLocation();

    // Update browser tab title dynamically based on current route
    useEffect(() => {
        const pageTitle =
            PAGE_TITLES[location.pathname] || 'Página Não Encontrada';
        document.title = `Natura Nice | ${pageTitle}`;
    }, [location.pathname]);

    const routes = useRoutes([
        { path: '/login', element: <Login /> },
        { path: '/forgot-password', element: <ForgotPassword /> },
        { path: '/403', element: <Forbidden /> },
        { path: '/503', element: <ServerError code={503} /> },
        {
            path: '/500',
            element: (
                <ServerError
                    code={500}
                    title="Erro Interno no Servidor"
                    message="Ocorreu um erro inesperado ao processar sua requisição no servidor."
                />
            ),
        },
        {
            path: '/',
            element: <ProtectedLayout />,
            children: [
                { index: true, element: <Products /> },
                {
                    path: '/products/near-expiration',
                    element: <NearExpirationProducts />,
                },
                { path: '/products/expired', element: <ExpiredProducts /> },
                { path: '/brands', element: <Brands /> },
                { path: '/categories', element: <Categories /> },
                { path: '/families', element: <Families /> },
                { path: '/customers', element: <Customers /> },
                { path: '/reports/monthly', element: <MonthlyReport /> },
                { path: '/reports/annual', element: <AnnualReport /> },
                {
                    path: '/admin/users',
                    element: (
                        <AdminRoute>
                            <AdminUsers />
                        </AdminRoute>
                    ),
                },
            ],
        },
        { path: '*', element: <NotFound /> },
    ]);
    return routes;
}
