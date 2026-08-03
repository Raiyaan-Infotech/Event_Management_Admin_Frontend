'use client';

import * as React from 'react';
import { Icon, loadIcons } from '@iconify/react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';
import type { ContactData, SocialLink, ThemeColors } from './preview-shared';

function ContactSectionBase({ contact, theme }: { contact: ContactData; theme: ThemeColors }) {
  const [formData, setFormData] = React.useState({ name: '', email: '', phone: '', category: '', message: '' });
  const [submitting, setSubmitting] = React.useState(false);
  const [, setIconsLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!contact?.socialLinks || !contact.socialLinks.length) return;
    const keys = contact.socialLinks.map((link) => {
      const raw = String(link.iconName || 'simple-icons:linktree').trim().toLowerCase();
      return raw.includes(':') ? raw : `simple-icons:${raw}`;
    });
    loadIcons(keys, () => setIconsLoaded(true));
  }, [contact?.socialLinks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill all required fields.');
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setFormData({ name: '', email: '', phone: '', category: '', message: '' });
    toast.success('Message sent successfully!');
  };

  return (
    <section id="contact" className="w-full border-t border-slate-100 bg-white py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="mb-3 inline-flex rounded px-3 py-1 text-[12px] font-bold text-white" style={{ backgroundColor: theme.primaryButton }}>Contact Us</span>
          <h2 className="mt-4 text-[28px] font-black leading-tight tracking-tight sm:text-[36px]" style={{ color: theme.primaryText }}>Get In Touch</h2>
          <div className="mx-auto mt-3 h-[3px] w-12 rounded-full" style={{ backgroundColor: theme.primaryButton }} />
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Info */}
          <div className="space-y-6">
            {contact.address ? (
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: theme.primaryButton }}>
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[13px] font-black" style={{ color: theme.primaryText }}>Address</p>
                  <p className="mt-1 text-[13px] font-medium text-slate-600">{contact.address}</p>
                </div>
              </div>
            ) : null}
            {contact.mobile ? (
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: theme.primaryButton }}>
                  <Phone className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[13px] font-black" style={{ color: theme.primaryText }}>Phone</p>
                  <p className="mt-1 text-[13px] font-medium text-slate-600">{contact.mobile}</p>
                </div>
              </div>
            ) : null}
            {contact.email ? (
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: theme.primaryButton }}>
                  <Mail className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[13px] font-black" style={{ color: theme.primaryText }}>Email</p>
                  <p className="mt-1 text-[13px] font-medium text-slate-600">{contact.email}</p>
                </div>
              </div>
            ) : null}
            {contact.socialLinksEnabled && contact.socialLinks.length ? (
              <div className="flex gap-3 pt-2">
                {contact.socialLinks.map((link: SocialLink) => {
                  const raw = String(link.iconName || 'simple-icons:linktree').trim().toLowerCase();
                  const iconKey = raw.includes(':') ? raw : `simple-icons:${raw}`;
                  return (
                    <a key={link.label} href={link.href} aria-label={link.label} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:opacity-80" style={{ backgroundColor: link.color || theme.primaryButton }}>
                      <Icon icon={iconKey} className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>

          {/* Form */}
          {contact.contactFormEnabled ? (
            <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-100 bg-slate-50 p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <input value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} placeholder="Your Name *" className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-[13px] focus:outline-none focus:ring-2" style={{ '--tw-ring-color': theme.primaryButton } as any} required />
                <input type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} placeholder="Email Address *" className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-[13px] focus:outline-none focus:ring-2" required />
              </div>
              <input value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone Number" className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-[13px] focus:outline-none focus:ring-2" />
              {contact.categories.length ? (
                <select value={formData.category} onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-[13px] focus:outline-none">
                  <option value="">Select Category</option>
                  {contact.categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              ) : null}
              <textarea value={formData.message} onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))} placeholder="Your Message *" rows={4} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-[13px] focus:outline-none focus:ring-2 resize-none" required />
              <button type="submit" disabled={submitting} className="h-11 w-full rounded-lg text-[13px] font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-70" style={{ backgroundColor: theme.primaryButton }}>
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export const ContactSection = React.memo(ContactSectionBase);
