import { api } from './api';
import type { Entity } from '../components/EntityTable';

export interface CreateEntityDTO {
    name: string;
    hexColor?: string; // Usado apenas para marcas
}

export interface UpdateEntityDTO {
    name: string;
    hexColor?: string;
}

export const entityService = {
    // POST
    createBrand: async (data: CreateEntityDTO): Promise<Entity> => {
        const response = await api.post<Entity>('/brands', data);
        return response.data;
    },
    createCategory: async (data: CreateEntityDTO): Promise<Entity> => {
        const response = await api.post<Entity>('/categories', data);
        return response.data;
    },
    createFamily: async (data: CreateEntityDTO): Promise<Entity> => {
        const response = await api.post<Entity>('/families', data);
        return response.data;
    },

    // GET: search all brands
    getBrands: async (): Promise<Entity[]> => {
        const response = await api.get<Entity[]>('/brands');
        return response.data;
    },

    // GET: search all categories
    getCategories: async (): Promise<Entity[]> => {
        const response = await api.get<Entity[]>('/categories');
        return response.data;
    },

    // GET: search all families
    getFamilies: async (): Promise<Entity[]> => {
        const response = await api.get<Entity[]>('/families');
        return response.data;
    },

    // PUT
    updateBrand: async (id: number, data: UpdateEntityDTO): Promise<Entity> => {
        const response = await api.put<Entity>(`/brands/${id}`, data);
        return response.data;
    },
    updateCategory: async (
        id: number,
        data: UpdateEntityDTO
    ): Promise<Entity> => {
        const response = await api.put<Entity>(`/categories/${id}`, data);
        return response.data;
    },
    updateFamily: async (
        id: number,
        data: UpdateEntityDTO
    ): Promise<Entity> => {
        const response = await api.put<Entity>(`/families/${id}`, data);
        return response.data;
    },

    // DELETE
    deleteBrand: async (id: number): Promise<void> => {
        await api.delete(`/brands/${id}`);
    },
    deleteCategory: async (id: number): Promise<void> => {
        await api.delete(`/categories/${id}`);
    },
    deleteFamily: async (id: number): Promise<void> => {
        await api.delete(`/families/${id}`);
    },
};
