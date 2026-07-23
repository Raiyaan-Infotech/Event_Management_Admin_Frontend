'use client';

import { useState } from 'react';
import { Save, Sparkles, Check, Settings, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export function FooterContent() {
    const [companyName, setCompanyName] = useState('EventCraft Pro');
    const [shortDescription, setShortDescription] = useState('Full-service event management, wedding planning, corporate galas, and customized decor packages tailored to your special occasions.');
    const [showSocialLinks, setShowSocialLinks] = useState(true);
    const [topListHeading, setTopListHeading] = useState('Quick Links');
    const [selectedPages, setSelectedPages] = useState<string[]>(['about-us', 'services', 'events', 'terms-conditions', 'privacy-policy']);
    const [newsletterEnabled, setNewsletterEnabled] = useState(true);
    const [contactType, setContactType] = useState<'default' | 'alternative'>('default');
    const [mobile, setMobile] = useState('9884699435');
    const [email, setEmail] = useState('eventcraftf@gmail.com');
    const [address, setAddress] = useState('100 Celebration Way, Suite 400, New York, NY 10001');
    const [isSaving, setIsSaving] = useState(false);

    const COMPANY_MAX = 100;
    const DESC_MAX = 160;
    const HEADING_MAX = 60;
    const MOBILE_MAX = 20;
    const EMAIL_MAX = 100;
    const ADDRESS_MAX = 200;

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Footer settings saved successfully!');
        }, 500);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/5 text-primary">
                            <Sparkles className="h-3 w-3" /> Website Builder
                        </Badge>
                        <Badge variant="secondary" className="text-xs">Super Admin Panel</Badge>
                    </div>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">Footer Settings</h1>
                    <p className="text-sm text-muted-foreground">Manage footer company description, quick links, newsletter block, and contact info.</p>
                </div>
                <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2">
                    <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Footer Settings'}
                </Button>
            </div>

            {/* Section 1: Footer Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Footer Details</CardTitle>
                    <CardDescription>Company branding, short description copy, and social links display in footer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Company Name */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="companyName" className="text-xs font-semibold text-muted-foreground">Company Name</Label>
                            <span className="text-[10px] text-muted-foreground">{companyName.length}/{COMPANY_MAX}</span>
                        </div>
                        <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} maxLength={COMPANY_MAX} className="h-9 text-sm" />
                    </div>

                    {/* Short Description */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="shortDescription" className="text-xs font-semibold text-muted-foreground">Footer Short Description</Label>
                            <span className="text-[10px] text-muted-foreground">{shortDescription.length}/{DESC_MAX}</span>
                        </div>
                        <Textarea id="shortDescription" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} maxLength={DESC_MAX} rows={3} className="text-sm" />
                    </div>

                    {/* Show Social Links Toggle */}
                    <div className="flex items-center justify-between rounded-lg border p-3 bg-card">
                        <div>
                            <h4 className="font-semibold text-sm">Show Social Links</h4>
                            <p className="text-xs text-muted-foreground">Show or hide social links in the website footer.</p>
                        </div>
                        <Switch checked={showSocialLinks} onCheckedChange={setShowSocialLinks} />
                    </div>
                </CardContent>
            </Card>

            {/* Section 2: Footer Quick Links */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Footer Quick Links</CardTitle>
                    <CardDescription>Top list heading and page links column configuration.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Top List Heading */}
                    <div className="space-y-1.5 max-w-md">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="topListHeading" className="text-xs font-semibold text-muted-foreground">Top List Heading</Label>
                            <span className="text-[10px] text-muted-foreground">{topListHeading.length}/{HEADING_MAX}</span>
                        </div>
                        <Input id="topListHeading" value={topListHeading} onChange={(e) => setTopListHeading(e.target.value)} maxLength={HEADING_MAX} className="h-9 text-sm font-semibold" />
                    </div>

                    {/* Selected Quick Link Pages */}
                    <div className="space-y-2 pt-2">
                        <Label className="text-xs font-semibold text-muted-foreground">Add Pages to Quick Links</Label>
                        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                            {[
                                { slug: 'about-us', name: 'About Us' },
                                { slug: 'services', name: 'Services' },
                                { slug: 'events', name: 'Events & Packages' },
                                { slug: 'terms-conditions', name: 'Terms & Conditions' },
                                { slug: 'privacy-policy', name: 'Privacy Policy' },
                                { slug: 'contact-us', name: 'Contact Us' },
                            ].map((item) => {
                                const isSelected = selectedPages.includes(item.slug);
                                return (
                                    <div
                                        key={item.slug}
                                        onClick={() => {
                                            if (isSelected) {
                                                setSelectedPages(selectedPages.filter((s) => s !== item.slug));
                                            } else {
                                                setSelectedPages([...selectedPages, item.slug]);
                                            }
                                        }}
                                        className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all ${
                                            isSelected ? 'border-primary bg-primary/5 text-primary' : 'hover:border-primary/40'
                                        }`}
                                    >
                                        <span className="text-xs font-medium">{item.name}</span>
                                        {isSelected && <Check className="h-4 w-4" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section 3: Newsletter Block */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Newsletter Subscription Block</CardTitle>
                    <CardDescription>Enable or disable email newsletter signup in the footer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-3 bg-card">
                        <div>
                            <h4 className="font-semibold text-sm">Enable Newsletter Subscription</h4>
                            <p className="text-xs text-muted-foreground">Allow visitors to submit their email for updates.</p>
                        </div>
                        <Switch checked={newsletterEnabled} onCheckedChange={setNewsletterEnabled} />
                    </div>
                </CardContent>
            </Card>

            {/* Section 4: Contact Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                    <CardDescription>Default vs alternative contact info displayed in footer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Contact Type Toggle */}
                    <div className="flex items-center gap-4 rounded-lg border p-3 bg-card">
                        <label className="flex cursor-pointer items-center gap-2">
                            <input
                                type="radio"
                                name="contactType"
                                checked={contactType === 'default'}
                                onChange={() => setContactType('default')}
                                className="h-4 w-4 text-primary"
                            />
                            <span className="text-xs font-semibold">Default Contact</span>
                        </label>
                        <label className="flex cursor-pointer items-center gap-2">
                            <input
                                type="radio"
                                name="contactType"
                                checked={contactType === 'alternative'}
                                onChange={() => setContactType('alternative')}
                                className="h-4 w-4 text-primary"
                            />
                            <span className="text-xs font-semibold">Alternative Contact</span>
                        </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 pt-2">
                        {/* Mobile Number */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="mobile" className="text-xs font-semibold text-muted-foreground">Mobile Number</Label>
                                <span className="text-[10px] text-muted-foreground">{mobile.length}/{MOBILE_MAX}</span>
                            </div>
                            <Input id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} maxLength={MOBILE_MAX} className="h-9 text-sm" />
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground">Email Address</Label>
                                <span className="text-[10px] text-muted-foreground">{email.length}/{EMAIL_MAX}</span>
                            </div>
                            <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={EMAIL_MAX} className="h-9 text-sm" />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="address" className="text-xs font-semibold text-muted-foreground">Physical Address</Label>
                            <span className="text-[10px] text-muted-foreground">{address.length}/{ADDRESS_MAX}</span>
                        </div>
                        <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={ADDRESS_MAX} rows={2} className="text-sm" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
