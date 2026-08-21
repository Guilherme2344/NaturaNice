import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, type CreateProductDTO } from '../services/productService';
import { saleService, type CreateSaleDTO } from '../services/saleService';

export const PRODUCTS_QUERY_KEY = ['products'];
export const EXPIRED_PRODUCTS_QUERY_KEY = ['products', 'expired'];
export const NEAR_EXPIRATION_PRODUCTS_QUERY_KEY = ['products', 'near-expiration'];

export function useProductsQuery() {
    return useQuery({
        queryKey: PRODUCTS_QUERY_KEY,
        queryFn: () => productService.getAll(),
    });
}

export function useExpiredProductsQuery() {
    return useQuery({
        queryKey: EXPIRED_PRODUCTS_QUERY_KEY,
        queryFn: () => productService.getExpired(),
    });
}

export function useNearExpirationProductsQuery() {
    return useQuery({
        queryKey: NEAR_EXPIRATION_PRODUCTS_QUERY_KEY,
        queryFn: () => productService.getNearExpiration(),
    });
}

export function useCreateProductMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateProductDTO) => productService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

export function useUpdateProductMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CreateProductDTO }) =>
            productService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

export function useDeleteProductMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => productService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

export function useCreateSaleMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateSaleDTO) => saleService.createSale(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['reports'] });
        },
    });
}
