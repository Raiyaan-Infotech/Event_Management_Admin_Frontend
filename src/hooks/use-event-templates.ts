import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, isApprovalRequired } from '@/lib/api-client';
import { toast } from 'sonner';

/**
 * Invitation Templates — the super admin's template catalogue.
 *
 * NOT the Website Builder's `company_templates`, which is a tenant's WEBSITE
 * theme. This is the design a client's event invitation is rendered from.
 *
 * Backend: `/api/v1/event-templates` (eventTemplate.service.js).
 */

/* ------------------------------------------------------------------ types -- */

/**
 * The component vocabulary, in the order the wizard first offers it.
 *
 * This list MUST stay identical to `COMPONENT_KEYS` in the backend service —
 * the backend drops any key it does not recognise, so a key that exists only
 * here is silently discarded on save with no error anywhere.
 */
export const COMPONENT_KEYS = [
    'event_title',
    'host_names',
    'date_time',
    'venue',
    'event_qr_code',
    'organizer',
    'event_photos',
    'contact_details',
    'invitation_message',
    'social_icons',
    'footer_note',
    'decoration_elements',
] as const;

export type ComponentKey = (typeof COMPONENT_KEYS)[number];

export const COMPONENT_LABELS: Record<ComponentKey, string> = {
    event_title: 'Event Title',
    host_names: 'Host / Couple Names',
    date_time: 'Date & Time',
    venue: 'Venue',
    event_qr_code: 'Event QR Code',
    organizer: 'Organizer / Hosted By',
    event_photos: 'Event Photos',
    contact_details: 'Contact Details',
    invitation_message: 'Invitation Message',
    social_icons: 'Social Media Icons',
    footer_note: 'Footer (Thanks / Note)',
    decoration_elements: 'Decoration Elements',
};

/**
 * Step 4 covers the same components PLUS three whole-design aspects that are
 * not components in their own right — you cannot toggle "Colors" on in step 3,
 * because every template has colours.
 */
export const PERMISSION_KEYS = ['background', 'colors', 'fonts', ...COMPONENT_KEYS] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
    background: 'Background (Image / Color)',
    colors: 'Colors (Theme)',
    fonts: 'Fonts',
    ...COMPONENT_LABELS,
};

export const PERMISSION_HINTS: Record<PermissionKey, string> = {
    background: 'Allow clients to change background',
    colors: 'Allow clients to change colors',
    fonts: 'Allow clients to change fonts',
    event_title: 'Allow clients to edit event title',
    host_names: 'Allow clients to edit host / couple names',
    date_time: 'Allow clients to edit date & time',
    venue: 'Allow clients to edit venue',
    event_qr_code: 'Allow clients to show / hide QR code',
    organizer: 'Allow clients to edit organizer',
    event_photos: 'Allow clients to add / change photos',
    contact_details: 'Allow clients to edit contact details',
    invitation_message: 'Allow clients to edit invitation message',
    social_icons: 'Allow clients to show / hide social icons',
    footer_note: 'Allow clients to edit footer text',
    decoration_elements: 'Allow clients to change decorations',
};

export const TEMPLATE_STYLES = [
    { value: 'classic', label: 'Classic' },
    { value: 'floral', label: 'Floral' },
    { value: 'royal', label: 'Royal' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'modern', label: 'Modern' },
    { value: 'traditional', label: 'Traditional' },
] as const;

export const LAYOUT_STYLES = [
    { value: 'classic', label: 'Classic' },
    { value: 'modern', label: 'Modern' },
    { value: 'elegant', label: 'Elegant' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'traditional', label: 'Traditional' },
] as const;

export const BACKGROUND_TYPES = [
    { value: 'color', label: 'Color' },
    { value: 'image', label: 'Image' },
    { value: 'gradient', label: 'Gradient' },
    { value: 'custom', label: 'Custom' },
] as const;

export const DIMENSIONS = [
    { value: '1080x1920', label: '1080 x 1920 (Mobile)' },
    { value: '1080x1080', label: '1080 x 1080 (Square)' },
    { value: '1200x1600', label: '1200 x 1600 (Print)' },
    { value: '1920x1080', label: '1920 x 1080 (Web)' },
    { value: '2480x3508', label: '2480 x 3508 (A4 Print)' },
] as const;

export const FONT_OPTIONS = [
    'Playfair Display',
    'Poppins',
    'Great Vibes',
    'Cormorant Garamond',
    'Montserrat',
    'Lora',
    'Cinzel',
    'Dancing Script',
    'Marcellus',
    'Inter',
] as const;

export const BORDER_STYLES = [
    { value: 'ornate', label: 'Ornate Frame' },
    { value: 'corners', label: 'Corner Flourish' },
    { value: 'arch', label: 'Arched' },
    { value: 'floral-top', label: 'Floral Top' },
    { value: 'none', label: 'No Border' },
] as const;

export const DECORATION_OPTIONS = [
    { value: 'roses', label: 'Roses' },
    { value: 'gold-leaf', label: 'Gold Leaf' },
    { value: 'greenery', label: 'Greenery' },
    { value: 'sparkle', label: 'Sparkle' },
    { value: 'mandala', label: 'Mandala' },
    { value: 'ribbon', label: 'Ribbon' },
] as const;

export const GRADIENT_TYPES = [
    { value: 'linear', label: 'Linear' },
    { value: 'radial', label: 'Radial' },
] as const;

/**
 * Which way a linear gradient runs, and the CSS angle each one means.
 *
 * The supplied design showed five arrows (→ ← ↑ ↗ ↖). The downward three are
 * here too, because the preview's existing default runs DOWN — without them
 * every gradient template already saved would have a direction no control could
 * represent, and the picker would show nothing selected.
 *
 * MUST stay identical to `GRADIENT_DIRECTIONS` in the backend service.
 */
export const GRADIENT_DIRECTIONS = [
    { value: 'top', label: 'Up', arrow: '↑', deg: 0 },
    { value: 'top-right', label: 'Up right', arrow: '↗', deg: 45 },
    { value: 'right', label: 'Right', arrow: '→', deg: 90 },
    { value: 'bottom-right', label: 'Down right', arrow: '↘', deg: 135 },
    { value: 'bottom', label: 'Down', arrow: '↓', deg: 180 },
    { value: 'bottom-left', label: 'Down left', arrow: '↙', deg: 225 },
    { value: 'left', label: 'Left', arrow: '←', deg: 270 },
    { value: 'top-left', label: 'Up left', arrow: '↖', deg: 315 },
] as const;

export const IMAGE_SHAPES = [
    { value: 'rectangle', label: 'Rectangle' },
    { value: 'square', label: 'Square' },
    { value: 'circle', label: 'Circle' },
    { value: 'heart', label: 'Heart' },
    { value: 'arch', label: 'Arch' },
] as const;

/** The Preview Gradient swatch row — one click sets both colours. */
export const GRADIENT_PRESETS = [
    { from: '#FCB7F3', to: '#B7C5FF' },
    { from: '#C7D2FE', to: '#EDE9FE' },
    { from: '#FBCFE8', to: '#FDE68A' },
    { from: '#FDE68A', to: '#FCA5A5' },
    { from: '#A7F3D0', to: '#BFDBFE' },
    { from: '#FDE2E4', to: '#E2ECE9' },
] as const;

export type GradientType = 'linear' | 'radial';
export type GradientDirection = (typeof GRADIENT_DIRECTIONS)[number]['value'];
export type ImageShape = (typeof IMAGE_SHAPES)[number]['value'];

export type BackgroundType = 'color' | 'image' | 'gradient' | 'custom';
export type Orientation = 'portrait' | 'landscape';
export type PlanAvailability = 'all' | 'selected' | 'trial';
export type PublishStatus = 'draft' | 'published';
export type Audience = 'individual' | 'company';

export interface EventTemplate {
    id: number;
    company_id: number | null;

    // step 1
    name: string;
    code: string;
    event_category_id: number | null;
    event_type_id: number | null;
    religion_id: number | null;
    /**
     * Step 1's "Template Style" — now a real row in `template_categories`.
     *
     * That table holds the same vocabulary the old hardcoded enum did, and it is
     * also what a frame style is filed under — which is what lets step 2 offer
     * the frames that suit the chosen style.
     */
    template_category_id: number | null;
    /**
     * The category's slug, kept in step with `template_category_id` by the
     * backend. Still here so anything already reading `style` keeps working:
     * send either one and both end up correct.
     */
    style: string;
    tags: string[];
    description: string | null;

    // step 2
    layout_style: string;
    background_type: BackgroundType;
    background_color: string | null;
    secondary_color: string | null;
    background_image: string | null;
    gradient_from: string | null;
    gradient_to: string | null;
    gradient_type: GradientType;
    gradient_direction: GradientDirection;
    /** Custom background only — how the uploaded design is masked. */
    image_shape: ImageShape;
    /** 0-100 percent. Custom background only, and only for rectangle/square. */
    corner_radius: number;
    /** Superseded by Upload Design + Image Shape. Nothing evaluates it. */
    custom_css: string | null;
    overlay_opacity: number;
    orientation: Orientation;
    dimension: string | null;
    primary_font: string | null;
    secondary_font: string | null;
    /** CSS fallback — used only when no `frame_style_id` is chosen. */
    border_style: string | null;
    /** Step 2's Border / Frame Style — real uploaded artwork. */
    frame_style_id: number | null;
    /** Legacy string list. Superseded by `decoration_ids`. */
    decorations: string[];
    /** Step 2's Decorations — ids into `decorations`, in display order. */
    decoration_ids: number[];

    // step 3 — WHETHER a component shows, and WHERE. Two fields on purpose:
    // toggling one off and on again must not send it to the bottom of the list.
    components: Record<ComponentKey, number>;
    component_order: ComponentKey[];

    // step 4
    permissions: Record<PermissionKey, number>;

    // step 5 — there is deliberately no pricing here.
    status: PublishStatus;
    is_active: boolean | number;
    is_featured: boolean | number;
    available_for: Audience[];
    plan_availability: PlanAvailability;
    plan_ids: number[];
    sort_order: number;
    show_on_homepage: boolean | number;
    thumbnail: string | null;

    category?: { id: number; name: string; color: string | null } | null;
    templateCategory?: { id: number; name: string; slug: string } | null;
    frameStyle?: {
        id: number;
        name: string;
        file_url: string | null;
        supported_layouts: string[];
        template_category_id: number | null;
    } | null;
    /**
     * `decoration_ids` resolved to rows, in the stored order.
     *
     * Sent on every read so the preview never has to fetch the decoration list
     * separately just to draw a template it already has.
     */
    decorationItems?: Array<{
        id: number;
        name: string;
        type: string;
        file_url: string | null;
    }>;
    eventType?: { id: number; name: string; color: string | null } | null;
    religion?: { id: number; name: string; color: string | null } | null;
    creator?: { id: number; full_name: string } | null;
    updater?: { id: number; full_name: string } | null;

    has_pending_approval?: boolean;
    created_at: string;
    updated_at?: string;
}

export interface EventTemplateStats {
    total: number;
    active: number;
    inactive: number;
    featured: number;
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

export type EventTemplatePayload = Partial<
    Omit<
        EventTemplate,
        'id' | 'company_id' | 'category' | 'eventType' | 'religion' | 'creator' | 'updater'
        | 'templateCategory' | 'frameStyle' | 'decorationItems'
        | 'has_pending_approval' | 'created_at' | 'updated_at'
    >
>;

/* -------------------------------------------------------------------- api -- */

const KEY = ['event-templates'];

const api = {
    getAll: async (params?: Record<string, unknown>): Promise<Paginated<EventTemplate>> => {
        const response = await apiClient.get('/event-templates', {
            params: { page: 1, limit: 10, ...params },
        });
        return {
            data: Array.isArray(response.data.data) ? response.data.data : [],
            pagination: response.data.pagination ?? null,
        };
    },
    getStats: async (): Promise<EventTemplateStats> => {
        const response = await apiClient.get('/event-templates/stats');
        return response.data.data?.stats ?? { total: 0, active: 0, inactive: 0, featured: 0 };
    },
    getById: async (id: number | string): Promise<EventTemplate> => {
        const response = await apiClient.get(`/event-templates/${id}`);
        return response.data.data?.template ?? response.data.data;
    },
    create: async (data: EventTemplatePayload): Promise<EventTemplate> => {
        const response = await apiClient.post('/event-templates', data);
        return response.data.data?.template ?? response.data.data;
    },
    update: async ({ id, data }: { id: number; data: EventTemplatePayload }): Promise<EventTemplate> => {
        const response = await apiClient.put(`/event-templates/${id}`, data);
        return response.data.data?.template ?? response.data.data;
    },
    // One column per request — a switch flip must not round-trip the whole row.
    updateStatus: async ({ id, is_active }: { id: number; is_active: boolean }): Promise<EventTemplate> => {
        const response = await apiClient.patch(`/event-templates/${id}/status`, { is_active });
        return response.data.data?.template ?? response.data.data;
    },
    updateFeatured: async ({ id, is_featured }: { id: number; is_featured: boolean }): Promise<EventTemplate> => {
        const response = await apiClient.patch(`/event-templates/${id}/featured`, { is_featured });
        return response.data.data?.template ?? response.data.data;
    },
    duplicate: async (id: number): Promise<EventTemplate> => {
        const response = await apiClient.post(`/event-templates/${id}/duplicate`);
        return response.data.data?.template ?? response.data.data;
    },
    reorder: async (items: Array<{ id: number; sort_order: number }>): Promise<{ updated: number }> => {
        const response = await apiClient.patch('/event-templates/reorder', { items });
        return response.data.data;
    },
    remove: async (id: number): Promise<void> => {
        await apiClient.delete(`/event-templates/${id}`);
    },
};

function templateError(queryClient: ReturnType<typeof useQueryClient>, verb: string) {
    return (error: any) => {
        // An approval-gated action is not a failure — the request was recorded.
        if (isApprovalRequired(error)) {
            queryClient.invalidateQueries({ queryKey: KEY, refetchType: 'all' });
            return;
        }
        toast.error(error?.response?.data?.message || `Failed to ${verb} template`);
    };
}

/* ------------------------------------------------------------------ hooks -- */

export function useEventTemplates(params?: Record<string, unknown>) {
    return useQuery({
        queryKey: [...KEY, params ?? {}],
        queryFn: () => api.getAll(params),
    });
}

export function useEventTemplateStats() {
    return useQuery({
        queryKey: [...KEY, 'stats'],
        queryFn: api.getStats,
    });
}

export function useEventTemplate(id: number | string | undefined) {
    return useQuery({
        queryKey: ['event-templates', 'detail', id],
        queryFn: () => api.getById(id!),
        enabled: !!id,
    });
}

/**
 * `onSuccess` is a callback rather than a router.push inside the hook —
 * navigation belongs to the component that knows where it wants to go.
 */
export function useCreateEventTemplate(onSuccess?: (template: EventTemplate) => void) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.create,
        onSuccess: (template) => {
            queryClient.invalidateQueries({ queryKey: KEY, refetchType: 'all' });
            toast.success('Template created successfully');
            onSuccess?.(template);
        },
        onError: templateError(queryClient, 'create'),
    });
}

export function useUpdateEventTemplate(onSuccess?: (template: EventTemplate) => void) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.update,
        onSuccess: (template, vars) => {
            queryClient.invalidateQueries({ queryKey: KEY, refetchType: 'all' });
            queryClient.invalidateQueries({ queryKey: ['event-templates', 'detail', vars.id] });
            toast.success('Template updated successfully');
            onSuccess?.(template);
        },
        onError: templateError(queryClient, 'update'),
    });
}

export function useUpdateEventTemplateStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.updateStatus,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY, refetchType: 'all' }),
        onError: templateError(queryClient, 'update'),
    });
}

export function useUpdateEventTemplateFeatured() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.updateFeatured,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY, refetchType: 'all' }),
        onError: templateError(queryClient, 'update'),
    });
}

export function useDuplicateEventTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.duplicate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: KEY, refetchType: 'all' });
            toast.success('Template duplicated as a draft');
        },
        onError: templateError(queryClient, 'duplicate'),
    });
}

export function useReorderEventTemplates() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.reorder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: KEY, refetchType: 'all' });
            toast.success('Template order updated');
        },
        onError: templateError(queryClient, 'reorder'),
    });
}

export function useDeleteEventTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: KEY, refetchType: 'all' });
            toast.success('Template deleted successfully');
        },
        onError: templateError(queryClient, 'delete'),
    });
}

/* ----------------------------------------------------------------- helpers -- */

/** All components on, in catalogue order — the wizard's starting point. */
export const defaultComponents = (): Record<ComponentKey, number> =>
    COMPONENT_KEYS.reduce((acc, k) => ({ ...acc, [k]: 1 }), {} as Record<ComponentKey, number>);

export const defaultPermissions = (): Record<PermissionKey, number> =>
    PERMISSION_KEYS.reduce((acc, k) => ({ ...acc, [k]: 1 }), {} as Record<PermissionKey, number>);

/**
 * A stored order can predate a component being added, so it is completed here
 * rather than trusted. Unknown keys are dropped and missing ones appended, so
 * the list always renders every component exactly once.
 */
export const normaliseOrder = (order?: ComponentKey[] | null): ComponentKey[] => {
    const seen: ComponentKey[] = [];
    for (const key of order ?? []) {
        if ((COMPONENT_KEYS as readonly string[]).includes(key) && !seen.includes(key)) seen.push(key);
    }
    for (const key of COMPONENT_KEYS) if (!seen.includes(key)) seen.push(key);
    return seen;
};
