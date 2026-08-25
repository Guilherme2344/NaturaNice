import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entityService } from '../services/entityService';
import { customerService } from '../services/customerService';

// Fetch all brands
export function useBrandsQuery() {
    return useQuery({
        queryKey: ['brands'],
        queryFn: () => entityService.getBrands(),
    });
}

// Fetch all categories
export function useCategoriesQuery() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: () => entityService.getCategories(),
    });
}

// Fetch all product families
export function useFamiliesQuery() {
    return useQuery({
        queryKey: ['families'],
        queryFn: () => entityService.getFamilies(),
    });
}

// Fetch all customers
export function useCustomersQuery() {
    return useQuery({
        queryKey: ['customers'],
        queryFn: () => customerService.getAll(),
    });
}

// Create new brand and invalidate brands & products cache
export function useCreateBrandMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { name: string; hexColor?: string }) => entityService.createBrand(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

// Update brand details and invalidate brands & products cache
export function useUpdateBrandMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: { name: string; hexColor?: string } }) =>
            entityService.updateBrand(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

// Delete brand by ID and invalidate brands & products cache
export function useDeleteBrandMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => entityService.deleteBrand(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

// Create new category and invalidate categories & products cache
export function useCreateCategoryMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { name: string }) => entityService.createCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

// Update category and invalidate categories & products cache
export function useUpdateCategoryMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: { name: string } }) =>
            entityService.updateCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

// Delete category by ID and invalidate categories & products cache
export function useDeleteCategoryMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => entityService.deleteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

// Create new family and invalidate families & products cache
export function useCreateFamilyMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { name: string }) => entityService.createFamily(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['families'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

// Update family and invalidate families & products cache
export function useUpdateFamilyMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: { name: string } }) =>
            entityService.updateFamily(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['families'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

// Delete family by ID and invalidate families & products cache
export function useDeleteFamilyMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => entityService.deleteFamily(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['families'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

// Create new customer and invalidate customers & reports cache
export function useCreateCustomerMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { name: string }) => customerService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['reports'] });
        },
    });
}

// Update customer and invalidate customers & reports cache
export function useUpdateCustomerMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: { name: string } }) =>
            customerService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['reports'] });
        },
    });
}

// Delete customer by ID and invalidate customers & reports cache
export function useDeleteCustomerMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => customerService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['reports'] });
        },
    });
}
