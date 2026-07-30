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
import { HeroSection } from './sections/hero-section';
import { SliderSection } from './sections/slider-section';
import { GallerySection } from './sections/gallery-section';
import { TestimonialsSection } from './sections/testimonials-section';
import { LogoWallSection } from './sections/logo-wall-section';
import { ContactSection } from './sections/contact-section';
import { FooterSection } from './sections/footer-section';
import { FeaturesSection } from './sections/features-section';
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
} from './sections/login-demo-section';

export function CompanyWebsitePreview() {
  const queryClient = useQueryClient();

  // ── Data Hooks ──────────────────────────────────────────────────────────────
  const { data: basicInfoRaw = {} as AnyRecord, isLoading: l1 } = useCompanyBasicInformation();
  const { data: heroRaw = {} as AnyRecord, isLoading: l2 } = useCompanyHeroSection();
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

  // ── SPA Navigation ──────────────────────────────────────────────────────────
  const [activeKey, setActiveKey] = React.useState('home');
  const handleNavigate = React.useCallback((href: string) => {
    setActiveKey(viewKeyFromHref(href));
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ── Font Family Hook ───────────────────────────────────────────────────────
  const fontFamily = String((themeRaw as AnyRecord)?.font_family || (themeRaw as AnyRecord)?.font || (basicInfoRaw as AnyRecord)?.font_family || 'Inter');

  React.useEffect(() => {
    if (typeof document === 'undefined' || !fontFamily) return;
    const fontName = fontFamily.trim();
    if (['Inter', 'Arial', 'sans-serif'].includes(fontName)) return;
    const fontSlug = fontName.replace(/\s+/g, '+');
    const href = `https://fonts.googleapis.com/css2?family=${fontSlug}:wght@300;400;500;600;700;800;900&display=swap`;
    let link = document.querySelector(`link[data-preview-font="${fontSlug}"]`) as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.setAttribute('data-preview-font', fontSlug);
      link.href = href;
      document.head.appendChild(link);
    }
  }, [fontFamily]);

  // ── Refresh ──────────────────────────────────────────────────────────────────
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['company-website-builder'] });
  };

  // ── Build derived data ──────────────────────────────────────────────────────
  const basicInfo = basicInfoRaw as AnyRecord;
  const theme = parseThemeColors(themeRaw as AnyRecord);
  const header = parseHeaderSettings(basicInfo);
  const phone = buildPhone(header);
  const socialLinks = buildSocialLinks(socialLinksRaw as AnyRecord[]);
  const navItems = buildNavItems(menuItemsRaw as AnyRecord[], pagesRaw as AnyRecord[]);
  const hero = buildHero(heroRaw as AnyRecord, theme);
  const sliderMeta = buildSliderMeta(slidersRaw as AnyRecord[]);
  const slides = buildSlides(sliderItemsRaw as AnyRecord[], sliderMeta);
  const galleryCategories = buildGalleryCategories(galleryCatsRaw as AnyRecord[]);
  const galleryItems = buildGalleryItems(galleryItemsRaw as AnyRecord[]);
  const testimonials = buildTestimonials(testimonialsRaw as AnyRecord[]);
  const clients = buildLogos(clientsRaw as AnyRecord[]);
  const sponsors = buildLogos(sponsorsRaw as AnyRecord[]);
  const footer = buildFooter(footerRaw as AnyRecord, pagesRaw as AnyRecord[]);
  const contact = buildContact(contactRaw as AnyRecord, contactCatsRaw as AnyRecord[], socialLinks);
  const legalPages = buildLegalPages(pagesRaw as AnyRecord[]);
  const companyName = String(basicInfo.company_name || 'Company');
  const companyLogo = String(basicInfo.logo_url || '');
  const email = String(basicInfo.email || '').toLowerCase();

  // Features mapping
  const features = (featuresRaw as AnyRecord[]).map((f) => {
  let bulletPoints: string[] = [];
  if (f.bullet_points_json) {
    try {
      bulletPoints = typeof f.bullet_points_json === 'string' ? JSON.parse(f.bullet_points_json) : f.bullet_points_json;
    } catch {
      bulletPoints = [];
    }
  }
 
  return {
    id: Number(f.id),
    title: String(f.title || ''),
    description: String(f.short_description || f.description || ''),
    iconKey: String(f.icon || f.icon_key || ''),
    customIconUrl: f.custom_icon_url ? String(f.custom_icon_url) : undefined,
    bulletPoints,
    // no cta_label column yet — leave undefined so the component's "View Feature" default applies
  };
});

  // How it works mapping
  const howItWorksSteps = (howItWorksRaw as AnyRecord[]).map((s) => ({
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
  // Replace the existing "Pricing mapping" block in company-website-preview.tsx with this.
const pricingPlans = (pricingPlansRaw as AnyRecord[]).map((p) => {
  let bulletPoints: string[] = [];
  if (p.features_json) {
    try {
      bulletPoints = typeof p.features_json === 'string' ? JSON.parse(p.features_json) : p.features_json;
    } catch {
      bulletPoints = [];
    }
  }

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
    bulletPoints: Array.isArray(bulletPoints) ? bulletPoints : [],
  };
});

  // FAQs mapping
  const faqs = (faqsRaw as AnyRecord[]).map((fq) => ({
    id: Number(fq.id),
    question: String(fq.question || ''),
    answer: String(fq.answer || ''),
  }));

  // Video Tutorials mapping
  const videoTutorials = (videoTutorialsRaw as AnyRecord[]).map((v) => {
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

  // Templates mapping
  const templates = (templatesRaw as AnyRecord[]).map((t) => ({
  id: Number(t.id),
  title: String(t.template_name || t.name || t.title || ''),
  categoryName: String(t.category_name || t.category || ''),
  templateType: String(t.template_type || 'Invitation'),
  primaryColor: String(t.primary_color || '#4F46E5'),
  thumbnailUrl: String(t.thumbnail_url || ''),
  isPopular: Boolean(t.is_popular),
}));

  // ── Render Page Sections ──────────────────────────────────────────────────
  const heroNode = <HeroSection hero={hero} theme={theme} />;

  const pageContents: Record<string, React.ReactNode> = {
    home: (
      <>
        {heroNode}
        <HighlightsSection pageSlug="home" instance={1} theme={theme} variant="outline" />
        <TemplatesSection templates={templates} theme={theme} />
        <HighlightsSection pageSlug="home" instance={2} theme={theme} variant="filled" />
        <TestimonialsSection testimonials={testimonials} theme={theme} />
        <LoginDemoSection theme={theme} companyName={companyName} />
      </>
    ),
    features: (
      <>
        {heroNode}
        <FeaturesSection features={features} theme={theme} />
        <SignInDemoSection theme={theme} />
        <HighlightsSection pageSlug="features" instance={1} theme={theme} variant="filled" />
        <SignInDemoSection theme={theme} />
      </>
    ),
    template: (
      <>
        {heroNode}
        <TemplatesSection templates={templates} theme={theme} />
        <SignInDemoSection theme={theme} />
        <HighlightsSection pageSlug="template" instance={1} theme={theme} variant="filled" />
      </>
    ),
    templates: (
      <>
        {heroNode}
        <TemplatesSection templates={templates} theme={theme} />
        <SignInDemoSection theme={theme} />
        <HighlightsSection pageSlug="template" instance={1} theme={theme} variant="filled" />
      </>
    ),
    pricing: (
      <>
        {heroNode}
        <PricingSection plans={pricingPlans} theme={theme} />
        <HighlightsSection pageSlug="pricing" instance={1} theme={theme} variant="filled" />
        <ContactSignupDemoSection theme={theme} />
      </>
    ),
    'pricing-plans': (
      <>
        {heroNode}
        <PricingSection plans={pricingPlans} theme={theme} />
        <HighlightsSection pageSlug="pricing" instance={1} theme={theme} variant="filled" />
        <ContactSignupDemoSection theme={theme} />
      </>
    ),
    'how-it-works': (
      <>
        {heroNode}
        <HowItWorksSection steps={howItWorksSteps} theme={theme} />
        <HighlightsSection pageSlug="how-it-works" instance={1} theme={theme} variant="filled" />
        <SignupDemoSection theme={theme} />
      </>
    ),
    contact: (
      <>
        {heroNode}
        <HighlightsSection pageSlug="contact" instance={1} theme={theme} variant="filled" />
        {contact ? <ContactSection contact={contact} theme={theme} /> : null}
        <FaqsSection faqs={faqs} theme={theme} />
        <ChatSignupDemoSection theme={theme} />
      </>
    ),
    'contact-us': (
      <>
        {heroNode}
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
      className="min-h-screen w-full overflow-x-hidden bg-white text-slate-950"
      style={{
        '--preview-primary-text': theme.primaryText,
        '--preview-secondary-text': theme.secondaryText,
        '--preview-primary-button': theme.primaryButton,
        '--preview-card-radius': '0px',
        color: theme.primaryText,
        fontFamily: `'${fontFamily}', Inter, "Inter Fallback", ui-sans-serif, system-ui, sans-serif`,
      } as React.CSSProperties}
    >
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
