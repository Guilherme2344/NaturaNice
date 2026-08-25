import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, type CreateProductDTO } from '../services/productService';
import { saleService, type CreateSaleDTO } from '../services/saleService';

// Query keys for React Query cache management
export const PRODUCTS_QUERY_KEY = ['products'];
export const EXPIRED_PRODUCTS_QUERY_KEY = ['products', 'expired'];
export const NEAR_EXPIRATION_PRODUCTS_QUERY_KEY = ['products', 'near-expiration'];

// Fetch all products with cache
export function useProductsQuery() {
    return useQuery({
        queryKey: PRODUCTS_QUERY_KEY,
        queryFn: () => productService.getAll(),
    });
}

// Fetch expired products
export function useExpiredProductsQuery() {
    return useQuery({
        queryKey: EXPIRED_PRODUCTS_QUERY_KEY,
        queryFn: () => productService.getExpired(),
    });
}

// Fetch products near expiration date
export function useNearExpirationProductsQuery() {
    return useQuery({
        queryKey: NEAR_EXPIRATION_PRODUCTS_QUERY_KEY,
        queryFn: () => productService.getNearExpiration(),
    });
}

// Create new product and invalidate products & reports cache
export function useCreateProductMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateProductDTO) => productService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['reports'] });
        },
    });
}

// Update existing product and invalidate products & reports cache
export function useUpdateProductMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CreateProductDTO }) =>
            productService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['reports'] });
        },
    });
}

// Delete product by ID and invalidate products & reports cache
export function useDeleteProductMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => productService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['reports'] });
        },
    });
}

// Register a product sale and invalidate products, reports, and customers cache
export function useCreateSaleMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateSaleDTO) => saleService.createSale(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
    });
}
