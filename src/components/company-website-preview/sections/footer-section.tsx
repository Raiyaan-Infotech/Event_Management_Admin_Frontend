'use client';

import * as React from 'react';
import { Icon, loadIcons } from '@iconify/react';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import type { FooterData, SocialLink, ThemeColors } from './preview-shared';
import { isExternalHref } from './preview-shared';

function FooterSectionBase({ footer, socialLinks, theme, onNavigate }: { footer: FooterData; socialLinks: SocialLink[]; theme: ThemeColors; onNavigate: (href: string) => void }) {
  const [newsletterEmail, setNewsletterEmail] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [, setIconsLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!socialLinks || !socialLinks.length) return;
    const keys = socialLinks.map((link) => {
      const raw = String(link.iconName || 'simple-icons:linktree').trim().toLowerCase();
      return raw.includes(':') ? raw : `simple-icons:${raw}`;
    });
    loadIcons(keys, () => setIconsLoaded(true));
  }, [socialLinks]);

  const handleLink = (e: React.MouseEvent, href: string) => {
    if (isExternalHref(href)) return;
    e.preventDefault();
    onNavigate(href);
  };

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newsletterEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error('Please enter a valid email.'); return; }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setNewsletterEmail('');
    toast.success('Subscribed successfully!');
  };

  return (
    <footer className="w-full text-white" style={{ backgroundColor: theme.primaryButton }}>
      <div className="mx-auto grid w-full gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_0.8fr_1fr] lg:px-12">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3">
            {footer.logoUrl ? (
              <img src={footer.logoUrl} alt={footer.companyName} className="h-11 max-w-[150px] object-contain" />
            ) : (
              <span className="flex h-11 w-11 items-center justify-center rounded-full text-[14px] font-black text-white" style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}>
                {footer.companyName.split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase()}
              </span>
            )}
            <span className="text-[18px] font-black tracking-tight">{footer.companyName}</span>
          </div>
          {footer.description ? <p className="mt-5 max-w-sm text-[13px] font-medium leading-6 text-white/70">{footer.description}</p> : null}
          <div className="mt-6 space-y-2 text-[13px] font-medium text-white/80">
            {footer.address ? <p>{footer.address}</p> : null}
            {footer.mobile ? <p>{footer.mobile}</p> : null}
            {footer.email ? <p>{footer.email}</p> : null}
          </div>
          {footer.showSocialLinks && socialLinks.length ? (
            <div className="mt-6 flex gap-3">
              {socialLinks.map((link: any) => {
                const raw = String(link.iconName || link.icon_name || link.icon || link.icon_key || 'simple-icons:linktree').trim().toLowerCase();
                const iconKey = raw.includes(':') ? raw : `simple-icons:${raw}`;
                const color = String(link.color || link.icon_color || '#FFFFFF');
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    aria-label={link.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 hover:scale-105"
                    style={{ color }}
                  >
                    <Icon icon={iconKey} className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Quick links */}
        {footer.quickLinks.length ? (
          <div>
            <h3 className="text-[14px] font-black uppercase tracking-wide">{footer.topListHeading}</h3>
            <ul className="mt-5 space-y-3 text-[13px] font-medium text-white/75">
              {footer.quickLinks.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <a href={link.href} onClick={(e) => handleLink(e, link.href)} className="transition hover:text-white">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Newsletter */}
        {footer.showNewsletter ? (
          <div>
            <h3 className="text-[14px] font-black uppercase tracking-wide">Newsletter</h3>
            <p className="mt-3 text-[13px] font-medium leading-6 text-white/70">Subscribe to get updates and offers</p>
            <form className="mt-4 flex items-center gap-2" onSubmit={handleNewsletter}>
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={submitting}
                className="h-11 w-full rounded-xl px-4 text-[13px] text-slate-800 bg-white border border-slate-200 outline-none placeholder:text-slate-400 disabled:opacity-70 shadow-2xs"
              />
              <button
                type="submit"
                disabled={submitting}
                aria-label="Subscribe to newsletter"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white font-bold transition hover:opacity-90 active:scale-95 disabled:opacity-70 shadow-xs"
                style={{ backgroundColor: '#ec4899' }}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        ) : null}
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full flex-col gap-2 px-4 py-5 text-[12px] font-medium text-white/60 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-12">
          <p>{footer.copyright}</p>
          {footer.poweredBy ? <p>Powered by {footer.poweredBy}</p> : null}
        </div>
      </div>
    </footer>
  );
}

export const FooterSection = React.memo(FooterSectionBase);
