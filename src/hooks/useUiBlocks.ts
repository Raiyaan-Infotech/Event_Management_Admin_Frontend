import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export interface UiBlockPayloadItem {
    id: string;
    label: string;
    description: string;
    visible: boolean;
    locked: boolean;
    required: boolean;
    sort_order: number;
}

export function useUiBlocksData() {
    return useQuery({
        queryKey: ['website-builder-ui-blocks'],
        queryFn: async () => {
            const res = await apiClient.get('/website-builder/ui-blocks');
            // DB rows use block_key column; normalize to id for consistency with the in-memory block definitions
            const rows = (res.data.data ?? []) as Array<Record<string, unknown>>;
            return rows.map((row) => ({
                ...row,
                // IMPORTANT: row.id is the integer DB primary key (1, 2, 3…).
                // row.block_key is the string identifier ("pricing-plans" etc.)
                // We MUST use block_key so sidebar uiBlockKey lookups match correctly.
                id: (row.block_key ?? row.id) as string,
                visible: row.is_visible === 1 || row.is_visible === true || row.visible === true,
            })) as UiBlockPayloadItem[];
        },
    });
}

export function useSaveUiBlocks() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (blocks: UiBlockPayloadItem[]) => {
            const res = await apiClient.put('/website-builder/ui-blocks', { items: blocks });
            return res.data;
        },
        onSuccess: () => {
            toast.success('UI blocks order & visibility saved successfully!');
            queryClient.invalidateQueries({ queryKey: ['website-builder-ui-blocks'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || error.message || 'Failed to save UI blocks');
        },
    });
}
