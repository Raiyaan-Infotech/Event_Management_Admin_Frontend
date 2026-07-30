// ─────────────────────────────────────────────────────────────────────────────
// Company Website Preview — Shared Types & Builder Helpers
// Adapted from Event_Managment_Website_Builder/src/components/website-preview/sections/preview-shared.ts
// ─────────────────────────────────────────────────────────────────────────────

export type AnyRecord = Record<string, unknown>;

export type HeroButton = {
  enabled: boolean;
  label: string;
  link: string;
  style: 'Primary' | 'Outline' | 'Ghost';
  color: string;
};

export type NavItem = {
  id: string;
  label: string;
  href: string;
  children: Array<{ label: string; href: string }>;
};

export type SocialLink = {
  label: string;
  href: string;
  iconName: string;
  color: string;
};

export type SlideItem = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  buttonLabel: string;
  buttonColor: string;
  buttonTextColor: string;
  buttonLink: string;
  titleColor: string;
  descriptionColor: string;
  overlayOpacity: number;
  brightness: number;
  blur: number;
};

export type SliderMeta = {
  type: 'simple' | 'advanced';
  height: string;
  autoplay: boolean;
  autoplaySpeed: number;
  globalTitleColor: string;
  globalDescriptionColor: string;
  globalOverlayOpacity: number;
  globalBrightness: number;
  globalBlur: number;
};

export type GalleryCategory = {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
};

export type GalleryItem = {
  id: number;
  categoryId: number | null;
  eventName: string;
  eventType: string;
  imageUrl: string;
  altText: string;
  sortOrder: number;
};

export type Testimonial = {
  id: number;
  name: string;
  event: string;
  feedback: string;
  photoUrl: string;
  rating: number;
  showRating: boolean;
};

export type Logo = {
  id: string;
  name: string;
  photoUrl: string;
  href: string;
};

export type LegalPage = {
  id: number;
  title: string;
  slug: string;
  content: string;
};

// ── Scalar helpers ────────────────────────────────────────────────────────────

export function stringValue(...values: unknown[]) {
  for (const value of values) {
    const next = String(value ?? '').trim();
    if (next) return next;
  }
  return '';
}

export function boolValue(value: unknown, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  return !['0', 'false', 'no', 'off'].includes(String(value).toLowerCase());
}

export function normalizeHref(value: unknown) {
  const raw = String(value ?? '').trim();
  if (!raw) return '#';
  const isAbsolute = /^(https?:)?\//i.test(raw) || raw.startsWith('//') || raw.startsWith('#');
  if (isAbsolute) return raw;
  return `/${raw.replace(/^\/+/, '')}`;
}

export function stripHtml(html: string) {
  return String(html ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function isRecord(value: unknown): value is AnyRecord {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

export function parseRecord(value: unknown): AnyRecord {
  if (!value) return {};
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function isExternalHref(href: unknown) {
  const raw = String(href ?? '').trim();
  if (!raw || raw === '#') return true;
  if (raw.startsWith('//') || /^https?:/i.test(raw)) return true;
  if (/^(mailto:|tel:)/i.test(raw)) return true;
  return false;
}

export function viewKeyFromHref(href: unknown): string {
  const key = String(href ?? '').replace(/^\/+/, '').replace(/\/+$/, '').toLowerCase();
  if (key === '' || key === '/' || key === 'home') return 'home';
  if (key.includes('gallery')) return 'gallery';
  if (key.includes('contact')) return 'contact';
  return key;
}

export function findPageForViewKey(key: string, pages: LegalPage[]): LegalPage | null {
  if (!key || key === 'home' || key === 'gallery' || key === 'contact') return null;
  const exact = pages.find((page) => viewKeyFromHref(page.slug) === key);
  if (exact) return exact;
  const norm = (v: unknown) => String(v ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const target = norm(key);
  if (!target) return null;
  return pages.find((page) => {
    const slug = norm(page.slug);
    const title = norm(page.title);
    return (slug && (slug.includes(target) || target.includes(slug))) || (title && title.includes(target));
  }) || null;
}

// ── Theme ────────────────────────────────────────────────────────────────────

export const ADMIN_THEME_COLORS = {
  primaryBg: '#7C3AED',
  primaryText: '#0F172A',
  secondaryText: '#64748B',
  paragraph: '#475569',
};

export function parseThemeColors(themeSettings: AnyRecord) {
  const useCustom = boolValue(themeSettings.use_custom_colors, false);
  if (useCustom) {
    return {
      primaryText: stringValue(themeSettings.primary_text_color, ADMIN_THEME_COLORS.primaryText),
      primaryButton: stringValue(themeSettings.primary_bg_color, ADMIN_THEME_COLORS.primaryBg),
      secondaryText: stringValue(themeSettings.secondary_text_color, ADMIN_THEME_COLORS.secondaryText),
      paragraph: stringValue(themeSettings.paragraph_color, ADMIN_THEME_COLORS.paragraph),
    };
  }
  return {
    primaryText: ADMIN_THEME_COLORS.primaryText,
    primaryButton: ADMIN_THEME_COLORS.primaryBg,
    secondaryText: ADMIN_THEME_COLORS.secondaryText,
    paragraph: ADMIN_THEME_COLORS.paragraph,
  };
}

// ── Header ───────────────────────────────────────────────────────────────────

export function parseHeaderSettings(basicInfo: AnyRecord) {
  return {
    headerColor: stringValue(basicInfo.header_color, '#FFFFFF'),
    showSocialIcons: boolValue(basicInfo.show_social_icons, true),
    showLogin: boolValue(basicInfo.show_login, true),
    showSignIn: boolValue(basicInfo.show_signin, true),
    mobile: stringValue(basicInfo.mobile),
    mobileCountryCode: stringValue(basicInfo.mobile_country_code, '+91'),
    email: stringValue(basicInfo.email).toLowerCase(),
  };
}

export function buildPhone(header: ReturnType<typeof parseHeaderSettings>) {
  const raw = stringValue(header.mobile);
  if (!raw) return '';
  if (raw.startsWith('+')) return raw;
  return `${header.mobileCountryCode} ${raw}`.trim();
}

export function buildSocialLinks(socialLinks: AnyRecord[]) {
  return (socialLinks || [])
    .filter((item) => boolValue(item.is_active ?? item.active, true))
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .map((item) => {
      const label = stringValue(item.label, item.social_network, item.name, 'Social');
      return {
        label,
        href: normalizeHref(item.url ?? item.link ?? item.href),
        iconName: stringValue(item.iconName, item.icon_key, item.icon, 'simple-icons:linktree'),
        color: stringValue(item.color, item.icon_color, '#1877F2'),
      };
    })
    .filter((item) => item.href !== '#')
    .slice(0, 10);
}

// ── Nav Menu ─────────────────────────────────────────────────────────────────

const FALLBACK_NAV: NavItem[] = [
  { id: 'home', label: 'Home', href: '/', children: [] },
  { id: 'about-us', label: 'About Us', href: '/about-us', children: [] },
  { id: 'gallery', label: 'Gallery', href: '/gallery', children: [] },
  { id: 'contact-us', label: 'Contact Us', href: '/contact-us', children: [] },
];

export function buildNavItems(menuItems: AnyRecord[], pages: AnyRecord[]) {
  const rawItems = menuItems
    .filter((item) => !item.parent_id && boolValue(item.is_visible, true))
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));

  if (!rawItems.length) return FALLBACK_NAV;

  const childrenByParent = new Map<string, Array<{ label: string; href: string }>>();
  menuItems
    .filter((item) => item.parent_id && boolValue(item.is_visible, true))
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .forEach((item) => {
      const parentId = String(item.parent_id);
      const kids = childrenByParent.get(parentId) || [];
      kids.push({ label: stringValue(item.label, 'Page'), href: normalizeHref(item.url || '') });
      childrenByParent.set(parentId, kids);
    });

  return rawItems.map((item) => {
    const id = String(item.id || '');
    return {
      id,
      label: stringValue(item.label, 'Menu'),
      href: normalizeHref(item.url || ''),
      children: childrenByParent.get(id) || [],
    };
  });
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function parseHeroButton(value: unknown, theme: ReturnType<typeof parseThemeColors>, fallback: HeroButton): HeroButton {
  const record = parseRecord(value);
  return {
    enabled: boolValue(record.enabled, fallback.enabled),
    label: stringValue(record.label, fallback.label),
    link: normalizeHref(record.customUrl || record.link || fallback.link),
    style:
      record.style === 'Outline' || record.style === 'Ghost' || record.style === 'Primary'
        ? record.style
        : fallback.style,
    color: theme.primaryButton,
  };
}

export function buildHero(heroSection: AnyRecord, theme: ReturnType<typeof parseThemeColors>) {
  const button1 = parseHeroButton(heroSection.button_1_json, theme, {
    enabled: true,
    label: 'Book Consultation',
    link: '/contact-us',
    style: 'Primary',
    color: theme.primaryButton,
  });
  const button2 = parseHeroButton(heroSection.button_2_json, theme, {
    enabled: true,
    label: 'Explore Events',
    link: '/gallery',
    style: 'Outline',
    color: '#FFFFFF',
  });
  return {
    imageUrl: stringValue(heroSection.image_url),
    badgeText: stringValue(heroSection.badge_text, 'Best Event Management'),
    title: stringValue(heroSection.title, 'Creating Unforgettable Moments'),
    description: stringValue(heroSection.description, 'We create beautiful, memorable and perfect events that stay with you forever.'),
    height: stringValue(heroSection.hero_height, 'medium'),
    overlayEnabled: boolValue(heroSection.overlay_enabled, true),
    overlayColor: stringValue(heroSection.overlay_color, '#050505'),
    overlayOpacity: Number(heroSection.overlay_opacity ?? 62),
    contentAlignment: stringValue(heroSection.content_alignment, 'left'),
    buttonLayout: stringValue(heroSection.button_layout, 'left'),
    button1,
    button2,
  };
}

// ── Sliders ──────────────────────────────────────────────────────────────────

export function buildSliderMeta(sliders: AnyRecord[]): SliderMeta | null {
  if (!sliders?.length) return null;
  const slider = sliders[0];
  const config = parseRecord(slider.config_json);
  return {
    type: slider.slider_type === 'advanced' ? 'advanced' : 'simple',
    height: stringValue(slider.slider_height, 'medium'),
    autoplay: boolValue(slider.autoplay, true),
    autoplaySpeed: Number(slider.autoplay_speed ?? 5000),
    globalTitleColor: stringValue(config.title_color, '#FFFFFF'),
    globalDescriptionColor: stringValue(config.description_color, '#E6E6E6'),
    globalOverlayOpacity: Number(config.overlay_opacity ?? 55),
    globalBrightness: Number(config.brightness ?? 100),
    globalBlur: Number(config.blur ?? 0),
  };
}

export function buildSlides(sliderItems: AnyRecord[], meta: SliderMeta | null): SlideItem[] {
  return (sliderItems || [])
    .filter((item) => boolValue(item.is_active, true) && item.status !== 'draft')
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .map((item) => ({
      id: Number(item.id),
      title: stringValue(item.title, 'Unforgettable Events'),
      description: stringValue(item.description, ''),
      imageUrl: stringValue(item.image_url),
      buttonLabel: stringValue(item.button_label, ''),
      buttonColor: stringValue(item.button_color, '#7C3AED'),
      buttonTextColor: stringValue(item.button_text_color, '#FFFFFF'),
      buttonLink: normalizeHref(item.button_url || '#'),
      titleColor: stringValue(item.title_color, meta?.globalTitleColor, '#FFFFFF'),
      descriptionColor: stringValue(item.description_color, meta?.globalDescriptionColor, '#E6E6E6'),
      overlayOpacity: Number(item.overlay_opacity ?? meta?.globalOverlayOpacity ?? 55),
      brightness: Number(item.brightness ?? meta?.globalBrightness ?? 100),
      blur: Number(item.blur ?? meta?.globalBlur ?? 0),
    }));
}

// ── Gallery ──────────────────────────────────────────────────────────────────

export function buildGalleryCategories(categories: AnyRecord[]): GalleryCategory[] {
  return (categories || [])
    .filter((item) => boolValue(item.is_active, true))
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .map((item) => ({
      id: Number(item.id),
      name: stringValue(item.name, 'Category'),
      slug: stringValue(item.slug, String(item.id)),
      sortOrder: Number(item.sort_order || 0),
    }));
}

export function buildGalleryItems(items: AnyRecord[]): GalleryItem[] {
  return (items || [])
    .filter((item) => boolValue(item.is_active, true))
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .map((item) => ({
      id: Number(item.id),
      categoryId: item.category_id !== undefined && item.category_id !== null ? Number(item.category_id) : null,
      eventName: stringValue(item.event_name, 'Event'),
      eventType: stringValue(item.event_type),
      imageUrl: stringValue(item.image_url),
      altText: stringValue(item.alt_text, item.event_name, 'Gallery image'),
      sortOrder: Number(item.sort_order || 0),
    }));
}

// ── Testimonials ─────────────────────────────────────────────────────────────

export function buildTestimonials(testimonials: AnyRecord[]): Testimonial[] {
  return (testimonials || [])
    .filter((item) => boolValue(item.is_active, true))
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .map((item) => ({
      id: Number(item.id),
      name: stringValue(item.customer_name, 'Customer'),
      event: stringValue(item.event_name),
      feedback: stripHtml(stringValue(item.feedback)),
      photoUrl: stringValue(item.photo_url),
      rating: Math.max(0, Math.min(5, Math.round(Number(item.rating ?? 5)))),
      showRating: boolValue(item.show_rating, true),
    }));
}

// ── Logos (Clients / Sponsors) ────────────────────────────────────────────────

export function buildLogos(list: AnyRecord[]): Logo[] {
  return (list || [])
    .filter((item) => boolValue(item.is_active, true))
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .map((item) => ({
      id: String(item.id),
      name: stringValue(item.name, ''),
      photoUrl: stringValue(item.logo_url),
      href: normalizeHref(item.website_url),
    }))
    .filter((item) => Boolean(item.photoUrl) || Boolean(item.name));
}

// ── Footer ───────────────────────────────────────────────────────────────────

export function buildFooter(footerSettings: AnyRecord, pages: AnyRecord[]) {
  const rawLinks = Array.isArray(footerSettings.add_pages_json)
    ? footerSettings.add_pages_json
    : Array.isArray(footerSettings.quick_links_json)
      ? footerSettings.quick_links_json
      : [];
  const norm = (v: unknown) => String(v ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const quickLinks = (rawLinks as unknown[])
    .map((value) => {
      const raw = String(value ?? '').trim();
      if (!raw) return null;
      const target = norm(raw);
      const page = pages.find((item) => String(item.slug ?? '').replace(/^\/+/, '') === raw.replace(/^\/+/, '') || String(item.id ?? '') === raw) ||
        pages.find((item) => {
          const slug = norm(item.slug);
          const title = norm(item.title);
          return !!target && ((!!slug && (slug.includes(target) || target.includes(slug))) || (!!title && title.includes(target)));
        });
      if (!page) return null;
      return { label: stringValue(page.title, raw), href: normalizeHref(page.slug) };
    })
    .filter(Boolean) as Array<{ label: string; href: string }>;

  return {
    present: Object.keys(footerSettings).length > 0,
    logoUrl: stringValue(footerSettings.logo_url),
    companyName: stringValue(footerSettings.company_name, 'Company'),
    description: stringValue(footerSettings.description),
    topListHeading: stringValue(footerSettings.top_list_heading, 'Quick Links'),
    quickLinks,
    showNewsletter: boolValue(footerSettings.show_newsletter, true),
    showSocialLinks: boolValue(footerSettings.show_social_links, true),
    mobile: stringValue(footerSettings.mobile),
    email: stringValue(footerSettings.email).toLowerCase(),
    address: stringValue(footerSettings.address),
    copyright: stringValue(footerSettings.copyright_text, `${new Date().getFullYear()} All rights reserved.`),
    poweredBy: stringValue(footerSettings.powered_by_text),
  };
}

// ── Contact ──────────────────────────────────────────────────────────────────

export function buildContact(contactSettings: AnyRecord, contactCategories: AnyRecord[], socialLinks: SocialLink[]) {
  if (!contactSettings || Object.keys(contactSettings).length === 0) return null;
  return {
    email: stringValue(contactSettings.email).toLowerCase(),
    mobile: stringValue(contactSettings.mobile),
    address: stringValue(contactSettings.address),
    mapEnabled: boolValue(contactSettings.google_map_enabled, false),
    latitude: stringValue(contactSettings.latitude),
    longitude: stringValue(contactSettings.longitude),
    socialLinksEnabled: boolValue(contactSettings.social_links_enabled, true),
    contactFormEnabled: boolValue(contactSettings.contact_form_enabled, true),
    categories: (contactCategories || [])
      .filter((item) => boolValue(item.is_active, true))
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
      .map((item) => ({ id: Number(item.id), name: stringValue(item.name) }))
      .filter((item) => Boolean(item.name)),
    socialLinks,
  };
}

// ── Pages ────────────────────────────────────────────────────────────────────

export function buildLegalPages(pages: AnyRecord[]): LegalPage[] {
  return (pages || [])
    .filter((item) => boolValue(item.is_active, true) && stringValue(item.status, 'published') !== 'draft' && stripHtml(stringValue(item.content)).length > 0)
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .map((item) => ({
      id: Number(item.id),
      title: stringValue(item.title, 'Page'),
      slug: stringValue(item.slug),
      content: stringValue(item.content),
    }));
}

// ── Heights ──────────────────────────────────────────────────────────────────

export function getHeroMinHeight(height: string) {
  const vh = 'calc(100dvh - 106px)';
  if (height === 'small') return '420px';
  if (height === 'large') return `max(760px, ${vh})`;
  if (height === 'fullscreen') return vh;
  return `max(600px, ${vh})`;
}

export function getSliderMinHeight(height: string) {
  if (height === 'small') return '400px';
  if (height === 'large') return '700px';
  if (height === 'medium-500') return '500px';
  if (height === 'fullscreen') return '100vh';
  return '600px';
}

// ── Derived types ─────────────────────────────────────────────────────────────
export type ThemeColors = ReturnType<typeof parseThemeColors>;
export type HeaderSettings = ReturnType<typeof parseHeaderSettings>;
export type HeroData = ReturnType<typeof buildHero>;
export type FooterData = ReturnType<typeof buildFooter>;
export type ContactData = NonNullable<ReturnType<typeof buildContact>>;
