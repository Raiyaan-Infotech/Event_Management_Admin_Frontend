'use client';

import { useState } from 'react';
import { Save, Plus, Trash2, Sparkles, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface MenuItem {
    id: string;
    label: string;
    url: string;
    children?: { id: string; label: string; link: string }[];
}

export function NavMenuContent() {
    const [companyName, setCompanyName] = useState('EventCraft Pro');
    const [city, setCity] = useState('New York');
    const [showLogin, setShowLogin] = useState(true);
    const [showSignIn, setShowSignIn] = useState(true);
    const [menuHeading, setMenuHeading] = useState('Nav Menu');
    const [isSaving, setIsSaving] = useState(false);

    // Custom Link state
    const [isCustomOpen, setIsCustomOpen] = useState(false);
    const [customName, setCustomName] = useState('');
    const [customLink, setCustomLink] = useState('');

    const [menuItems, setMenuItems] = useState<MenuItem[]>([
        { id: 'home', label: 'Home', url: '/' },
        { id: 'about-us', label: 'About Us', url: '/about-us' },
        { id: 'pages', label: 'Pages', url: '/pages', children: [{ id: 'c1', label: 'Our Services', link: '/services' }] },
        { id: 'service', label: 'Service', url: '/services' },
        { id: 'events', label: 'Events', url: '/events' },
        { id: 'gallery', label: 'Gallery', url: '/gallery' },
        { id: 'contact-us', label: 'Contact Us', url: '/contact-us' },
    ]);

    const handleAddCustomLink = () => {
        if (!customName.trim()) {
            toast.error('Menu name is required.');
            return;
        }
        const newItem: MenuItem = {
            id: `custom-${Date.now()}`,
            label: customName.trim(),
            url: customLink.trim() || 'https://',
        };
        setMenuItems([...menuItems, newItem]);
        setCustomName('');
        setCustomLink('');
        setIsCustomOpen(false);
        toast.success('Custom menu link added.');
    };

    const handleDeleteMenuItem = (id: string) => {
        setMenuItems(menuItems.filter((item) => item.id !== id));
        toast.success('Menu item removed.');
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Nav Menu configuration saved successfully!');
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
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">Nav Menu Settings</h1>
                    <p className="text-sm text-muted-foreground">Manage navigation brand logo, company name, city, buttons, and menu ordering.</p>
                </div>
                <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2">
                    <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            {/* Section 1: Nav Menu Brand */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Nav Menu Brand</CardTitle>
                    <CardDescription>Company logo, name, city, and navbar action button visibility.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Company Logo Upload */}
                        <div className="space-y-2">
                            <Label>Company Logo</Label>
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-40 items-center justify-center rounded-lg border bg-muted/30 p-2">
                                    <span className="text-xs font-semibold text-primary">LOGO PREVIEW</span>
                                </div>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Upload className="h-4 w-4" /> Upload Logo
                                </Button>
                            </div>
                            <p className="text-[11px] text-muted-foreground">Recommended size: Wide logo ~ 420×120px (transparent PNG)</p>
                        </div>

                        {/* Company Name & City */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="companyName" className="text-xs font-semibold text-muted-foreground">Company Name</Label>
                                    <span className="text-[10px] text-muted-foreground">{companyName.length}/100</span>
                                </div>
                                <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} maxLength={100} className="h-9 text-sm" />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="city" className="text-xs font-semibold text-muted-foreground">City</Label>
                                    <span className="text-[10px] text-muted-foreground">{city.length}/100</span>
                                </div>
                                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} maxLength={100} className="h-9 text-sm" />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 pt-2">
                        {/* Login Toggle */}
                        <div className="flex items-center justify-between rounded-lg border p-3 bg-card">
                            <div>
                                <h4 className="font-semibold text-sm">Login</h4>
                                <p className="text-xs text-muted-foreground">Show or hide the Login button in the website navigation.</p>
                            </div>
                            <Switch checked={showLogin} onCheckedChange={setShowLogin} />
                        </div>

                        {/* Get Started Toggle */}
                        <div className="flex items-center justify-between rounded-lg border p-3 bg-card">
                            <div>
                                <h4 className="font-semibold text-sm">Get Started</h4>
                                <p className="text-xs text-muted-foreground">Show or hide the Get Started button in the website navigation.</p>
                            </div>
                            <Switch checked={showSignIn} onCheckedChange={setShowSignIn} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section 2: Nav Menu Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Nav Menu Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1.5 max-w-md">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="menuHeading" className="text-xs font-semibold text-muted-foreground">Nav Menu Heading</Label>
                            <span className="text-[10px] text-muted-foreground">{menuHeading.length}/60</span>
                        </div>
                        <Input id="menuHeading" value={menuHeading} onChange={(e) => setMenuHeading(e.target.value)} maxLength={60} className="h-9 text-sm" />
                    </div>

                    <p className="text-xs text-muted-foreground">
                        This list is connected to the Pages module and updates automatically from your saved pages.
                    </p>
                </CardContent>
            </Card>

            {/* Section 3: Nav Menu Order & Custom Links */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Nav Menu Order</CardTitle>
                    <CardDescription>Reorder menu items and add custom menu links.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        {menuItems.map((item, idx) => (
                            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 bg-card">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-muted-foreground">#{idx + 1}</span>
                                    <div>
                                        <h4 className="font-semibold text-sm">{item.label}</h4>
                                        <span className="text-xs text-muted-foreground">{item.url}</span>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeleteMenuItem(item.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    {/* Add Custom Link Button / Form */}
                    {!isCustomOpen ? (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCustomOpen(true)}
                            className="w-full border-dashed border-primary/50 text-primary font-bold text-xs gap-2 h-10 hover:bg-primary/5"
                        >
                            <Plus className="h-4 w-4" /> Add Custom Link
                        </Button>
                    ) : (
                        <div className="space-y-3 rounded-lg border border-primary/40 bg-primary/5 p-4">
                            <h4 className="text-xs font-bold text-primary">New Custom Link</h4>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Menu Name</Label>
                                <Input
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    placeholder="e.g. Blog, Portfolio..."
                                    className="h-9 text-xs bg-background"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Link URL</Label>
                                <Input
                                    value={customLink}
                                    onChange={(e) => setCustomLink(e.target.value)}
                                    placeholder="https://..."
                                    className="h-9 text-xs bg-background"
                                />
                            </div>
                            <div className="flex gap-2 pt-1">
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsCustomOpen(false)} className="flex-1 text-xs">
                                    Cancel
                                </Button>
                                <Button type="button" size="sm" onClick={handleAddCustomLink} className="flex-1 text-xs">
                                    Add Custom Link
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
