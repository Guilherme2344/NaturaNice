import { api } from './api';
import type { Entity } from '../components/EntityTable';

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
};
