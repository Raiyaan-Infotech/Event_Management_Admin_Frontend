import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export interface HighlightItem {
    id: string;
    icon: string;
    title: string;
    description: string;
}

export interface HighlightsSettings {
    id?: number;
    page_slug: string;
    instance: number;
    items: HighlightItem[];
    items_per_row: number;
    icon_style: 'filled' | 'outline';
    icon_shape: 'circle' | 'square' | 'rounded';
    alignment: 'left' | 'center' | 'right';
    icon_bg_color: string;
    icon_color: string;
    title_color: string;
    description_color: string;
    background_type: 'solid' | 'gradient' | 'image';
    background_color: string;
    background_image_url?: string;
    image_position?: string;
    image_size?: string;
    overlay_opacity?: number;
    preset?: string;
}

export const DEFAULT_HIGHLIGHTS: HighlightsSettings = {
    page_slug: 'home',
    instance: 1,
    items: [
        { id: '1', icon: 'Calendar', title: '1000+ Templates', description: 'For every occasion' },
        { id: '2', icon: 'Sliders', title: 'Easy Customization', description: 'Make it your own' },
        { id: '3', icon: 'Monitor', title: 'Preview Before Use', description: 'See how it looks' },
        { id: '4', icon: 'RefreshCw', title: 'Regular Updates', description: 'New templates added' },
        { id: '5', icon: 'Upload', title: 'One Click Import', description: 'Ready in seconds' },
        { id: '6', icon: 'HelpCircle', title: '24/7 Support', description: 'We\'re here to help' },
    ],
    items_per_row: 6,
    icon_style: 'filled',
    icon_shape: 'circle',
    alignment: 'center',
    icon_bg_color: '#F3F0FF',
    icon_color: '#6C5DD3',
    title_color: '#1F2937',
    description_color: '#6B7280',
    background_type: 'solid',
    background_color: '#FFFFFF',
    overlay_opacity: 20,
    preset: 'default',
};

export function useHighlights(pageSlug: string, instance: number = 1) {
    return useQuery({
        queryKey: ['website-builder-highlights', pageSlug, instance],
        queryFn: async () => {
            const res = await apiClient.get(`/website-builder/highlights?page_slug=${pageSlug}&instance=${instance}`);
            if (res.data?.data) {
                return { ...DEFAULT_HIGHLIGHTS, ...res.data.data, page_slug: pageSlug, instance };
            }
            if (res.data && typeof res.data === 'object' && res.data.items) {
                return { ...DEFAULT_HIGHLIGHTS, ...res.data, page_slug: pageSlug, instance };
            }
            return { ...DEFAULT_HIGHLIGHTS, page_slug: pageSlug, instance };
        },
    });
}

export function useSaveHighlights() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: HighlightsSettings) => {
            const res = await apiClient.put('/website-builder/highlights', payload);
            return res.data;
        },
        onSuccess: (_, variables) => {
            toast.success('Highlights customization saved successfully!');
            queryClient.invalidateQueries({
                queryKey: ['website-builder-highlights', variables.page_slug, variables.instance],
            });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || error.message || 'Failed to save highlights');
        },
    });
}
