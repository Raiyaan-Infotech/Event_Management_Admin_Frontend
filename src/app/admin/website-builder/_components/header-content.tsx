'use client';

import { useState } from 'react';
import { Save, Sparkles, Youtube, Instagram, Twitter, Link as LinkIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { BuilderCountedInput } from './builder-field';

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
            label: 'YouTube',
            url: 'https://youtube.com/eventinvite',
            color: '#FF4747',
            iconName: 'youtube',
        },
        {
            id: '2',
            label: 'Instagram',
            url: 'https://insta.com',
            color: '#FF476C',
            iconName: 'instagram',
        },
        {
            id: '3',
            label: 'Twitter',
            url: 'https://twitter.com',
            color: '#1877F2',
            iconName: 'twitter',
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
                    <CardTitle className="text-base font-bold">Header Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Toggle: Social Icons */}
                    <div className="flex items-center justify-between rounded-lg border p-3 bg-card">
                        <div>
                            <h4 className="font-semibold text-xs text-foreground">Social Icons</h4>
                            <p className="text-[10px] text-muted-foreground">Show or hide social icons in the website header.</p>
                        </div>
                        <Switch checked={showSocialIcons} onCheckedChange={setShowSocialIcons} />
                    </div>

                    {/* Inputs: Mobile Number & Email */}
                    <div className="grid gap-4 md:grid-cols-2 pt-2">
                        <BuilderCountedInput
                            label="Mobile Number"
                            value={mobileNumber}
                            onChange={setMobileNumber}
                            maxLength={20}
                            inputPrefix={
                                <div className="flex h-full shrink-0 items-center justify-center border-r bg-muted px-3 text-xs font-semibold text-foreground">
                                    +91
                                </div>
                            }
                        />
                        <BuilderCountedInput
                            label="Email"
                            value={email}
                            onChange={setEmail}
                            maxLength={100}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Card 2: Social Links */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle className="text-base font-bold">Social Links</CardTitle>
                        <CardDescription className="text-xs">Manage social icons, custom colors, and destination URLs.</CardDescription>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddSocialLink}
                        disabled={socialLinks.length >= MAX_LINKS}
                        className="gap-1 text-xs"
                    >
                        + Add Social Link
                    </Button>
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
                                        <th className="py-2.5 px-3 w-[50px]">Icon</th>
                                        <th className="py-2.5 px-3 w-[120px]">Icon Color</th>
                                        <th className="py-2.5 px-3 w-[140px]">Label</th>
                                        <th className="py-2.5 px-3">URL</th>
                                        <th className="py-2.5 px-3 w-[50px] text-center">Action</th>
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
                                                    ) : item.iconName === 'twitter' ? (
                                                        <Twitter className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <LinkIcon className="h-3.5 w-3.5" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <div className="flex items-center gap-1.5">
                                                    <input
                                                        type="color"
                                                        value={item.color}
                                                        onChange={(e) => {
                                                            const updated = [...socialLinks];
                                                            updated[idx].color = e.target.value;
                                                            setSocialLinks(updated);
                                                        }}
                                                        className="h-6 w-6 cursor-pointer rounded border p-0.5"
                                                    />
                                                    <span className="text-[10px] font-mono uppercase">{item.color}</span>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <Input
                                                    value={item.label}
                                                    onChange={(e) => {
                                                        const updated = [...socialLinks];
                                                        updated[idx].label = e.target.value;
                                                        setSocialLinks(updated);
                                                    }}
                                                    maxLength={40}
                                                    className="h-7 text-xs"
                                                />
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <Input
                                                    value={item.url}
                                                    onChange={(e) => {
                                                        const updated = [...socialLinks];
                                                        updated[idx].url = e.target.value;
                                                        setSocialLinks(updated);
                                                    }}
                                                    maxLength={300}
                                                    className="h-7 text-xs font-mono"
                                                />
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteSocialLink(item.id)}
                                                    className="text-destructive hover:text-destructive/80 p-1"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
