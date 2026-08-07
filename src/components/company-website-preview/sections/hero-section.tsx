'use client';

import * as React from 'react';
import type { HeroButton, HeroData, ThemeColors } from './preview-shared';
import { getHeroMinHeight, isExternalHref } from './preview-shared';

function HeroButtonLink({ button, onNavigate }: { button: HeroButton; onNavigate?: (href: string) => void }) {
  if (!button.enabled) return null;
  const isOutline = button.style === 'Outline';
  const isGhost = button.style === 'Ghost';

  const handleClick = (e: React.MouseEvent) => {
    if (isExternalHref(button.link)) return;
    e.preventDefault();
    onNavigate?.(button.link);
  };

  return (
    <a
      href={button.link}
      onClick={handleClick}
      className="inline-flex h-11 items-center justify-center rounded px-5 text-[13px] font-bold shadow-sm transition hover:-translate-y-0.5"
      style={
        isOutline
          ? { border: `1.5px solid ${button.color}`, color: button.color, backgroundColor: 'transparent' }
          : isGhost
            ? { color: button.color, backgroundColor: 'transparent' }
            : { backgroundColor: button.color, color: '#FFFFFF' }
      }
    >
      {button.label}
    </a>
  );
}

function HeroSectionBase({ hero, theme, onNavigate }: { hero: HeroData; theme: ThemeColors; onNavigate?: (href: string) => void }) {
  const contentAlign = hero.contentAlignment === 'center' ? 'center' : hero.contentAlignment === 'right' ? 'right' : 'left';
  const justifyContent = hero.buttonLayout === 'center' ? 'center' : hero.buttonLayout === 'right' ? 'flex-end' : 'flex-start';

  return (
    <section id="home" className="relative isolate flex overflow-hidden" style={{ minHeight: getHeroMinHeight(hero.height) }}>
      {hero.imageUrl ? (
        <img src={hero.imageUrl} alt="Hero" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(135deg,#170b13,#3a1830_45%,#130d0c)]" />
      )}
      {hero.overlayEnabled ? (
        <div className="absolute inset-0 -z-10" style={{ backgroundColor: hero.overlayColor, opacity: Math.max(0, Math.min(100, hero.overlayOpacity)) / 100 }} />
      ) : null}
      <div className="mx-auto flex w-full max-w-[1280px] items-center px-4 py-16 sm:px-6 lg:px-8" style={{ justifyContent: contentAlign === 'center' ? 'center' : contentAlign === 'right' ? 'flex-end' : 'flex-start', textAlign: contentAlign as any }}>
        <div className="max-w-[620px]" style={{ marginLeft: contentAlign === 'center' ? 'auto' : undefined, marginRight: contentAlign === 'center' ? 'auto' : undefined }}>
          {hero.badgeText ? (
            <span className="mb-5 inline-flex rounded px-3 py-1 text-[12px] font-bold text-white" style={{ backgroundColor: theme.primaryButton }}>
              {hero.badgeText}
            </span>
          ) : null}
          <h1 className="max-w-[720px] text-[34px] font-black leading-[1.1] tracking-tight text-white sm:text-[48px] lg:text-[56px]">
            {hero.title}
          </h1>
          <p className="mt-5 max-w-[500px] text-[15px] font-medium leading-7 text-white/90 sm:text-[16px]" style={{ marginLeft: contentAlign === 'center' ? 'auto' : undefined, marginRight: contentAlign === 'center' ? 'auto' : undefined }}>
            {hero.description}
          </p>
          <div className="mt-7 flex flex-wrap gap-3" style={{ justifyContent, flexDirection: hero.buttonLayout === 'stack' ? 'column' : 'row' }}>
            <HeroButtonLink button={hero.button1} onNavigate={onNavigate} />
            <HeroButtonLink button={hero.button2} onNavigate={onNavigate} />
          </div>
        </div>
      </div>
    </section>
  );
}

import { useCompanyHeroSection } from '@/hooks/useCompanyWebsiteBuilder';
import { buildHero, type AnyRecord } from './preview-shared';
import { useWebsiteLanguage } from '../website-language-provider';

export function PageHeroSection({ pageSlug = 'home', theme, onNavigate }: { pageSlug?: string; theme: ThemeColors; onNavigate?: (href: string) => void }) {
  const { data: heroRaw } = useCompanyHeroSection(pageSlug);
  const { translator } = useWebsiteLanguage();
  // This section fetches its own data, so the overlay is applied here rather
  // than at the preview root. Hero registers one translation slot per page,
  // keyed by (page_slug, hero row id) — passing pageSlug is what makes the
  // right page's translation resolve.
  const hero = buildHero(translator.one('hero-section', (heroRaw || {}) as AnyRecord, pageSlug), theme);
  return <HeroSectionBase hero={hero} theme={theme} onNavigate={onNavigate} />;
}

export const HeroSection = React.memo(HeroSectionBase);
