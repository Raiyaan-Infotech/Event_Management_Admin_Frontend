'use client';

import * as React from 'react';
import { Icon } from '@iconify/react';
import { ChevronDown, Mail, Menu, Phone, UserRound, X } from 'lucide-react';
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

function HeaderSectionBase({ theme, header, navItems, socialLinks, companyName, companyLogo, phone, email, activeKey, onNavigate }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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
              {socialLinks.map((link) => {
                const iconKey = link.iconName.includes(':') ? link.iconName : `simple-icons:${link.iconName.toLowerCase()}`;
                return (
                  <a
                    key={`${link.label}-${link.href}`}
                    href={link.href}
                    aria-label={link.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-5 w-5 items-center justify-center text-white/85 transition hover:text-white"
                  >
                    <Icon icon={iconKey} width="14" height="14" className="h-3.5 w-3.5 fill-current" />
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {/* Main nav */}
      <div className="shadow-sm bg-white">
        <div className="mx-auto flex min-h-[74px] w-full max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <a href="/" onClick={(e) => handleNavClick(e, { href: '/' })} className="flex shrink-0 items-center gap-3">
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
            <span className="shrink-0">
              <span className="block text-[14px] font-black uppercase leading-4 tracking-[0.12em]" style={{ color: theme.primaryButton }}>
                {companyName}
              </span>
            </span>
          </a>

          {/* Desktop nav */}
          {(() => {
            const VISIBLE_LIMIT = 7;
            const visibleItems = navItems.length > VISIBLE_LIMIT ? navItems.slice(0, VISIBLE_LIMIT - 1) : navItems;
            const overflowItems = navItems.length > VISIBLE_LIMIT ? navItems.slice(VISIBLE_LIMIT - 1) : [];

            return (
              <nav className="hidden items-center gap-6 text-[13px] font-bold lg:flex" style={{ color: theme.primaryButton }}>
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
                      More <ChevronDown className="h-3.5 w-3.5 transition group-hover:rotate-180" />
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

          {/* Auth buttons */}
          <div className="hidden items-center gap-2 lg:flex">
            {header.showLogin ? (
              <button type="button" className="inline-flex h-10 items-center gap-2 rounded px-4 text-[12px] font-bold shadow-sm transition hover:-translate-y-0.5 border" style={{ color: theme.primaryButton, borderColor: theme.primaryButton, backgroundColor: '#FFFFFF' }}>
                <UserRound className="h-3.5 w-3.5" /> Login
              </button>
            ) : null}
            {header.showSignIn ? (
              <button type="button" className="inline-flex h-10 items-center gap-2 rounded px-4 text-[12px] font-bold text-white shadow-sm transition hover:-translate-y-0.5" style={{ backgroundColor: theme.primaryButton }}>
                Get Started
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
            <div className="mx-auto flex max-w-[1280px] flex-col gap-1">
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
