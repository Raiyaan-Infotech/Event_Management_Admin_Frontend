'use client';

import { useState } from 'react';
import { Save, Sparkles, Trash2, Phone, Mail, MapPin, Monitor, Smartphone, Lock, HelpCircle, RotateCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { BuilderCountedInput, BuilderCountedTextarea } from './builder-field';
import { MultiSelectPages } from './multi-select-pages';

type ContactType = 'default' | 'alternative';
type PreviewDevice = 'desktop' | 'mobile';

interface ContactBlock {
    mobile: string;
    email: string;
    address: string;
}

const initialDefaultContact: ContactBlock = {
    mobile: '9884699435',
    email: 'eventcraftf@gmail.com',
    address: '100 Celebration Way, Suite 400, New York, NY 10001',
};

const initialSelectedPages = [
    'about-us',
    'services',
    'events',
    'terms-conditions',
    'privacy-policy',
];

export function FooterContent() {
    const [companyLogo, setCompanyLogo] = useState('');
    const [companyName, setCompanyName] = useState('RA EVENTS');
    const [shortDescription, setShortDescription] = useState('Full-service event management, wedding planning, corporate galas, and customized decor packages tailored to your special occasions.');
    const [contactType, setContactType] = useState<ContactType>('default');
    
    const [defaultContact, setDefaultContact] = useState<ContactBlock>(initialDefaultContact);

    const [alternativeContact, setAlternativeContact] = useState<ContactBlock>({
        mobile: '9876543210',
        email: 'alt.eventcraft@gmail.com',
        address: '200 Platinum Tower, Tirunelveli',
    });

    const [topListHeading, setTopListHeading] = useState('Quick Links');
    const [selectedPages, setSelectedPages] = useState<string[]>(initialSelectedPages);
    const [newsletterEnabled, setNewsletterEnabled] = useState(true);
    const [showSocialLinks, setShowSocialLinks] = useState(true);
    const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
    const [isSaving, setIsSaving] = useState(false);

    const copyright = '© 2026 RA Events. All rights reserved.';
    const poweredBy = 'Powered by EventCraft Website Builder';

    const activeContact = contactType === 'alternative' ? alternativeContact : defaultContact;

    const pageOptions = [
        { label: 'About Us', value: 'about-us' },
        { label: 'Services', value: 'services' },
        { label: 'Events & Packages', value: 'events' },
        { label: 'Terms & Conditions', value: 'terms-conditions' },
        { label: 'Privacy Policy', value: 'privacy-policy' },
        { label: 'Contact Us', value: 'contact-us' },
    ];

    const handleReset = () => {
        setCompanyLogo('');
        setCompanyName('RA EVENTS');
        setShortDescription('Full-service event management, wedding planning, corporate galas, and customized decor packages tailored to your special occasions.');
        setContactType('default');
        setDefaultContact(initialDefaultContact);
        setTopListHeading('Quick Links');
        setSelectedPages(initialSelectedPages);
        setNewsletterEnabled(true);
        setShowSocialLinks(true);
        toast.info('Footer settings reset to defaults.');
    };

    const handleLogoSelect = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setCompanyLogo(e.target?.result as string);
            toast.success('Company logo updated.');
        };
        reader.readAsDataURL(file);
    };

    const quickLinkLabels = selectedPages
        .map((val) => pageOptions.find((opt) => opt.value === val)?.label)
        .filter(Boolean);

    const updateActiveContact = (patch: Partial<ContactBlock>) => {
        if (contactType === 'alternative') {
            setAlternativeContact((prev) => ({ ...prev, ...patch }));
        } else {
            setDefaultContact((prev) => ({ ...prev, ...patch }));
        }
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Footer settings saved successfully!');
        }, 500);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                <div>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">Footer Settings</h1>
                    <p className="text-sm text-muted-foreground">Manage footer company description, quick links, newsletter block, and contact info.</p>
                </div>
                <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2">
                    <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            {/* Main Section Layout: Form Settings + Live Preview */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Form Settings (7 cols) */}
                <div className="xl:col-span-7 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Column 1: Company Info & Contact Info */}
                        <div className="space-y-4">
                            {/* Card 1: Company Information */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-bold">Company Information</CardTitle>
                                    <CardDescription className="text-xs">Footer brand logo, name, and description.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {/* Logo Upload */}
                                    <div className="space-y-1.5 w-full">
                                        <label className="text-xs font-semibold text-muted-foreground">Company Logo</label>
                                        {companyLogo ? (
                                            <div className="relative flex h-16 w-full items-center justify-center rounded-lg border bg-card p-2 overflow-hidden">
                                                <img src={companyLogo} alt="Footer Logo" className="h-full w-full object-contain" />
                                                <button
                                                    type="button"
                                                    onClick={() => setCompanyLogo('')}
                                                    className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-white hover:bg-slate-900"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="relative flex flex-col items-center justify-center h-16 w-full rounded-lg border border-dashed bg-muted/20 hover:bg-muted/30 cursor-pointer p-2 text-center">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleLogoSelect(file);
                                                    }}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                                <span className="text-xs font-semibold text-primary">+ Upload Logo</span>
                                            </div>
                                        )}
                                    </div>

                                    <BuilderCountedInput
                                        label="Company Name"
                                        value={companyName}
                                        onChange={setCompanyName}
                                        maxLength={100}
                                    />

                                    <BuilderCountedTextarea
                                        label="Short Description"
                                        value={shortDescription}
                                        onChange={setShortDescription}
                                        maxLength={200}
                                        rows={3}
                                    />
                                </CardContent>
                            </Card>

                            {/* Card 2: Contact Info */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-bold">Contact Info</CardTitle>
                                    <CardDescription className="text-xs">Footer contact info block details.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-1 rounded-lg border p-1 bg-muted/30 w-fit">
                                        <button
                                            type="button"
                                            onClick={() => setContactType('default')}
                                            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${
                                                contactType === 'default' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            Default
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setContactType('alternative')}
                                            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${
                                                contactType === 'alternative' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            Alternative
                                        </button>
                                    </div>

                                    <BuilderCountedInput
                                        label="Mobile"
                                        value={activeContact.mobile}
                                        onChange={(val) => updateActiveContact({ mobile: val })}
                                        maxLength={30}
                                    />
                                    <BuilderCountedInput
                                        label="Email"
                                        value={activeContact.email}
                                        onChange={(val) => updateActiveContact({ email: val })}
                                        maxLength={100}
                                    />
                                    <BuilderCountedTextarea
                                        label="Address"
                                        value={activeContact.address}
                                        onChange={(val) => updateActiveContact({ address: val })}
                                        maxLength={200}
                                        rows={2}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Column 2: Menu Settings & Footer Bottom */}
                        <div className="space-y-4">
                            {/* Card 3: Menu Settings */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-bold">Menu Settings</CardTitle>
                                    <CardDescription className="text-xs">Quick links heading, pages, and toggles.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <BuilderCountedInput
                                        label="Top List Heading"
                                        value={topListHeading}
                                        onChange={setTopListHeading}
                                        maxLength={80}
                                    />

                                    <MultiSelectPages
                                        label="Add Pages to Quick Links"
                                        value={selectedPages}
                                        options={pageOptions}
                                        onChange={setSelectedPages}
                                        placeholder="Add page"
                                    />

                                    <div className="flex items-center justify-between rounded-lg border p-2.5 bg-card">
                                        <div>
                                            <h4 className="font-semibold text-xs text-foreground">Enable Newsletter</h4>
                                            <p className="text-[10px] text-muted-foreground">Display subscribe input.</p>
                                        </div>
                                        <Switch checked={newsletterEnabled} onCheckedChange={setNewsletterEnabled} />
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border p-2.5 bg-card">
                                        <div>
                                            <h4 className="font-semibold text-xs text-foreground">Show Social Links</h4>
                                            <p className="text-[10px] text-muted-foreground">Display social icon links.</p>
                                        </div>
                                        <Switch checked={showSocialLinks} onCheckedChange={setShowSocialLinks} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Card 4: Footer Bottom */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                                        Footer Bottom <Lock className="h-3 w-3 text-muted-foreground" />
                                    </CardTitle>
                                    <CardDescription className="text-xs">Copyright statement & platform attribution.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <BuilderCountedInput
                                        label="Copyright"
                                        value={copyright}
                                        onChange={() => undefined}
                                        maxLength={120}
                                        lockInput
                                        showCount={false}
                                    />
                                    <BuilderCountedInput
                                        label="Powered By"
                                        value={poweredBy}
                                        onChange={() => undefined}
                                        maxLength={80}
                                        lockInput
                                        showCount={false}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Live Responsive Preview Card (5 cols) */}
                <div className="xl:col-span-5 space-y-4">
                    <Card className="sticky top-6">
                        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold">Live Footer Preview</CardTitle>
                                <CardDescription className="text-xs">Real-time footer layout preview.</CardDescription>
                            </div>
                            <div className="flex items-center gap-1 rounded-lg border p-1 bg-muted/40">
                                <button
                                    type="button"
                                    onClick={() => setPreviewDevice('desktop')}
                                    className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold ${
                                        previewDevice === 'desktop' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'
                                    }`}
                                >
                                    <Monitor className="h-3.5 w-3.5" /> Desktop
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPreviewDevice('mobile')}
                                    className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold ${
                                        previewDevice === 'mobile' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'
                                    }`}
                                >
                                    <Smartphone className="h-3.5 w-3.5" /> Mobile
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className={`mx-auto rounded-xl border overflow-hidden bg-[#0B0D17] text-white shadow-xl transition-all duration-300 ${
                                previewDevice === 'mobile' ? 'max-w-[320px]' : 'w-full'
                            }`}>
                                <div className={`p-5 gap-4 ${previewDevice === 'mobile' ? 'flex flex-col' : 'grid grid-cols-3'}`}>
                                    {/* Brand Column */}
                                    <div className="space-y-2">
                                        {companyLogo ? (
                                            <img src={companyLogo} alt={companyName} className="h-8 object-contain" />
                                        ) : (
                                            <p className="text-sm font-bold text-white tracking-wide">{companyName}</p>
                                        )}
                                        <p className="text-[10px] leading-relaxed text-white/60">{shortDescription}</p>
                                    </div>

                                    {/* Links Column */}
                                    <div className="space-y-1.5">
                                        <p className="text-xs font-bold text-white">{topListHeading}</p>
                                        {quickLinkLabels.length > 0 ? (
                                            quickLinkLabels.map((lbl) => (
                                                <p key={lbl} className="text-[10px] text-white/60 hover:text-white transition-colors cursor-pointer">{lbl}</p>
                                            ))
                                        ) : (
                                            <p className="text-[10px] italic text-white/30">No pages selected</p>
                                        )}
                                    </div>

                                    {/* Contact Column */}
                                    <div className="space-y-1.5">
                                        <p className="text-xs font-bold text-white">Contact Us</p>
                                        <div className="flex items-center gap-1.5 text-[10px] text-white/60">
                                            <Phone className="h-3 w-3 text-primary shrink-0" />
                                            <span>{activeContact.mobile}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-white/60">
                                            <Mail className="h-3 w-3 text-primary shrink-0" />
                                            <span>{activeContact.email}</span>
                                        </div>
                                        <div className="flex items-start gap-1.5 text-[10px] text-white/60">
                                            <MapPin className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                                            <span>{activeContact.address}</span>
                                        </div>

                                        {newsletterEnabled && (
                                            <div className="mt-2 flex gap-1">
                                                <input
                                                    type="email"
                                                    placeholder="Your email"
                                                    readOnly
                                                    className="w-full rounded-l-md bg-white/10 px-2 py-1 text-[9px] text-white outline-none"
                                                />
                                                <div className="rounded-r-md bg-primary px-2 py-1 text-[9px] font-bold text-primary-foreground shrink-0 cursor-pointer">
                                                    Subscribe
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer Bottom Bar */}
                                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-5 py-2.5 text-[9px] text-white/40">
                                    <span>{copyright}</span>
                                    <span>{poweredBy}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
