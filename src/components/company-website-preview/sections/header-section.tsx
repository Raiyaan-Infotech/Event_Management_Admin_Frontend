'use client';

import * as React from 'react';
import { Icon, loadIcons } from '@iconify/react';
import { ChevronDown, Globe, Mail, Menu, Phone, UserRound, X } from 'lucide-react';
import type { HeaderSettings, NavItem, SocialLink, ThemeColors } from './preview-shared';
import { isExternalHref, viewKeyFromHref } from './preview-shared';

type Props = {
  theme: ThemeColors;
  header: HeaderSettings;
  navItems: NavItem[];
  socialLinks: SocialLink[];
  companyName: string;
  companyLogo: string;
  phone: string;
  email: string;
  activeKey: string;
  onNavigate: (href: string) => void;
};

import { useWebsiteLanguage } from '../website-language-provider';

function HeaderSectionBase({ theme, header, navItems, socialLinks, companyName, companyLogo, phone, email, activeKey, onNavigate }: Props) {
  // Site language, not the admin panel's — see website-language-provider.
  const { t, language, setLanguage, languages } = useWebsiteLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [langMenuOpen, setLangMenuOpen] = React.useState(false);
  const langMenuRef = React.useRef<HTMLDivElement>(null);

  const activeLanguage = languages.find((lang) => lang.code === language) || languages[0] || null;

  React.useEffect(() => {
    if (!langMenuOpen) return;
    const close = (event: MouseEvent) => {
      if (!langMenuRef.current?.contains(event.target as Node)) setLangMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [langMenuOpen]);

  const [, setIconsLoaded] = React.useState(false);

  // Explicitly preload social icons from Iconify API (https://api.iconify.design)
  React.useEffect(() => {
    if (!socialLinks || !socialLinks.length) return;
    const keys = socialLinks.map((link: any) => {
      const rawIcon = String(link?.iconName || link?.icon_name || link?.icon || link?.icon_key || 'simple-icons:linktree').trim().toLowerCase();
      return rawIcon.includes(':') ? rawIcon : `simple-icons:${rawIcon}`;
    });

    loadIcons(keys, () => {
      setIconsLoaded(true);
    });
  }, [socialLinks]);

  const handleNavClick = (event: React.MouseEvent, item: { href?: string }) => {
    if (isExternalHref(item.href)) return;
    event.preventDefault();
    setMobileMenuOpen(false);
    onNavigate(String(item.href || '/'));
  };

  return (
    <header className="w-full sticky top-0 z-50">
      {/* Top bar */}
      <div className="border-b border-white/10 text-white" style={{ backgroundColor: theme.primaryButton }}>
        <div className="mx-auto flex min-h-8 w-full max-w-[1280px] items-center justify-between gap-3 px-4 text-[11px] font-medium sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3 overflow-hidden text-white/90">
            {phone ? (
              <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
                <Phone className="h-3 w-3" /> {phone}
              </span>
            ) : null}
            {phone && email ? <span className="h-4 w-px bg-white/35" /> : null}
            {email ? (
              <span className="hidden min-w-0 items-center gap-1.5 truncate sm:flex">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate">{email}</span>
              </span>
            ) : null}
          </div>
          {header.showSocialIcons && socialLinks.length ? (
            <div className="flex shrink-0 items-center gap-3">
              {socialLinks.map((link: any) => {
                const rawIcon = String(link?.iconName || link?.icon_name || link?.icon || link?.icon_key || 'simple-icons:linktree').trim().toLowerCase();
                const iconKey = rawIcon.includes(':') ? rawIcon : `simple-icons:${rawIcon}`;
                const href = String(link?.href || link?.url || '#');
                const label = String(link?.label || 'Social');
                const color = String(link?.color || link?.icon_color || '#FFFFFF');
                return (
                  <a
                    key={`${label}-${href}`}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-5 w-5 items-center justify-center transition opacity-90 hover:opacity-100"
                    style={{ color }}
                  >
                    <Icon icon={iconKey} width="14" height="14" />
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {/* Main nav */}
      <div className="shadow-sm bg-white">
        <div className="mx-auto flex min-h-[74px] w-full max-w-[1280px] items-center justify-between gap-3 px-4 sm:px-6 lg:gap-4 lg:px-8">
          {/* Logo */}
          <a href="/" onClick={(e) => handleNavClick(e, { href: '/' })} className="flex min-w-0 shrink items-center gap-3">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={`${companyName} logo`}
                className="h-11 max-h-12 w-auto max-w-[170px] shrink-0 object-contain"
                onError={(e) => {
                  const imgEl = e.currentTarget;
                  imgEl.style.display = 'none';
                  const fallbackEl = imgEl.parentElement?.querySelector('[data-logo-fallback="true"]') as HTMLElement;
                  if (fallbackEl) fallbackEl.style.display = 'flex';
                }}
              />
            ) : null}
            <span
              data-logo-fallback="true"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[14px] font-black text-white"
              style={{ backgroundColor: theme.primaryButton, display: companyLogo ? 'none' : 'flex' }}
            >
              {companyName.split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase()}
            </span>
            {/* Hidden below xl: translated nav labels are far wider than their
                English source (Tamil runs ~2x), and the wordmark is the least
                costly thing to drop before links or the CTA start overflowing.
                The logo mark still identifies the brand. */}
            <span className="hidden min-w-0 xl:block">
              <span
                className="block truncate text-[14px] font-black uppercase leading-4 tracking-[0.12em]"
                style={{ color: theme.primaryButton }}
              >
                {companyName}
              </span>
            </span>
          </a>

          {/* Desktop nav */}
          {(() => {
            const VISIBLE_LIMIT = 7;
            const visibleItems = navItems.length > VISIBLE_LIMIT ? navItems.slice(0, VISIBLE_LIMIT - 1) : navItems;
            const overflowItems = navItems.length > VISIBLE_LIMIT ? navItems.slice(VISIBLE_LIMIT - 1) : [];

            // `min-w-0 flex-1` lets the link row absorb the squeeze instead of
            // pushing the language picker and CTA past the right edge, which is
            // what happened once the labels were translated. Anything that still
            // doesn't fit scrolls inside this row, so every link stays reachable
            // in any language.
            return (
              <nav
                className="hidden min-w-0 flex-1 items-center justify-center gap-4 overflow-x-auto text-[12.5px] font-bold lg:flex xl:gap-6 xl:text-[13px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={{ color: theme.primaryButton }}
              >
                {visibleItems.map((item) => {
                  const isActive = viewKeyFromHref(item.href) === activeKey;
                  if (item.children.length) {
                    return (
                      <div key={item.id} className="group relative shrink-0">
                        <a href={item.href} onClick={(e) => handleNavClick(e, item)} className="flex items-center gap-1 py-7 whitespace-nowrap transition hover:opacity-70" style={{ color: isActive ? theme.primaryButton : undefined }}>
                          {item.label} <ChevronDown className="h-3.5 w-3.5 transition group-hover:rotate-180" />
                        </a>
                        <div className="invisible absolute left-0 top-full z-30 min-w-[200px] -translate-y-1 rounded-xl border border-slate-100 bg-white py-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                          {item.children.map((child) => (
                            <a key={child.label} href={child.href} onClick={(e) => handleNavClick(e, child)} className="block px-4 py-2 text-[12px] font-semibold text-slate-700 whitespace-nowrap transition hover:bg-slate-50" style={{ color: theme.primaryButton }}>
                              {child.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <a key={item.id} href={item.href} onClick={(e) => handleNavClick(e, item)} className="flex shrink-0 items-center gap-1 py-7 whitespace-nowrap transition hover:opacity-70" style={{ color: theme.primaryButton, fontWeight: isActive ? 900 : undefined }}>
                      <span className="relative whitespace-nowrap">
                        {item.label}
                        {isActive ? <span className="absolute -bottom-6 left-0 h-0.5 w-full rounded-full" style={{ backgroundColor: theme.primaryButton }} /> : null}
                      </span>
                    </a>
                  );
                })}

                {overflowItems.length > 0 && (
                  <div className="group relative shrink-0">
                    <button type="button" className="flex items-center gap-1 py-7 whitespace-nowrap transition hover:opacity-70" style={{ color: theme.primaryButton }}>
                      {t('header.more', 'More')} <ChevronDown className="h-3.5 w-3.5 transition group-hover:rotate-180" />
                    </button>
                    <div className="invisible absolute right-0 top-full z-30 min-w-[180px] -translate-y-1 rounded-xl border border-slate-100 bg-white py-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                      {overflowItems.map((item) => (
                        <a key={item.id} href={item.href} onClick={(e) => handleNavClick(e, item)} className="block px-4 py-2 text-[12px] font-semibold text-slate-700 whitespace-nowrap transition hover:bg-slate-50" style={{ color: theme.primaryButton }}>
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </nav>
            );
          })()}

          {/* Auth & Language buttons. Rendered only when at least one of the
              three is enabled, so both toggles off + a single language leaves
              no empty flex slot beside the nav. */}
          <div
            className={`${
              languages.length > 1 || header.showLogin || header.showSignIn ? 'hidden sm:flex' : 'hidden'
            } items-center gap-2 sm:gap-2.5 shrink-0`}
          >
            {/* Globe Language selector — options come from the Website Builder
                Languages module (active languages only), not a hardcoded list.
                Hidden entirely when the site has only one language. */}
            {languages.length > 1 && (
              <div className="relative hidden md:block" ref={langMenuRef}>
                <button
                  type="button"
                  onClick={() => setLangMenuOpen((open) => !open)}
                  aria-haspopup="listbox"
                  aria-expanded={langMenuOpen}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer transition active:scale-95"
                >
                  <Globe className="h-3.5 w-3.5 text-slate-500" />
                  <span>{activeLanguage?.native_name || activeLanguage?.name || 'English'}</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                {langMenuOpen && (
                  <div
                    role="listbox"
                    className="absolute right-0 z-50 mt-1.5 min-w-[10rem] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.id}
                        type="button"
                        role="option"
                        aria-selected={lang.code === language}
                        onClick={() => {
                          setLanguage(lang.code);
                          setLangMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left text-[12px] transition hover:bg-slate-50 ${
                          lang.code === language ? 'font-bold text-slate-900' : 'font-medium text-slate-600'
                        }`}
                      >
                        <span className="truncate">{lang.native_name || lang.name}</span>
                        {lang.code === language && <span className="text-[10px] text-slate-400">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Login button — Website Builder > Nav Menu > "Login" toggle
                (basic_information.show_login). */}
            {header.showLogin ? (
              <button
                type="button"
                className="h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 sm:px-4 text-[12.5px] font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95 whitespace-nowrap"
              >
                {t('header.login', 'Login')}
              </button>
            ) : null}

            {/* Get Started button — Website Builder > Nav Menu > "Get Started"
                toggle (basic_information.show_signin). */}
            {header.showSignIn ? (
              <button
                type="button"
                className="h-9 items-center justify-center rounded-lg px-3.5 sm:px-4 text-[12.5px] font-bold text-white shadow-xs transition hover:opacity-90 active:scale-95 whitespace-nowrap"
                style={{ backgroundColor: theme.primaryButton || '#ec4899' }}
              >
                {t('hero.get_started', 'Get Started')}
              </button>
            ) : null}
          </div>

          {/* Mobile hamburger */}
          <button type="button" onClick={() => setMobileMenuOpen((o) => !o)} className="flex h-10 w-10 items-center justify-center rounded border border-slate-200 bg-white shadow-sm lg:hidden" aria-label="Toggle menu">
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen ? (
          <nav className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
            <div className="mx-auto flex w-full flex-col gap-1">
              {navItems.map((item) => (
                <React.Fragment key={item.id}>
                  <a href={item.href} onClick={(e) => handleNavClick(e, item)} className="rounded px-3 py-2 text-[13px] font-bold hover:bg-slate-100" style={{ color: theme.primaryButton }}>
                    {item.label}
                  </a>
                  {item.children.map((child) => (
                    <a key={child.label} href={child.href} onClick={(e) => handleNavClick(e, child)} className="rounded px-3 py-2 pl-8 text-[12px] font-semibold hover:bg-slate-100" style={{ color: theme.primaryButton }}>
                      {child.label}
                    </a>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </nav>
        ) : null}
      </div>
    </header>
  );
}

export const HeaderSection = React.memo(HeaderSectionBase);
