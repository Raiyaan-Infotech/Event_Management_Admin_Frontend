import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export interface UiBlock {
    id: number;
    block_type: string;
    label: string;
    icon?: string | null;
    description?: string | null;
    category_id?: number | null;
    category?: { id: number; name: string } | null;
    is_active: boolean | number;
    created_at?: string;
}

export type CreateUiBlockDto = Omit<UiBlock, 'id' | 'created_at' | 'category'>;
export type UpdateUiBlockDto = Partial<CreateUiBlockDto>;

const KEYS = {
    all: ['ui-blocks'] as const,
    list: (p: any) => ['ui-blocks', 'list', p] as const,
    detail: (id: number) => ['ui-blocks', 'detail', id] as const,
};

const api = {
    getAll: async (params?: Record<string, any>) => {
        const res = await apiClient.get('/ui-blocks', { params: { page: 1, limit: 50, ...params } });
        return { data: res.data.data || [], pagination: res.data.pagination };
    },
    getById: async (id: number) => {
        const res = await apiClient.get(`/ui-blocks/${id}`);
        return res.data.data?.uiBlock || res.data.uiBlock;
    },
    create: async (data: CreateUiBlockDto) => {
        const res = await apiClient.post('/ui-blocks', data);
        return res.data.data?.uiBlock || res.data.uiBlock;
    },
    update: async ({ id, data }: { id: number; data: UpdateUiBlockDto }) => {
        const res = await apiClient.put(`/ui-blocks/${id}`, data);
        return res.data.data?.uiBlock || res.data.uiBlock;
    },
    delete: async (id: number) => { await apiClient.delete(`/ui-blocks/${id}`); },
};

export function useUiBlocks(params?: Record<string, any>) {
    return useQuery({ queryKey: KEYS.list(params ?? {}), queryFn: () => api.getAll(params), staleTime: 2 * 60 * 1000 });
}

export function useCreateUiBlock() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: api.create,
        onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('UI Block created'); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create UI Block'),
    });
}

export function useUpdateUiBlock() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: api.update,
        onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('UI Block updated'); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update UI Block'),
    });
}

export function useDeleteUiBlock() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: api.delete,
        onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('UI Block deleted'); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to delete UI Block'),
    });
}

import { BlockCatalogEntry } from '@/types/home-blocks';

export function useUiBlocksCatalog() {
    return useQuery({
        queryKey: [...KEYS.all, 'catalog'],
        queryFn: async (): Promise<BlockCatalogEntry[]> => {
            const { data } = await api.getAll({ limit: 100 });
            return data.map((block: any) => ({
                ...block,
                variants: Array.isArray(block.variants)
                    ? block.variants.map((v: string, i: number) => ({ id: `variant_${i+1}`, label: v }))
                    : []
            }));
        },
        staleTime: 5 * 60 * 1000
    });
}
