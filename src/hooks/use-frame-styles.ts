import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, isApprovalRequired } from '@/lib/api-client';
import { toast } from 'sonner';

/**
 * Frame / border styles — the uploaded artwork that frames an invitation.
 *
 * The file IS the design. Everything else on the row is how it gets found: a
 * name to read, a template category to filter by, and which page shapes it was
 * drawn to fit.
 *
 * Distinct from `event_templates.border_style`, which is an enum mapping to a
 * CSS border class. A double line is not an ornate frame; this is the real
 * artwork, uploaded once and reusable.
 *
 * Backend: `/api/v1/frame-styles` (frameStyle.service.js).
 */

/* ------------------------------------------------------------------ types -- */

/**
 * The page shapes a frame can be drawn for.
 *
 * MUST stay identical to `LAYOUTS` in the backend service — anything it does
 * not recognise is dropped on write with no error anywhere.
 */
export const FRAME_LAYOUTS = ['portrait', 'landscape', 'square'] as const;

export type FrameLayout = (typeof FRAME_LAYOUTS)[number];

export const FRAME_LAYOUT_LABELS: Record<FrameLayout, string> = {
    portrait: 'Portrait',
    landscape: 'Landscape',
    square: 'Square',
};

export type FramePublishStatus = 'draft' | 'published';

export interface FrameStyle {
    id: number;
    company_id: number | null;
    name: string;
    template_category_id: number | null;
    /** The uploaded SVG / PNG / JPG. This is the frame itself. */
    file_url: string | null;
    file_name: string | null;
    supported_layouts: FrameLayout[];
    /** Prebuilt "Portrait, Landscape, Square" for the list column. */
    supported_layouts_label?: string;
    /** Save as Draft vs Upload Style. Separate from `is_active` — see below. */
    status: FramePublishStatus;
    /**
     * The form's Status toggle.
     *
     * Two fields on purpose: a published frame can be switched off without
     * becoming a draft again, and a draft is not offered whatever this says.
     */
    is_active: boolean | number;
    sort_order: number;
    /** Null when the category it pointed at has been deleted. */
    category?: { id: number; name: string; slug: string } | null;
    creator?: { id: number; full_name: string } | null;
    updater?: { id: number; full_name: string } | null;
    has_pending_approval?: boolean;
    created_at: string;
    updated_at?: string;
}

export interface FrameStyleStats {
    total: number;
    active: number;
    inactive: number;
    draft: number;
}

export interface Paginated<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    } | null;
}

export type FrameStylePayload = {
    name?: string;
    template_category_id?: number | null;
    file_url?: string | null;
    file_name?: string | null;
    supported_layouts?: FrameLayout[];
    status?: FramePublishStatus;
    is_active?: number;
    sort_order?: number;
};

/* -------------------------------------------------------------------- api -- */

const KEY = ['frame-styles'];
const PATH = '/frame-styles';

const api = {
    getAll: async (params?: Record<string, unknown>): Promise<Paginated<FrameStyle>> => {
        const response = await apiClient.get(PATH, {
            params: { page: 1, limit: 10, ...params },
        });
        return {
            data: Array.isArray(response.data.data) ? response.data.data : [],
            pagination: response.data.pagination ?? null,
        };
    },
    getStats: async (): Promise<FrameStyleStats> => {
        const response = await apiClient.get(`${PATH}/stats`);
        return response.data.data?.stats ?? { total: 0, active: 0, inactive: 0, draft: 0 };
    },
    getById: async (id: number | string): Promise<FrameStyle> => {
        const response = await apiClient.get(`${PATH}/${id}`);
        return response.data.data?.frameStyle ?? response.data.data;
    },
    create: async (data: FrameStylePayload): Promise<FrameStyle> => {
        const response = await apiClient.post(PATH, data);
        return response.data.data?.frameStyle ?? response.data.data;
    },
    update: async ({ id, data }: { id: number; data: FrameStylePayload }): Promise<FrameStyle> => {
        const response = await apiClient.put(`${PATH}/${id}`, data);
        return response.data.data?.frameStyle ?? response.data.data;
    },
    updateStatus: async ({ id, is_active }: { id: number; is_active: boolean }): Promise<FrameStyle> => {
        const response = await apiClient.patch(`${PATH}/${id}/status`, { is_active });
        return response.data.data?.frameStyle ?? response.data.data;
    },
    remove: async (id: number): Promise<void> => {
        await apiClient.delete(`${PATH}/${id}`);
    },
};

function frameError(queryClient: ReturnType<typeof useQueryClient>, verb: string) {
    return (error: any) => {
        if (isApprovalRequired(error)) {
            queryClient.invalidateQueries({ queryKey: KEY, refetchType: 'all' });
            return;
        }
        toast.error(error?.response?.data?.message || `Failed to ${verb} frame style`);
    };
}

/* ------------------------------------------------------------------ hooks -- */

export function useFrameStyles(params?: Record<string, unknown>) {
    return useQuery({
        queryKey: [...KEY, params ?? {}],
        queryFn: () => api.getAll(params),
    });
}

export function useFrameStyleStats() {
    return useQuery({
        queryKey: [...KEY, 'stats'],
        queryFn: api.getStats,
    });
}

export function useFrameStyle(id: number | string | undefined) {
    return useQuery({
        queryKey: [...KEY, 'detail', id],
        queryFn: () => api.getById(id!),
        enabled: !!id,
    });
}

/**
 * `onSuccess` is a callback rather than a router.push inside the hook —
 * navigation belongs to the component that knows where it wants to go.
 */
export function useCreateFrameStyle(onSuccess?: (frameStyle: FrameStyle) => void) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.create,
        onSuccess: (frameStyle) => {
            queryClient.invalidateQueries({ queryKey: KEY, refetchType: 'all' });
            toast.success(
                frameStyle.status === 'draft'
                    ? 'Frame style saved as a draft'
                    : 'Frame style uploaded successfully'
            );
            onSuccess?.(frameStyle);
        },
        onError: frameError(queryClient, 'upload'),
    });
}

export function useUpdateFrameStyle(onSuccess?: (frameStyle: FrameStyle) => void) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.update,
        onSuccess: (frameStyle, vars) => {
            queryClient.invalidateQueries({ queryKey: KEY, refetchType: 'all' });
            queryClient.invalidateQueries({ queryKey: [...KEY, 'detail', vars.id] });
            toast.success('Frame style updated successfully');
            onSuccess?.(frameStyle);
        },
        onError: frameError(queryClient, 'update'),
    });
}

export function useUpdateFrameStyleStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.updateStatus,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY, refetchType: 'all' }),
        onError: frameError(queryClient, 'update'),
    });
}

export function useDeleteFrameStyle() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: KEY, refetchType: 'all' });
            toast.success('Frame style deleted successfully');
        },
        onError: frameError(queryClient, 'delete'),
    });
}

/* ----------------------------------------------------------------- helpers -- */

/**
 * A stored list can predate a layout being added, so it is normalised here
 * rather than trusted. Unknown values dropped; an empty result means all three,
 * matching the backend's own fallback — a frame that supports no layout could
 * never be used.
 */
export const normaliseLayouts = (layouts?: FrameLayout[] | null): FrameLayout[] => {
    const picked = new Set((layouts ?? []).map((l) => String(l).toLowerCase()));
    const out = FRAME_LAYOUTS.filter((l) => picked.has(l));
    return out.length ? [...out] : [...FRAME_LAYOUTS];
};

export const layoutsLabel = (layouts?: FrameLayout[] | null): string =>
    normaliseLayouts(layouts).map((l) => FRAME_LAYOUT_LABELS[l]).join(', ');
