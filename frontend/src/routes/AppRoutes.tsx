import { useRoutes } from 'react-router';
import Layout from '../components/Layout';
import Products from '../pages/Products';
import Brands from '../pages/Brands';
import Categories from '../pages/Categories';
import Families from '../pages/Families';
import NearExpirationProducts from '../pages/NearExpirationProducts';
import ExpiredProducts from '../pages/ExpiredProducts';

export default function AppRoutes() {
    const routes = useRoutes([
        {
            path: '/',
            element: <Layout />,
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
            ],
        },
    ]);
    return routes;
}
