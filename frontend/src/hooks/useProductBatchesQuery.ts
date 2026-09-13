import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productBatchService, type CreateProductBatchDTO } from '../services/productBatchService';

export function useProductBatchesQuery() {
    return useQuery({
        queryKey: ['productBatches'],
        queryFn: () => productBatchService.getAll(),
    });
}

export function useProductBatchesByProductQuery(productId?: string) {
    return useQuery({
        queryKey: ['productBatches', productId],
        queryFn: () => (productId ? productBatchService.getByProduct(productId) : Promise.resolve([])),
        enabled: Boolean(productId),
    });
}

export function useCreateProductBatchMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProductBatchDTO) => productBatchService.createBatch(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productBatches'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

export function useUpdateProductBatchMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateProductBatchDTO }) =>
            productBatchService.updateBatch(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productBatches'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

export function useDeleteProductBatchMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => productBatchService.deleteBatch(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productBatches'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}
