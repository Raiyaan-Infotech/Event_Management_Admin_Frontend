import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export interface UiBlockCategory {
    id: number;
    name: string;
    description?: string | null;
    is_active: boolean | number;
    created_at?: string;
}

export type CreateUiBlockCategoryDto = Omit<UiBlockCategory, 'id' | 'created_at'>;
export type UpdateUiBlockCategoryDto = Partial<CreateUiBlockCategoryDto>;

const KEYS = {
    all: ['ui-block-categories'] as const,
    list: (p: any) => ['ui-block-categories', 'list', p] as const,
    detail: (id: number) => ['ui-block-categories', 'detail', id] as const,
};

const api = {
    getAll: async (params?: Record<string, any>) => {
        const res = await apiClient.get('/ui-block-categories', { params: { page: 1, limit: 100, ...params } });
        return { data: res.data.data || [], pagination: res.data.pagination };
    },
    create: async (data: CreateUiBlockCategoryDto) => {
        const res = await apiClient.post('/ui-block-categories', data);
        return res.data.data?.category || res.data.category;
    },
    update: async ({ id, data }: { id: number; data: UpdateUiBlockCategoryDto }) => {
        const res = await apiClient.put(`/ui-block-categories/${id}`, data);
        return res.data.data?.category || res.data.category;
    },
    delete: async (id: number) => { await apiClient.delete(`/ui-block-categories/${id}`); },
};

export function useUiBlockCategories(params?: Record<string, any>) {
    return useQuery({ queryKey: KEYS.list(params ?? {}), queryFn: () => api.getAll(params), staleTime: 2 * 60 * 1000 });
}

export function useCreateUiBlockCategory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: api.create,
        onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Category created'); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create category'),
    });
}

export function useUpdateUiBlockCategory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: api.update,
        onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Category updated'); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update category'),
    });
}

export function useDeleteUiBlockCategory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: api.delete,
        onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Category deleted'); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to delete category'),
    });
}
