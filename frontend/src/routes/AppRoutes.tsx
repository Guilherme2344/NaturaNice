import { useRoutes, Navigate } from 'react-router';
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
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
}

export default function AppRoutes() {
    const routes = useRoutes([
        { path: '/login', element: <Login /> },
        { path: '/forgot-password', element: <ForgotPassword /> },
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
        { path: '*', element: <Navigate to="/" replace /> },
    ]);
    return routes;
}
