import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api-client';

export interface CompanyBasicInformation {
  id?: number;
  company_name?: string;
  city?: string;
  logo_url?: string;
  header_color?: string;
  contact_type?: string;
  mobile_country_code?: string;
  mobile?: string;
  email?: string;
  address?: string;
  social_links_json?: any;
  show_social_icons?: boolean | number;
  show_login?: boolean | number;
  show_signin?: boolean | number;
  is_active?: boolean | number;
}

export interface CompanyHeroSection {
  id?: number;
  image_url?: string;
  badge_text?: string;
  title?: string;
  description?: string;
  hero_height?: string;
  overlay_enabled?: boolean | number;
  overlay_color?: string;
  overlay_opacity?: number;
  button_1_json?: any;
  button_2_json?: any;
  button_layout?: string;
  content_alignment?: string;
  is_active?: boolean | number;
}

export interface CompanyFooterSettings {
  id?: number;
  logo_url?: string;
  company_name?: string;
  description?: string;
  contact_type?: string;
  mobile?: string;
  email?: string;
  address?: string;
  top_list_json?: any;
  top_list_heading?: string;
  quick_links_json?: any;
  add_pages_json?: any;
  show_newsletter?: boolean | number;
  show_social_links?: boolean | number;
  copyright_text?: string;
  powered_by_text?: string;
  is_active?: boolean | number;
}

export interface CompanySeoSettings {
  id?: number;
  default_title?: string;
  default_description?: string;
  default_keywords?: string;
  author?: string;
  language?: string;
  site_name?: string;
  og_title?: string;
  og_description?: string;
  og_image_url?: string;
  twitter_card?: string;
  canonical_url?: string;
  robots_index?: boolean | number;
  robots_follow?: boolean | number;
  sitemap_enabled?: boolean | number;
  structured_data_enabled?: boolean | number;
  is_active?: boolean | number;
}

// ── Generic Singleton Custom Hooks ──────────────────────────────────────────

const useSingleton = <T>(key: string, endpoint: string) => {
  const queryClient = useQueryClient();
  const query = useQuery<T>({
    queryKey: ['company-website-builder', key],
    queryFn: async () => {
      const data: any = await api.get(`/website-builder/${endpoint}`);
      return (data && typeof data === 'object' ? data : {}) as T;
    },
    staleTime: 0,
  });

  const mutation = useMutation({
    mutationFn: async (payload: T) => {
      const data: any = await api.put(`/website-builder/${endpoint}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-website-builder', key] });
    },
  });

  return { ...query, save: mutation.mutateAsync, isSaving: mutation.isPending };
};

// ── Generic List Custom Hooks ───────────────────────────────────────────────

const useList = <T extends { id?: number }>(key: string, endpoint: string) => {
  const queryClient = useQueryClient();
  const query = useQuery<T[]>({
    queryKey: ['company-website-builder', key],
    queryFn: async () => {
      const data: any = await api.get(`/website-builder/${endpoint}`);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 0,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<T>) => {
      const data: any = await api.post(`/website-builder/${endpoint}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-website-builder', key] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...payload }: Partial<T> & { id: number }) => {
      const data: any = await api.put(`/website-builder/${endpoint}/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-website-builder', key] });
    },
  });

  const replaceMutation = useMutation({
    mutationFn: async (items: Partial<T>[]) => {
      const data: any = await api.put(`/website-builder/${endpoint}`, { items });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-website-builder', key] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const data: any = await api.delete(`/website-builder/${endpoint}/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-website-builder', key] });
    },
  });

  return {
    ...query,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    replace: replaceMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending || replaceMutation.isPending,
  };
};

// ── Exported Module Hooks ──────────────────────────────────────────────────

export const useCompanyBasicInformation = () => useSingleton<CompanyBasicInformation>('basic-info', 'basic-information');
export const useCompanyHeroSection = () => useSingleton<CompanyHeroSection>('hero-section', 'hero-section');
export const useCompanyFooterSettings = () => useSingleton<CompanyFooterSettings>('footer', 'footer');
export const useCompanySeoSettings = () => useSingleton<CompanySeoSettings>('seo', 'seo');
export const useCompanyLoginSettings = () => useSingleton<any>('login-settings', 'login-settings');
export const useCompanyThemeSettings = () => useSingleton<any>('theme-settings', 'theme-settings');
export const useCompanyContactSettings = () => useSingleton<any>('contact-settings', 'contact-settings');

export const useCompanySocialLinks = () => useList<any>('social-links', 'social-links');
export const useCompanyPages = () => useList<any>('pages', 'pages');
export const useCompanyMenuItems = () => useList<any>('menu-items', 'menu-items');
export const useCompanyUiBlocks = () => useList<any>('company-ui-blocks', 'company-ui-blocks');
export const useCompanySliders = () => useList<any>('sliders', 'sliders');
export const useCompanySliderItems = () => useList<any>('slider-items', 'slider-items');
export const useCompanyGalleryCategories = () => useList<any>('gallery-categories', 'gallery-categories');
export const useCompanyGalleryItems = () => useList<any>('gallery-items', 'gallery-items');
export const useCompanyContactCategories = () => useList<any>('contact-categories', 'contact-categories');
export const useCompanyContactMessages = () => useList<any>('contact-messages', 'contact-messages');
export const useCompanyTestimonials = () => useList<any>('testimonials', 'testimonials');
export const useCompanyClients = () => useList<any>('clients', 'clients');
export const useCompanySponsors = () => useList<any>('sponsors', 'sponsors');
export const useCompanyFeatures = () => useList<any>('features', 'features');
export const useCompanyHowItWorks = () => useList<any>('how-it-works', 'how-it-works');
export const useCompanyPricingPlans = () => useList<any>('pricing-plans', 'pricing-plans');
export const useCompanyFaqs = () => useList<any>('faqs', 'faqs');
export const useCompanyVideoTutorials = () => useList<any>('video-tutorials', 'video-tutorials');
export const useCompanyTemplates = () => useList<any>('templates', 'templates');
export const useCompanyHighlights = () => useList<any>('highlights', 'highlights');
