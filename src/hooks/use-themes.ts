import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-client';
import { toast } from 'sonner';

export interface Theme {
    id: number;
    company_id: number;
    name: string;
    header_color: string | null;
    footer_color: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    hover_color: string | null;
    text_color: string | null;
    is_active: boolean | number;
    created_at?: string;
    updated_at?: string;
}

export type CreateThemeDto = Omit<Theme, 'id' | 'company_id' | 'created_at' | 'updated_at'>;
export type UpdateThemeDto = Partial<CreateThemeDto>;

const themesApi = {
    getAll: async (params?: Record<string, any>): Promise<{ data: Theme[]; pagination: any }> => {
        const response = await apiClient.get('/themes', { params: { page: 1, limit: 10, ...params } });
        return { data: response.data.data || [], pagination: response.data.pagination };
    },
    getById: async (id: number): Promise<Theme> => {
        const response = await apiClient.get(`/themes/${id}`);
        return response.data.data?.theme || response.data.theme;
    },
    create: async (data: CreateThemeDto): Promise<Theme> => {
        const response = await apiClient.post('/themes', data);
        return response.data.data?.theme || response.data.theme;
    },
    update: async ({ id, data }: { id: number; data: UpdateThemeDto }): Promise<Theme> => {
        const response = await apiClient.put(`/themes/${id}`, data);
        return response.data.data?.theme || response.data.theme;
    },
    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/themes/${id}`);
    },
};

export function useThemes(params?: Record<string, any>) {
    return useQuery({
        queryKey: queryKeys.themes.list(params ?? {}),
        queryFn: () => themesApi.getAll(params),
        staleTime: 2 * 60 * 1000,
    });
}

export function useTheme(id: number) {
    return useQuery({
        queryKey: queryKeys.themes.detail(id),
        queryFn: () => themesApi.getById(id),
        enabled: !!id,
    });
}

export function useCreateTheme() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: themesApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.themes.all });
            toast.success('Theme created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create theme');
        },
    });
}

export function useUpdateTheme() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: themesApi.update,
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.themes.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.themes.detail(vars.id) });
            toast.success('Theme updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update theme');
        },
    });
}

export function useDeleteTheme() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: themesApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.themes.all });
            toast.success('Theme deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete theme');
        },
    });
}
