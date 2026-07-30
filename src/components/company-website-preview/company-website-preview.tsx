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
import { VideoTutorialsSection } from './sections/video-tutorials-section';
import { TemplatesSection } from './sections/templates-section';

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
  const features = (featuresRaw as AnyRecord[]).map((f) => ({
    id: Number(f.id),
    title: String(f.title || ''),
    description: String(f.short_description || f.description || ''),
    iconKey: String(f.icon || f.icon_key || ''),
  }));

  // How it works mapping
  const howItWorksSteps = (howItWorksRaw as AnyRecord[]).map((s) => ({
    id: Number(s.id),
    stepNumber: Number(s.step_number || s.sort_order || 1),
    title: String(s.title || ''),
    description: String(s.description || ''),
    iconKey: String(s.icon || s.icon_key || ''),
  }));

  // Pricing mapping
  const pricingPlans = (pricingPlansRaw as AnyRecord[]).map((p) => {
    let bullets: string[] = [];
    const raw = p.features_json || p.bullet_points_json;
    if (raw) {
      try {
        bullets = typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch {
        bullets = [];
      }
    }
    return {
      id: Number(p.id),
      name: String(p.plan_name || p.name || ''),
      price: Number(p.price_monthly || p.price || 0),
      billingPeriod: String(p.period_label || p.billing_period || 'per event'),
      description: String(p.subtitle || p.description || ''),
      isFeatured: Boolean(p.is_popular || p.is_featured),
      bulletPoints: Array.isArray(bullets) ? bullets : [],
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

  // ── UI Block-ordered home sections ─────────────────────────────────────────
  const sliderNode = sliderMeta && slides.length > 0 ? <SliderSection slides={slides} meta={sliderMeta} theme={theme} /> : null;

  const homeSectionByKey: Record<string, React.ReactNode> = {
    'hero-section': <HeroSection hero={hero} theme={theme} />,
    'advance-slider': sliderNode,
    'basic-slider': sliderNode,
    features: <FeaturesSection features={features} theme={theme} />,
    'how-it-works': <HowItWorksSection steps={howItWorksSteps} theme={theme} />,
    'gallery-images': <GallerySection categories={galleryCategories} items={galleryItems} theme={theme} />,
    'gallery-categories': null,
    testimonials: <TestimonialsSection testimonials={testimonials} theme={theme} />,
    'basic-clients': <LogoWallSection title="Our Clients" members={clients} theme={theme} kind="clients" />,
    'basic-sponsors': <LogoWallSection title="Our Sponsors" members={sponsors} theme={theme} kind="sponsors" muted />,
    'pricing-plans': <PricingSection plans={pricingPlans} theme={theme} />,
    templates: <TemplatesSection templates={templates} theme={theme} />,
    faqs: <FaqsSection faqs={faqs} theme={theme} />,
    'video-tutorials': <VideoTutorialsSection videos={videoTutorials} theme={theme} />,
    contact_us: contact ? <ContactSection contact={contact} theme={theme} /> : null,
  };

  const defaultHomeOrder = [
    'hero-section',
    'advance-slider',
    'features',
    'how-it-works',
    'gallery-images',
    'testimonials',
    'basic-clients',
    'basic-sponsors',
    'pricing-plans',
    'templates',
    'faqs',
    'video-tutorials',
    'contact_us',
  ];

  const orderedHomeKeys = (() => {
    const blocks = (uiBlocksRaw as AnyRecord[]);
    const saved = blocks
      .filter((b) => Boolean(b.is_visible !== undefined ? b.is_visible : true))
      .slice()
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
      .map((b) => String(b.block_key || ''))
      .filter((key) => key in homeSectionByKey && homeSectionByKey[key] !== null);

    if (!saved.length) return defaultHomeOrder;

    const topKeys = ['hero-section', 'advance-slider', 'basic-slider'].filter((k) => saved.includes(k));
    const restKeys = saved.filter((k) => !topKeys.includes(k));
    const finalOrder = [...topKeys, ...restKeys];

    const seen = new Set(finalOrder);
    return [...finalOrder, ...defaultHomeOrder.filter((key) => !seen.has(key))];
  })();

  const homeSections: React.ReactNode[] = [];
  let sliderShown = false;
  for (const key of orderedHomeKeys) {
    const node = homeSectionByKey[key];
    if (!node) continue;
    if (key === 'advance-slider' || key === 'basic-slider') {
      if (sliderShown) continue;
      sliderShown = true;
    }
    homeSections.push(<React.Fragment key={key}>{node}</React.Fragment>);
  }

  const activePage = findPageForViewKey(activeKey, legalPages);
  let mainContent: React.ReactNode;
  if (activeKey === 'gallery') {
    mainContent = <GallerySection categories={galleryCategories} items={galleryItems} theme={theme} />;
  } else if (activeKey === 'contact' && contact) {
    mainContent = <ContactSection contact={contact} theme={theme} />;
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
    mainContent = <>{homeSections}</>;
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
        '--preview-card-radius': '12px',
        color: theme.primaryText,
        fontFamily: 'Inter, "Inter Fallback", ui-sans-serif, system-ui, -apple-system, sans-serif',
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
