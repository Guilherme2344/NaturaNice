import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entityService } from '../services/entityService';

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

// Create new brand and invalidate brands cache
export function useCreateBrandMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { name: string; hexColor?: string }) => entityService.createBrand(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
        },
    });
}

// Update brand details
export function useUpdateBrandMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: { name: string; hexColor?: string } }) =>
            entityService.updateBrand(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
        },
    });
}

// Delete brand by ID
export function useDeleteBrandMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => entityService.deleteBrand(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
        },
    });
}

// Create new category
export function useCreateCategoryMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { name: string }) => entityService.createCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
}

// Update category
export function useUpdateCategoryMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: { name: string } }) =>
            entityService.updateCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
}

// Delete category by ID
export function useDeleteCategoryMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => entityService.deleteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
}

// Create new family
export function useCreateFamilyMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { name: string }) => entityService.createFamily(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['families'] });
        },
    });
}

// Update family
export function useUpdateFamilyMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: { name: string } }) =>
            entityService.updateFamily(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['families'] });
        },
    });
}

// Delete family by ID
export function useDeleteFamilyMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => entityService.deleteFamily(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['families'] });
        },
    });
}
