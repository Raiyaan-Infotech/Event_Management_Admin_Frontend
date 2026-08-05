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
  page_slug?: string;
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
  design_json?: any;
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
  top_list_heading_2?: string;
  quick_links_json?: any;
  quick_links_2_json?: any;
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

const useSingleton = <T>(key: string, endpoint: string, pageSlug?: string) => {
  const queryClient = useQueryClient();
  const queryKey = pageSlug ? ['company-website-builder', key, pageSlug] : ['company-website-builder', key];
  const url = pageSlug ? `/website-builder/${endpoint}?page=${pageSlug}` : `/website-builder/${endpoint}`;

  const query = useQuery<T>({
    queryKey,
    queryFn: async () => {
      const res: any = await api.get(url);
      if (res && typeof res === 'object') {
        if ('data' in res && res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
          return res.data as T;
        }
        return res as T;
      }
      return {} as T;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const mutation = useMutation({
    mutationFn: async (payload: T) => {
      const payloadWithPage = pageSlug ? { ...payload, page_slug: pageSlug } : payload;
      const data: any = await api.put(url, payloadWithPage);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-website-builder'] });
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
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
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
      try {
        const data: any = await api.put(`/website-builder/${endpoint}`, { items });
        return data;
      } catch (err: any) {
        // Fallback for legacy backend if PUT /website-builder/:endpoint (batch) is not deployed on production yet
        if (err?.response?.status === 404 || err?.status === 404) {
          console.warn(`[replaceMutation] PUT /website-builder/${endpoint} returned 404. Running item-by-item fallback...`);
          const results = [];
          for (const item of items) {
            if (item.id && typeof item.id === 'number') {
              const res = await api.put(`/website-builder/${endpoint}/${item.id}`, item);
              results.push(res);
            } else {
              const { id, ...createPayload } = item;
              const res = await api.post(`/website-builder/${endpoint}`, createPayload);
              results.push(res);
            }
          }
          return results;
        }
        throw err;
      }
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

export const useCompanyHeroSection = (pageSlug: string = 'home') => {
  const queryClient = useQueryClient();
  const queryKey = ['company-website-builder', 'hero-section', pageSlug];
  const url = `/website-builder/hero-section?page=${pageSlug}`;

  const query = useQuery<CompanyHeroSection>({
    queryKey,
    queryFn: async () => {
      const res: any = await api.get(url);
      const backendObject = (res && typeof res === 'object' && res.data && typeof res.data === 'object' && !Array.isArray(res.data)
        ? res.data
        : (res || {})) as CompanyHeroSection;

      let storedMap: Record<string, CompanyHeroSection> = {};
      try {
        if (backendObject.design_json) {
          storedMap = typeof backendObject.design_json === 'string'
            ? JSON.parse(backendObject.design_json)
            : backendObject.design_json;
        }
      } catch (e) {}

      if (!storedMap || Object.keys(storedMap).length === 0) {
        try {
          const local = typeof window !== 'undefined' ? localStorage.getItem('company_hero_sections_map') : null;
          if (local) storedMap = JSON.parse(local);
        } catch (e) {}
      }

      if (storedMap && storedMap[pageSlug]) {
        return { ...backendObject, ...storedMap[pageSlug], page_slug: pageSlug };
      }

      if (backendObject.page_slug === pageSlug) {
        return backendObject as CompanyHeroSection;
      }

      if (pageSlug === 'home') {
        return backendObject as CompanyHeroSection;
      }

      return {
        ...backendObject,
        page_slug: pageSlug,
        badge_text: pageSlug === 'features' ? 'Features Showcase' : pageSlug === 'pricing' ? 'Simple Pricing' : pageSlug === 'contact' ? 'Get In Touch' : pageSlug === 'how-it-works' ? 'How It Works' : pageSlug === 'template' ? 'Event Templates' : 'Premier Event Management',
        title: pageSlug === 'features' ? 'Everything You Need To Plan Flawless Events' : pageSlug === 'pricing' ? 'Flexible Pricing Tiers For Every Event' : pageSlug === 'contact' ? 'Let Us Help You Bring Your Event To Life' : pageSlug === 'how-it-works' ? 'Simple Steps To Create & Manage Events' : pageSlug === 'template' ? 'Discover Beautiful Event Invitation Templates' : 'We Create Unforgettable Moments',
        description: pageSlug === 'features' ? 'Explore powerful management tools for guest lists, tickets, vendor coordination, and live analytics.' : pageSlug === 'pricing' ? 'Choose the perfect plan tailored to your event size and management requirements.' : pageSlug === 'contact' ? 'Have questions or need a custom quote? Reach out to our expert event planning team.' : pageSlug === 'how-it-works' ? 'Watch tutorials and learn how to configure your event website in minutes.' : pageSlug === 'template' ? 'Pick a template, customize design elements, and publish your website instantly.' : 'From elegant weddings to corporate events, we handle every detail with creativity and perfection.',
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const mutation = useMutation({
    mutationFn: async (payload: CompanyHeroSection) => {
      let storedMap: Record<string, CompanyHeroSection> = {};
      try {
        const local = typeof window !== 'undefined' ? localStorage.getItem('company_hero_sections_map') : null;
        if (local) storedMap = JSON.parse(local);
      } catch (e) {}

      const updatedMap = {
        ...storedMap,
        [pageSlug]: { ...payload, page_slug: pageSlug },
      };

      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('company_hero_sections_map', JSON.stringify(updatedMap));
        }
      } catch (e) {}

      const finalPayload = {
        ...payload,
        page_slug: pageSlug,
        design_json: updatedMap,
      };

      const data: any = await api.put(url, finalPayload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-website-builder', 'hero-section'] });
    },
  });

  return { ...query, save: mutation.mutateAsync, isSaving: mutation.isPending };
};
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
