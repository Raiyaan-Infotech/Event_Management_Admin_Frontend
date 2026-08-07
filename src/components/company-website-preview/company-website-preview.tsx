'use client';

import * as React from 'react';
import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCompanyBasicInformation,
  useCompanyHeroSection,
  useCompanyFooterSettings,
  useCompanyThemeSettings,
  useCompanyContactSettings,
  useCompanySocialLinks,
  useCompanyPages,
  useCompanyMenuItems,
  useCompanyUiBlocks,
  useCompanySliders,
  useCompanySliderItems,
  useCompanyGalleryCategories,
  useCompanyGalleryItems,
  useCompanyTestimonials,
  useCompanyClients,
  useCompanySponsors,
  useCompanyContactCategories,
  useCompanyFeatures,
  useCompanyHowItWorks,
  useCompanyPricingPlans,
  useCompanyFaqs,
  useCompanyVideoTutorials,
  useCompanyTemplates,
} from '@/hooks/useCompanyWebsiteBuilder';
import {
  parseThemeColors,
  parseHeaderSettings,
  buildPhone,
  buildSocialLinks,
  buildNavItems,
  buildHero,
  buildSliderMeta,
  buildSlides,
  buildGalleryCategories,
  buildGalleryItems,
  buildTestimonials,
  buildLogos,
  buildFooter,
  buildContact,
  buildLegalPages,
  findPageForViewKey,
  viewKeyFromHref,
  type AnyRecord,
} from './sections/preview-shared';
import { HeaderSection } from './sections/header-section';
import { HeroSection, PageHeroSection } from './sections/hero-section';
import { SliderSection } from './sections/slider-section';
import { GallerySection } from './sections/gallery-section';
import { TestimonialsSection } from './sections/testimonials-section';
import { LogoWallSection } from './sections/logo-wall-section';
import { ContactSection } from './sections/contact-section';
import { FooterSection } from './sections/footer-section';
import { FeaturesSection } from './sections/features-section';
import { TemplatesSection, TemplateGridGallerySection } from './sections/templates-section';
import { HowItWorksSection } from './sections/how-it-works-section';
import { PricingSection } from './sections/pricing-section';
import { FaqsSection } from './sections/faqs-section';
import { HighlightsSection } from './sections/highlights-section';
import {
  LoginDemoSection,
  SignInDemoSection,
  ContactSignupDemoSection,
  SignupDemoSection,
  ChatSignupDemoSection,
  DynamicLoginDemoSection,
} from './sections/login-demo-section';
import { WebsiteLanguageProvider, useWebsiteLanguage } from './website-language-provider';

function CompanyWebsitePreviewInner({ initialPage = 'home' }: { initialPage?: string }) {
  const queryClient = useQueryClient();

  // ── SPA Navigation ──────────────────────────────────────────────────────────
  const [activeKey, setActiveKey] = React.useState(() => viewKeyFromHref(initialPage));
  const handleNavigate = React.useCallback((href: string) => {
    setActiveKey(viewKeyFromHref(href));
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ── Data Hooks ──────────────────────────────────────────────────────────────
  const { data: basicInfoRaw = {} as AnyRecord, isLoading: l1 } = useCompanyBasicInformation();
  const { data: heroRaw = {} as AnyRecord, isLoading: l2 } = useCompanyHeroSection(activeKey);
  const { data: footerRaw = {} as AnyRecord, isLoading: l3 } = useCompanyFooterSettings();
  const { data: themeRaw = {} as AnyRecord, isLoading: l4 } = useCompanyThemeSettings();
  const { data: contactRaw = {} as AnyRecord, isLoading: l5 } = useCompanyContactSettings();
  const { data: socialLinksRaw = [], isLoading: l6 } = useCompanySocialLinks();
  const { data: pagesRaw = [], isLoading: l7 } = useCompanyPages();
  const { data: menuItemsRaw = [], isLoading: l8 } = useCompanyMenuItems();
  const { data: uiBlocksRaw = [], isLoading: l9 } = useCompanyUiBlocks();
  const { data: slidersRaw = [] } = useCompanySliders();
  const { data: sliderItemsRaw = [] } = useCompanySliderItems();
  const { data: galleryCatsRaw = [] } = useCompanyGalleryCategories();
  const { data: galleryItemsRaw = [] } = useCompanyGalleryItems();
  const { data: testimonialsRaw = [] } = useCompanyTestimonials();
  const { data: clientsRaw = [] } = useCompanyClients();
  const { data: sponsorsRaw = [] } = useCompanySponsors();
  const { data: contactCatsRaw = [] } = useCompanyContactCategories();
  const { data: featuresRaw = [] } = useCompanyFeatures();
  const { data: howItWorksRaw = [] } = useCompanyHowItWorks();
  const { data: pricingPlansRaw = [] } = useCompanyPricingPlans();
  const { data: faqsRaw = [] } = useCompanyFaqs();
  const { data: videoTutorialsRaw = [] } = useCompanyVideoTutorials();
  const { data: templatesRaw = [] } = useCompanyTemplates();

  const isLoading = l1 || l2 || l3 || l4 || l5 || l6 || l7 || l8 || l9;

  // ── Content translations ────────────────────────────────────────────────────
  // Admin-entered text is overlaid onto the raw records BEFORE the build*
  // helpers run, so every section component below stays language-agnostic.
  // On the default language `translator` is a pass-through and the records are
  // returned untouched. Section names must match FIELD_CATALOG in the backend's
  // websiteBuilderTranslation.service.js.
  const { translator, direction, isLoadingBundle } = useWebsiteLanguage();

  // ── Font Family Hook ───────────────────────────────────────────────────────
  const fontFamily = String((themeRaw as AnyRecord)?.font_family || (themeRaw as AnyRecord)?.font || (basicInfoRaw as AnyRecord)?.font_family || 'Inter');

  React.useEffect(() => {
    if (typeof document === 'undefined' || !fontFamily) return;
    const fontName = fontFamily.trim();
    const fontSlug = fontName.replace(/\s+/g, '+');
    const href = `https://fonts.googleapis.com/css2?family=${fontSlug}:wght@400;500;600;700&display=swap`;
    let link = document.querySelector(`link[data-preview-font="${fontSlug}"]`) as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.setAttribute('data-preview-font', fontSlug);
      link.href = href;
      document.head.appendChild(link);
    } else {
      link.href = href;
    }
  }, [fontFamily]);

  // ── Refresh ──────────────────────────────────────────────────────────────────
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['company-website-builder'] });
  };

  // ── Build derived data ──────────────────────────────────────────────────────
  const basicInfo = translator.one('basic-information', basicInfoRaw as AnyRecord);
  const theme = parseThemeColors(themeRaw as AnyRecord);
  const header = parseHeaderSettings(basicInfo);
  const phone = buildPhone(header);
  // Parse social_links_json safely (whether array or JSON string)
  let jsonLinks: AnyRecord[] = [];
  if (basicInfo.social_links_json) {
    try {
      jsonLinks = typeof basicInfo.social_links_json === 'string'
        ? JSON.parse(basicInfo.social_links_json)
        : (basicInfo.social_links_json as AnyRecord[]);
    } catch {
      jsonLinks = [];
    }
  }

  const tableLinks = (socialLinksRaw as AnyRecord[]) || [];
  const socialLinksSource: AnyRecord[] = jsonLinks.length > 0 ? jsonLinks : tableLinks;
  // Only the DB-backed table rows carry ids the scan registers; the
  // social_links_json fallback has none, so translation is a no-op there.
  const socialLinks = buildSocialLinks(translator.many('social-links', socialLinksSource));

  // Page titles feed the nav, the footer link lists and the legal pages, so
  // they're translated once here and reused.
  const pages = translator.many('pages', pagesRaw as AnyRecord[]);

  const navItems = buildNavItems(translator.many('nav-menu', menuItemsRaw as AnyRecord[]), pages);
  const hero = buildHero(translator.one('hero-section', heroRaw as AnyRecord, activeKey), theme);
  const sliderMeta = buildSliderMeta(slidersRaw as AnyRecord[]);
  const slides = buildSlides(translator.many('sliders', sliderItemsRaw as AnyRecord[]), sliderMeta);
  const galleryCategories = buildGalleryCategories(translator.many('gallery-categories', galleryCatsRaw as AnyRecord[]));
  const galleryItems = buildGalleryItems(translator.many('gallery', galleryItemsRaw as AnyRecord[]));
  const testimonials = buildTestimonials(translator.many('testimonials', testimonialsRaw as AnyRecord[]));
  const clients = buildLogos(translator.many('clients', clientsRaw as AnyRecord[]));
  const sponsors = buildLogos(translator.many('sponsors', sponsorsRaw as AnyRecord[]));
  const footer = buildFooter(translator.one('footer', footerRaw as AnyRecord), pages, basicInfo as AnyRecord);
  const contact = buildContact(contactRaw as AnyRecord, translator.many('contact-categories', contactCatsRaw as AnyRecord[]), socialLinks, basicInfo);
  const legalPages = buildLegalPages(pages);
  const companyName = String(basicInfo.company_name || 'Company');
  const companyLogo = String(
    basicInfo.logo_url || 
    basicInfo.company_logo || 
    basicInfo.logo || 
    (footerRaw as AnyRecord)?.logo_url || 
    (footerRaw as AnyRecord)?.company_logo || 
    (footerRaw as AnyRecord)?.logo || 
    ''
  );
  const email = String(basicInfo.email || '').toLowerCase();

function extractList(raw: unknown): AnyRecord[] {
  if (Array.isArray(raw)) return raw as AnyRecord[];
  if (raw && typeof raw === 'object' && Array.isArray((raw as any).data)) {
    return (raw as any).data as AnyRecord[];
  }
  return [];
}

  // Features mapping
  const features = translator.many('features', extractList(featuresRaw)).map((f) => {
    let bulletPoints: unknown[] = [];
    if (f.bullet_points_json) {
      try {
        bulletPoints = typeof f.bullet_points_json === 'string' ? JSON.parse(f.bullet_points_json) : (f.bullet_points_json as unknown[]);
      } catch {
        bulletPoints = [];
      }
    }

    const safeBullets = (Array.isArray(bulletPoints) ? bulletPoints : [])
      .map((b) => (typeof b === 'object' && b !== null ? String((b as any).label || (b as any).title || (b as any).name || '') : String(b ?? '')))
      .filter(Boolean);

    return {
      id: Number(f.id),
      title: String(f.title || ''),
      description: String(f.short_description || f.description || ''),
      iconKey: String(f.icon || f.icon_key || ''),
      customIconUrl: f.custom_icon_url ? String(f.custom_icon_url) : undefined,
      bulletPoints: safeBullets,
      isActive: f.is_active !== undefined && f.is_active !== null ? (Number(f.is_active) === 1 || Boolean(f.is_active)) : (f.status ? f.status === 'Active' : true),
    };
  });

  // How it works mapping
  const howItWorksSteps = translator.many('how-it-works', extractList(howItWorksRaw)).map((s) => ({
    id: Number(s.id),
    stepNumber: Number(s.step_number || s.sort_order || 1),
    title: String(s.title || ''),
    description: String(s.description || ''),
    iconKey: String(s.icon || s.icon_key || ''),
    imageUrl: s.illustration_url || s.image_url || s.photo_url || s.thumbnail_url ? String(s.illustration_url || s.image_url || s.photo_url || s.thumbnail_url) : undefined,
    badgeTitle: s.highlight_title || s.badge_title || s.badge_text ? String(s.highlight_title || s.badge_title || s.badge_text) : undefined,
    badgeSub: s.highlight_subtext || s.badge_sub || s.badge_subtitle ? String(s.highlight_subtext || s.badge_sub || s.badge_subtitle) : undefined,
  }));

  // Pricing mapping
  const pricingPlans = translator.many('pricing-plans', extractList(pricingPlansRaw)).map((p) => {
    let rawFeatures: unknown[] = [];
    if (p.features_json) {
      try {
        rawFeatures = typeof p.features_json === 'string' ? JSON.parse(p.features_json) : (p.features_json as unknown[]);
      } catch {
        rawFeatures = [];
      }
    }

    const bulletPoints = (Array.isArray(rawFeatures) ? rawFeatures : [])
      .map((item) => {
        if (typeof item === 'string') return { label: item, included: true };
        if (item && typeof item === 'object') {
          return {
            label: String((item as any).label || (item as any).name || (item as any).title || ''),
            included: (item as any).included !== undefined ? Boolean((item as any).included) : true,
          };
        }
        return null;
      })
      .filter((item): item is { label: string; included: boolean } => item !== null && item.label.length > 0);

    return {
      id: Number(p.id),
      planName: String(p.plan_name || ''),
      subtitle: String(p.subtitle || ''),
      targetType: p.target_type ? String(p.target_type) : undefined,
      currencySymbol: String(p.currency || '₹'),
      priceMonthly: Number(p.price_monthly || 0),
      priceYearly: Number(p.price_yearly || 0),
      periodLabel: String(p.period_label || 'per event'),
      badgeText: p.badge_text ? String(p.badge_text) : undefined,
      badgeStyle: p.badge_style ? String(p.badge_style) : undefined,
      isPopular: Boolean(p.is_popular),
      bulletPoints,
    };
  });

  // FAQs mapping
  const faqs = translator.many('faqs', extractList(faqsRaw)).map((fq) => ({
    id: Number(fq.id),
    question: String(fq.question || ''),
    answer: String(fq.answer || ''),
  }));

  // Video Tutorials mapping
  const videoTutorials = translator.many('video-tutorials', extractList(videoTutorialsRaw)).map((v) => {
    const durSec = Number(v.duration_seconds || 0);
    return {
      id: Number(v.id),
      title: String(v.title || ''),
      description: String(v.short_description || v.description || ''),
      videoUrl: String(v.video_url || '#'),
      thumbnailUrl: String(v.thumbnail_url || ''),
      duration: String(durSec ? `${Math.floor(durSec / 60)} min` : v.duration || ''),
    };
  });

  // Templates mapping (sorted by sort_order / id ASC)
  const templates = translator.many('templates', extractList(templatesRaw))
    .sort((a, b) => (Number(a.sort_order ?? a.id) - Number(b.sort_order ?? b.id)))
    .map((t) => ({
      id: Number(t.id),
      title: String(t.template_name || t.name || t.title || ''),
      categoryName: String(t.category_name || t.category || ''),
      templateType: String(t.template_type || 'Invitation'),
      primaryColor: String(t.primary_color || '#4F46E5'),
      thumbnailUrl: String(t.thumbnail_url || ''),
      isPopular: Boolean(t.is_popular),
      isActive: t.is_active !== undefined && t.is_active !== null ? (Number(t.is_active) === 1 || Boolean(t.is_active)) : (t.status ? t.status === 'Active' : true),
    }));

  // ── Render Page Sections ──────────────────────────────────────────────────
  const pageContents: Record<string, React.ReactNode> = {
    home: (
      <>
        <PageHeroSection pageSlug="home" theme={theme} onNavigate={handleNavigate} />
        <HighlightsSection pageSlug="home" instance={1} theme={theme} variant="outline" />
        <TemplatesSection templates={templates} theme={theme} />
        <HighlightsSection pageSlug="home" instance={2} theme={theme} variant="filled" />
        <TestimonialsSection testimonials={testimonials} theme={theme} />
        <DynamicLoginDemoSection pageSlug="home" theme={theme} companyName={companyName} />
      </>
    ),
    features: (
      <>
        <PageHeroSection pageSlug="features" theme={theme} onNavigate={handleNavigate} />
        <FeaturesSection features={features} theme={theme} />
        <DynamicLoginDemoSection pageSlug="features" theme={theme} companyName={companyName} />
        <HighlightsSection pageSlug="features" instance={1} theme={theme} variant="filled" />
        <SignInDemoSection theme={theme} companyName={companyName} />
      </>
    ),
    template: (
      <>
        <PageHeroSection pageSlug="template" theme={theme} onNavigate={handleNavigate} />
        <TemplateGridGallerySection templates={templates} theme={theme} />
        <DynamicLoginDemoSection pageSlug="template" theme={theme} companyName={companyName} />
        <HighlightsSection pageSlug="template" instance={1} theme={theme} variant="filled" />
      </>
    ),
    templates: (
      <>
        <PageHeroSection pageSlug="template" theme={theme} onNavigate={handleNavigate} />
        <TemplateGridGallerySection templates={templates} theme={theme} />
        <DynamicLoginDemoSection pageSlug="template" theme={theme} companyName={companyName} />
        <HighlightsSection pageSlug="template" instance={1} theme={theme} variant="filled" />
      </>
    ),
    pricing: (
      <>
        <PageHeroSection pageSlug="pricing" theme={theme} onNavigate={handleNavigate} />
        <PricingSection plans={pricingPlans} theme={theme} />
        <HighlightsSection pageSlug="pricing" instance={1} theme={theme} variant="filled" />
        <DynamicLoginDemoSection pageSlug="pricing" theme={theme} companyName={companyName} />
      </>
    ),
    'pricing-plans': (
      <>
        <PageHeroSection pageSlug="pricing" theme={theme} onNavigate={handleNavigate} />
        <PricingSection plans={pricingPlans} theme={theme} />
        <HighlightsSection pageSlug="pricing" instance={1} theme={theme} variant="filled" />
        <DynamicLoginDemoSection pageSlug="pricing" theme={theme} companyName={companyName} />
      </>
    ),
    'how-it-works': (
      <>
        <PageHeroSection pageSlug="how-it-works" theme={theme} onNavigate={handleNavigate} />
        <HowItWorksSection steps={howItWorksSteps} theme={theme} />
        <HighlightsSection pageSlug="how-it-works" instance={1} theme={theme} variant="filled" />
        <DynamicLoginDemoSection pageSlug="how-it-works" theme={theme} companyName={companyName} />
      </>
    ),
    contact: (
      <>
        <PageHeroSection pageSlug="contact" theme={theme} onNavigate={handleNavigate} />
        <HighlightsSection pageSlug="contact" instance={1} theme={theme} variant="filled" />
        {contact ? <ContactSection contact={contact} theme={theme} /> : null}
        <FaqsSection faqs={faqs} theme={theme} />
        <ChatSignupDemoSection theme={theme} />
      </>
    ),
    'contact-us': (
      <>
        <PageHeroSection pageSlug="contact" theme={theme} onNavigate={handleNavigate} />
        <HighlightsSection pageSlug="contact" instance={1} theme={theme} variant="filled" />
        {contact ? <ContactSection contact={contact} theme={theme} /> : null}
        <FaqsSection faqs={faqs} theme={theme} />
        <ChatSignupDemoSection theme={theme} />
      </>
    ),
  };

  const activePage = findPageForViewKey(activeKey, legalPages);
  let mainContent: React.ReactNode;

  if (activeKey in pageContents) {
    mainContent = pageContents[activeKey];
  } else if (activePage) {
    mainContent = (
      <section className="w-full bg-white py-16">
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <h1 className="text-[28px] font-black mb-6" style={{ color: theme.primaryText }}>{activePage.title}</h1>
          <div className="prose max-w-none text-[14px] leading-7 text-slate-700" dangerouslySetInnerHTML={{ __html: activePage.content }} />
        </div>
      </section>
    );
  } else {
    mainContent = pageContents.home;
  }

  // ── Loading Screen ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-100" style={{ borderTopColor: '#7C3AED' }} />
          <p className="text-[14px] font-medium text-slate-500">Loading website preview…</p>
        </div>
      </div>
    );
  }

  // ── Full Website Render ─────────────────────────────────────────────────────
  return (
    <div
      // Languages flagged rtl in the builder flip the whole rendered site.
      dir={direction}
      className="company-website-preview-root min-h-screen w-full overflow-x-hidden bg-white text-slate-950"
      style={{
        '--preview-primary-text': theme.primaryText,
        '--preview-secondary-text': theme.secondaryText,
        '--preview-primary-button': theme.primaryButton,
        '--preview-card-radius': '0px',
        color: theme.primaryText,
        fontFamily: `'${fontFamily}', Inter, "Inter Fallback", ui-sans-serif, system-ui, sans-serif`,
      } as React.CSSProperties}
    >
      <style>{`
        .company-website-preview-root,
        .company-website-preview-root *,
        .company-website-preview-root h1,
        .company-website-preview-root h2,
        .company-website-preview-root h3,
        .company-website-preview-root h4,
        .company-website-preview-root h5,
        .company-website-preview-root h6,
        .company-website-preview-root p,
        .company-website-preview-root span,
        .company-website-preview-root a,
        .company-website-preview-root button,
        .company-website-preview-root input,
        .company-website-preview-root textarea,
        .company-website-preview-root select {
          font-family: '${fontFamily}', Inter, "Inter Fallback", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
      `}</style>
      {/* Language-switch overlay. `isLoadingBundle` was already exposed by the
          language provider but nothing consumed it, so switching language
          rendered nothing while the translation bundle loaded — this fills
          that gap. Keeps the current (still-English) content visible
          underneath rather than blanking the page, since the switch is
          usually fast. */}
      {isLoadingBundle && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
          <div className="flex items-center gap-3 rounded-full bg-white px-5 py-3 shadow-xl ring-1 ring-slate-200">
            <div
              className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200"
              style={{ borderTopColor: theme.primaryButton }}
            />
            <span className="text-[13px] font-semibold text-slate-700">Switching language…</span>
          </div>
        </div>
      )}

      {/* Floating refresh button */}
      <button
        type="button"
        onClick={handleRefresh}
        title="Refresh preview data"
        className="fixed bottom-6 right-6 z-[200] flex h-11 w-11 items-center justify-center rounded-full text-white shadow-xl transition hover:opacity-90 hover:scale-105"
        style={{ backgroundColor: theme.primaryButton }}
      >
        <RefreshCw className="h-4 w-4" />
      </button>

      <HeaderSection
        theme={theme}
        header={header}
        navItems={navItems}
        socialLinks={socialLinks}
        companyName={companyName}
        companyLogo={companyLogo}
        phone={phone}
        email={email}
        activeKey={activeKey}
        onNavigate={handleNavigate}
      />

      <main>{mainContent}</main>

      {footer.present ? (
        <FooterSection
          footer={footer}
          socialLinks={socialLinks}
          theme={theme}
          onNavigate={handleNavigate}
        />
      ) : null}
    </div>
  );
}

// The provider must sit ABOVE the component that calls useWebsiteLanguage(),
// so the preview is wrapped rather than providing for itself.
export function CompanyWebsitePreview({ initialPage = 'home' }: { initialPage?: string }) {
  return (
    <WebsiteLanguageProvider>
      <CompanyWebsitePreviewInner initialPage={initialPage} />
    </WebsiteLanguageProvider>
  );
}
