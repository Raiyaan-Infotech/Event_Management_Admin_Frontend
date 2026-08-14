import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, isApprovalRequired } from '@/lib/api-client';
import { toast } from 'sonner';

/**
 * Menu Management — event menus and their three taxonomies.
 *
 * Event Categories, Event Types and Religions are the same resource shape, so
 * they share one hook factory instead of three near-identical files. Event
 * Menus has its own set below because of its filters, per-platform toggles,
 * duplicate and reorder actions.
 */

/* ------------------------------------------------------------------ types -- */

export interface TaxonomyRecord {
    id: number;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    sort_order: number;
    is_active: boolean | number;
    company_id: number | null;
    has_pending_approval?: boolean;
    created_at: string;
    updated_at?: string;
}

export interface EventCategory extends TaxonomyRecord {}

export interface EventType extends TaxonomyRecord {
    event_category_id: number;
    category?: { id: number; name: string; color: string | null } | null;
}

export interface Religion extends TaxonomyRecord {}

export type MenuPlatform = 'website' | 'mobile';

export interface EventMenu {
    id: number;
    name: string;
    slug: string;
    event_category_id: number | null;
    event_type_id: number | null;
    religion_id: number | null;
    is_website: number;
    is_mobile: number;
    display_website: number;
    display_mobile: number;
    active_website: number;
    active_mobile: number;
    icon: string | null;
    color: string | null;
    sort_order: number;
    is_active: boolean | number;
    /** Derived by the backend from is_website / is_mobile. */
    menu_type: MenuPlatform[];
    category?: { id: number; name: string; color: string | null } | null;
    eventType?: { id: number; name: string; color: string | null } | null;
    religion?: { id: number; name: string; color: string | null } | null;
    has_pending_approval?: boolean;
    created_at: string;
    updated_at?: string;
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

export type TaxonomyPayload = {
    name: string;
    description?: string | null;
    icon?: string | null;
    color?: string | null;
    sort_order?: number;
    is_active?: boolean | number;
    /** Event Types only. */
    event_category_id?: number | null;
};

/* -------------------------------------------------------- taxonomy factory -- */

/**
 * `resourceKey` is the key the backend wraps a single record in
 * ({ eventCategory: {...} }); the `?? response.data.data` fallbacks keep this
 * working if a route is ever changed to return the record bare.
 */
function createTaxonomyHooks<T extends TaxonomyRecord>(config: {
    path: string;
    queryKey: string;
    resourceKey: string;
    label: string;
}) {
    const { path, queryKey, resourceKey, label } = config;
    const KEY = [queryKey];

    const api = {
        getAll: async (params?: Record<string, unknown>): Promise<Paginated<T>> => {
            const response = await apiClient.get(path, { params: { page: 1, limit: 10, ...params } });
            return {
                data: Array.isArray(response.data.data) ? response.data.data : [],
                pagination: response.data.pagination ?? null,
            };
        },
        getById: async (id: number | string): Promise<T> => {
            const response = await apiClient.get(`${path}/${id}`);
            return response.data.data?.[resourceKey] ?? response.data.data;
        },
        create: async (data: TaxonomyPayload): Promise<T> => {
            const response = await apiClient.post(path, data);
            return response.data.data?.[resourceKey] ?? response.data.data;
        },
        update: async ({ id, data }: { id: number; data: Partial<TaxonomyPayload> }): Promise<T> => {
            const response = await apiClient.put(`${path}/${id}`, data);
            return response.data.data?.[resourceKey] ?? response.data.data;
        },
        updateStatus: async ({ id, is_active }: { id: number; is_active: boolean }): Promise<T> => {
            const response = await apiClient.patch(`${path}/${id}/status`, { is_active });
            return response.data.data?.[resourceKey] ?? response.data.data;
        },
        remove: async (id: number): Promise<void> => {
            await apiClient.delete(`${path}/${id}`);
        },
    };

    /**
     * Approval-required is not an error to surface — the request was accepted
     * and is now queued, and api-client already toasts that. Just refresh.
     */
    const onError = (queryClient: ReturnType<typeof useQueryClient>, verb: string) =>
        (error: any) => {
            if (isApprovalRequired(error)) {
                queryClient.invalidateQueries({ queryKey: KEY });
                return;
            }
            toast.error(error?.response?.data?.message || `Failed to ${verb} ${label.toLowerCase()}`);
        };

    return {
        useList(params?: Record<string, unknown>) {
            return useQuery({
                queryKey: [...KEY, params ?? {}],
                queryFn: () => api.getAll(params),
            });
        },
        useOne(id: number | string | undefined) {
            return useQuery({
                queryKey: [queryKey, 'detail', id],
                queryFn: () => api.getById(id!),
                enabled: !!id,
            });
        },
        useCreate() {
            const queryClient = useQueryClient();
            return useMutation({
                mutationFn: api.create,
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: KEY });
                    toast.success(`${label} created successfully`);
                },
                onError: onError(queryClient, 'create'),
            });
        },
        useUpdate() {
            const queryClient = useQueryClient();
            return useMutation({
                mutationFn: api.update,
                onSuccess: (_, vars) => {
                    queryClient.invalidateQueries({ queryKey: KEY });
                    queryClient.invalidateQueries({ queryKey: [queryKey, 'detail', vars.id] });
                    toast.success(`${label} updated successfully`);
                },
                onError: onError(queryClient, 'update'),
            });
        },
        useUpdateStatus() {
            const queryClient = useQueryClient();
            return useMutation({
                mutationFn: api.updateStatus,
                onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
                onError: onError(queryClient, 'update'),
            });
        },
        useDelete() {
            const queryClient = useQueryClient();
            return useMutation({
                mutationFn: api.remove,
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: KEY });
                    toast.success(`${label} deleted successfully`);
                },
                onError: onError(queryClient, 'delete'),
            });
        },
    };
}

/* -------------------------------------------------------- event categories -- */

const eventCategoryHooks = createTaxonomyHooks<EventCategory>({
    path: '/event-categories',
    queryKey: 'event-categories',
    resourceKey: 'eventCategory',
    label: 'Event category',
});

export const useEventCategories = eventCategoryHooks.useList;
export const useEventCategory = eventCategoryHooks.useOne;
export const useCreateEventCategory = eventCategoryHooks.useCreate;
export const useUpdateEventCategory = eventCategoryHooks.useUpdate;
export const useUpdateEventCategoryStatus = eventCategoryHooks.useUpdateStatus;
export const useDeleteEventCategory = eventCategoryHooks.useDelete;

/* ------------------------------------------------------------- event types -- */

const eventTypeHooks = createTaxonomyHooks<EventType>({
    path: '/event-types',
    queryKey: 'event-types',
    resourceKey: 'eventType',
    label: 'Event type',
});

export const useEventTypes = eventTypeHooks.useList;
export const useEventType = eventTypeHooks.useOne;
export const useCreateEventType = eventTypeHooks.useCreate;
export const useUpdateEventType = eventTypeHooks.useUpdate;
export const useUpdateEventTypeStatus = eventTypeHooks.useUpdateStatus;
export const useDeleteEventType = eventTypeHooks.useDelete;

/* --------------------------------------------------------------- religions -- */

const religionHooks = createTaxonomyHooks<Religion>({
    path: '/religions',
    queryKey: 'religions',
    resourceKey: 'religion',
    label: 'Religion',
});

export const useReligions = religionHooks.useList;
export const useReligion = religionHooks.useOne;
export const useCreateReligion = religionHooks.useCreate;
export const useUpdateReligion = religionHooks.useUpdate;
export const useUpdateReligionStatus = religionHooks.useUpdateStatus;
export const useDeleteReligion = religionHooks.useDelete;

/* ------------------------------------------------------------- event menus -- */

export type EventMenuPayload = {
    name: string;
    event_category_id?: number | null;
    event_type_id?: number | null;
    religion_id?: number | null;
    menu_type?: MenuPlatform[];
    display_website?: boolean | number;
    display_mobile?: boolean | number;
    active_website?: boolean | number;
    active_mobile?: boolean | number;
    icon?: string | null;
    color?: string | null;
    sort_order?: number;
    is_active?: boolean | number;
};

export type EventMenuToggleField =
    | 'display_website'
    | 'display_mobile'
    | 'active_website'
    | 'active_mobile';

const MENUS_KEY = ['event-menus'];

const eventMenusApi = {
    getAll: async (params?: Record<string, unknown>): Promise<Paginated<EventMenu>> => {
        const response = await apiClient.get('/event-menus', { params: { page: 1, limit: 10, ...params } });
        return {
            data: Array.isArray(response.data.data) ? response.data.data : [],
            pagination: response.data.pagination ?? null,
        };
    },
    getById: async (id: number | string): Promise<EventMenu> => {
        const response = await apiClient.get(`/event-menus/${id}`);
        return response.data.data?.eventMenu ?? response.data.data;
    },
    create: async (data: EventMenuPayload): Promise<EventMenu> => {
        const response = await apiClient.post('/event-menus', data);
        return response.data.data?.eventMenu ?? response.data.data;
    },
    update: async ({ id, data }: { id: number; data: Partial<EventMenuPayload> }): Promise<EventMenu> => {
        const response = await apiClient.put(`/event-menus/${id}`, data);
        return response.data.data?.eventMenu ?? response.data.data;
    },
    updateStatus: async ({ id, is_active }: { id: number; is_active: boolean }): Promise<EventMenu> => {
        const response = await apiClient.patch(`/event-menus/${id}/status`, { is_active });
        return response.data.data?.eventMenu ?? response.data.data;
    },
    // One column per request — a switch flip must not round-trip the whole row.
    toggle: async ({ id, field, value }: { id: number; field: EventMenuToggleField; value: boolean }): Promise<EventMenu> => {
        const response = await apiClient.patch(`/event-menus/${id}/toggle/${field}`, { value });
        return response.data.data?.eventMenu ?? response.data.data;
    },
    duplicate: async (id: number): Promise<EventMenu> => {
        const response = await apiClient.post(`/event-menus/${id}/duplicate`);
        return response.data.data?.eventMenu ?? response.data.data;
    },
    reorder: async (items: Array<{ id: number; sort_order: number }>): Promise<{ updated: number }> => {
        const response = await apiClient.patch('/event-menus/reorder', { items });
        return response.data.data;
    },
    remove: async (id: number): Promise<void> => {
        await apiClient.delete(`/event-menus/${id}`);
    },
};

function menuError(queryClient: ReturnType<typeof useQueryClient>, verb: string) {
    return (error: any) => {
        if (isApprovalRequired(error)) {
            queryClient.invalidateQueries({ queryKey: MENUS_KEY });
            return;
        }
        toast.error(error?.response?.data?.message || `Failed to ${verb} menu`);
    };
}

export function useEventMenus(params?: Record<string, unknown>) {
    return useQuery({
        queryKey: [...MENUS_KEY, params ?? {}],
        queryFn: () => eventMenusApi.getAll(params),
    });
}

export function useEventMenu(id: number | string | undefined) {
    return useQuery({
        queryKey: ['event-menus', 'detail', id],
        queryFn: () => eventMenusApi.getById(id!),
        enabled: !!id,
    });
}

/**
 * `onSuccess` is a callback rather than a router.push inside the hook —
 * navigation belongs to the component that knows where it wants to go.
 */
export function useCreateEventMenu(onSuccess?: (menu: EventMenu) => void) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: eventMenusApi.create,
        onSuccess: (menu) => {
            queryClient.invalidateQueries({ queryKey: MENUS_KEY });
            toast.success('Menu created successfully');
            onSuccess?.(menu);
        },
        onError: menuError(queryClient, 'create'),
    });
}

export function useUpdateEventMenu(onSuccess?: (menu: EventMenu) => void) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: eventMenusApi.update,
        onSuccess: (menu, vars) => {
            queryClient.invalidateQueries({ queryKey: MENUS_KEY });
            queryClient.invalidateQueries({ queryKey: ['event-menus', 'detail', vars.id] });
            toast.success('Menu updated successfully');
            onSuccess?.(menu);
        },
        onError: menuError(queryClient, 'update'),
    });
}

export function useUpdateEventMenuStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: eventMenusApi.updateStatus,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: MENUS_KEY }),
        onError: menuError(queryClient, 'update'),
    });
}

export function useToggleEventMenuFlag() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: eventMenusApi.toggle,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: MENUS_KEY }),
        onError: menuError(queryClient, 'update'),
    });
}

export function useDuplicateEventMenu() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: eventMenusApi.duplicate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MENUS_KEY });
            toast.success('Menu duplicated successfully');
        },
        onError: menuError(queryClient, 'duplicate'),
    });
}

export function useReorderEventMenus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: eventMenusApi.reorder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MENUS_KEY });
            toast.success('Menu order updated');
        },
        onError: menuError(queryClient, 'reorder'),
    });
}

export function useDeleteEventMenu() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: eventMenusApi.remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MENUS_KEY });
            toast.success('Menu deleted successfully');
        },
        onError: menuError(queryClient, 'delete'),
    });
}
