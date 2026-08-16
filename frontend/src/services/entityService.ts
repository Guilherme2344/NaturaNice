import { api } from './api';
import type { Entity } from '../components/EntityTable';

export interface CreateEntityDTO {
    name: string;
    hexColor?: string; // Usado apenas para marcas
}

export const entityService = {
    // GET: Buscar todas as marcas
    getBrands: async (): Promise<Entity[]> => {
        const response = await api.get<Entity[]>('/brands');
        return response.data;
    },

    // GET: Buscar todas as categorias
    getCategories: async (): Promise<Entity[]> => {
        const response = await api.get<Entity[]>('/categories');
        return response.data;
    },

    // GET: Buscar todas as famílias
    getFamilies: async (): Promise<Entity[]> => {
        const response = await api.get<Entity[]>('/families');
        return response.data;
    },

    // POST (Cadastro)
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
