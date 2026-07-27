import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export interface PricingPlan {
    id?: number;
    plan_name: string;
    subtitle?: string;
    target_type: 'individuals' | 'companies';
    currency: string;
    price_monthly: number;
    price_yearly: number;
    period_label?: string;
    badge_text?: string;
    badge_style?: 'filled' | 'outline' | 'soft-filled' | 'soft-outline';
    is_popular?: boolean;
    features_json: Array<{ label: string; included: boolean }>;
    is_active?: boolean;
    sort_order?: number;
}

export interface PricingSettings {
    section_title: string;
    section_subtitle: string;
    badge_text: string;
    individual_heading: string;
    individual_subheading: string;
    company_heading: string;
    company_subheading: string;
    yearly_discount_badge: string;
}

export interface PricingMatrixFeature {
    id?: number;
    feature_name: string;
    category: string;
    plan_values_json: Record<string, string | boolean>;
    sort_order?: number;
    is_active?: boolean;
}

export function usePricingPlansData() {
    return useQuery({
        queryKey: ['website-builder-pricing-plans'],
        queryFn: async () => {
            const res = await apiClient.get('/website-builder/pricing/plans');
            return res.data.data as PricingPlan[];
        },
    });
}

export function useSavePricingPlans() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (plans: PricingPlan[]) => {
            const res = await apiClient.put('/website-builder/pricing/plans', { items: plans });
            return res.data;
        },
        onSuccess: () => {
            toast.success('Pricing plans saved successfully!');
            queryClient.invalidateQueries({ queryKey: ['website-builder-pricing-plans'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || error.message || 'Error saving pricing plans.');
        },
    });
}

export function useSavePricingSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (settings: PricingSettings) => {
            const res = await apiClient.put('/website-builder/pricing/settings', settings);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Pricing section settings saved successfully!');
            queryClient.invalidateQueries({ queryKey: ['website-builder-pricing-settings'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || error.message || 'Error saving pricing settings.');
        },
    });
}
