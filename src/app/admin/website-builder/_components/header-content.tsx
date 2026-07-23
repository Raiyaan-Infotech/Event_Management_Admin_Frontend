'use client';

import { useState } from 'react';
import { Save, Plus, Trash2, Sparkles, Youtube, Instagram, Facebook, Twitter, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface SocialLinkItem {
    id: string;
    label: string;
    url: string;
    color: string;
    iconName: string;
}

export function HeaderContent() {
    const [showSocialIcons, setShowSocialIcons] = useState(true);
    const [mobileNumber, setMobileNumber] = useState('9884699435');
    const [email, setEmail] = useState('eventcraftf@gmail.com');
    const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>([
        {
            id: '1',
            label: 'New Link',
            url: 'https://youtube.com/eventinvite',
            color: '#FF4747',
            iconName: 'youtube',
        },
        {
            id: '2',
            label: 'New Link',
            url: 'https://insta.com',
            color: '#FF476C',
            iconName: 'instagram',
        },
    ]);
    const [isSaving, setIsSaving] = useState(false);

    const MAX_LINKS = 10;

    const handleAddSocialLink = () => {
        if (socialLinks.length >= MAX_LINKS) {
            toast.error('Maximum 10 social links allowed.');
            return;
        }
        const newLink: SocialLinkItem = {
            id: Date.now().toString(),
            label: 'New Link',
            url: 'https://',
            color: '#1877F2',
            iconName: 'link',
        };
        setSocialLinks([...socialLinks, newLink]);
        toast.info('New social link added.');
    };

    const handleDeleteSocialLink = (id: string) => {
        setSocialLinks(socialLinks.filter((item) => item.id !== id));
        toast.success('Social link removed.');
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Header settings and social links saved successfully!');
        }, 500);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/5 text-primary">
                            <Sparkles className="h-3 w-3" /> Website Builder
                        </Badge>
                        <Badge variant="secondary" className="text-xs">Super Admin Panel</Badge>
                    </div>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">Header Settings</h1>
                    <p className="text-sm text-muted-foreground">Manage social icons toggle, contact phone, email, and social links.</p>
                </div>
                <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2">
                    <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            {/* Card 1: Header Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Header Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Toggle: Social Icons */}
                    <div className="flex items-center justify-between rounded-lg border p-3 bg-card">
                        <div>
                            <h4 className="font-semibold text-sm">Social Icons</h4>
                            <p className="text-xs text-muted-foreground">Show or hide social icons in the website header.</p>
                        </div>
                        <Switch checked={showSocialIcons} onCheckedChange={setShowSocialIcons} />
                    </div>

                    {/* Inputs: Mobile Number & Email */}
                    <div className="grid gap-4 md:grid-cols-2 pt-2">
                        {/* Mobile Number */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="mobileNumber" className="text-xs font-semibold text-muted-foreground">Mobile Number</Label>
                                <span className="text-[10px] text-muted-foreground">{mobileNumber.length}/20</span>
                            </div>
                            <div className="flex items-center rounded-md border shadow-xs focus-within:ring-1 focus-within:ring-primary">
                                <div className="flex h-9 shrink-0 items-center justify-center border-r bg-muted px-3 text-xs font-semibold text-foreground">
                                    +91
                                </div>
                                <Input
                                    id="mobileNumber"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                    maxLength={20}
                                    className="border-0 shadow-none focus-visible:ring-0 text-sm"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground">Email</Label>
                                <span className="text-[10px] text-muted-foreground">{email.length}/100</span>
                            </div>
                            <Input
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                maxLength={100}
                                className="h-9 text-sm"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Card 2: Social Links */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Social Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {socialLinks.length === 0 ? (
                        <div className="py-6 text-center text-xs text-muted-foreground">
                            No social links yet. Click "+ Add Social Link" to add one.
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b bg-muted/50 text-muted-foreground font-semibold">
                                        <th className="py-2.5 px-3 w-[60px]">Icon</th>
                                        <th className="py-2.5 px-3 w-[150px]">Icon Color</th>
                                        <th className="py-2.5 px-3 w-[180px]">Label</th>
                                        <th className="py-2.5 px-3">URL</th>
                                        <th className="py-2.5 px-3 w-[60px] text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {socialLinks.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-muted/30">
                                            <td className="py-2.5 px-3">
                                                <div
                                                    className="flex h-7 w-7 items-center justify-center rounded-md text-white font-bold"
                                                    style={{ backgroundColor: item.color }}
                                                >
                                                    {item.iconName === 'youtube' ? (
                                                        <Youtube className="h-3.5 w-3.5" />
                                                    ) : item.iconName === 'instagram' ? (
                                                        <Instagram className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <LinkIcon className="h-3.5 w-3.5" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="color"
                                                        value={item.color}
                                                        onChange={(e) => {
                                                            const updated = [...socialLinks];
                                                            updated[idx].color = e.target.value;
                                                            setSocialLinks(updated);
                                                        }}
                                                        className="h-7 w-7 cursor-pointer rounded border p-0.5"
                                                    />
                                                    <Input
                                                        value={item.color}
                                                        onChange={(e) => {
                                                            const updated = [...socialLinks];
                                                            updated[idx].color = e.target.value;
                                                            setSocialLinks(updated);
                                                        }}
                                                        className="h-7 font-mono text-xs uppercase w-[90px]"
                                                    />
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <div className="relative flex items-center">
                                                    <Input
                                                        value={item.label}
                                                        onChange={(e) => {
                                                            const updated = [...socialLinks];
                                                            updated[idx].label = e.target.value;
                                                            setSocialLinks(updated);
                                                        }}
                                                        maxLength={40}
                                                        className="h-7 text-xs pr-10"
                                                    />
                                                    <span className="absolute right-2 text-[9px] text-muted-foreground">{item.label.length}/40</span>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <div className="relative flex items-center">
                                                    <Input
                                                        value={item.url}
                                                        onChange={(e) => {
                                                            const updated = [...socialLinks];
                                                            updated[idx].url = e.target.value;
                                                            setSocialLinks(updated);
                                                        }}
                                                        maxLength={300}
                                                        className="h-7 text-xs pr-12"
                                                    />
                                                    <span className="absolute right-2 text-[9px] text-muted-foreground">{item.url.length}/300</span>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDeleteSocialLink(item.id)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddSocialLink}
                            disabled={socialLinks.length >= MAX_LINKS}
                            className="gap-1 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/5"
                        >
                            + Add Social Link
                        </Button>
                        <span className="text-xs text-muted-foreground">
                            {socialLinks.length}/{MAX_LINKS} links
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
