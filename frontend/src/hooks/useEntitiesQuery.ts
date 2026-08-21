import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entityService } from '../services/entityService';

export function useBrandsQuery() {
    return useQuery({
        queryKey: ['brands'],
        queryFn: () => entityService.getBrands(),
    });
}

export function useCategoriesQuery() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: () => entityService.getCategories(),
    });
}

export function useFamiliesQuery() {
    return useQuery({
        queryKey: ['families'],
        queryFn: () => entityService.getFamilies(),
    });
}

export function useCreateBrandMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { name: string; hexColor?: string }) => entityService.createBrand(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
        },
    });
}

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

export function useDeleteBrandMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => entityService.deleteBrand(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
        },
    });
}

export function useCreateCategoryMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { name: string }) => entityService.createCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
}

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

export function useDeleteCategoryMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => entityService.deleteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
}

export function useCreateFamilyMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { name: string }) => entityService.createFamily(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['families'] });
        },
    });
}

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

export function useDeleteFamilyMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => entityService.deleteFamily(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['families'] });
        },
    });
}
