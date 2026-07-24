'use client';

import { useState } from 'react';
import {
    Save,
    Loader2,
    Sparkles,
    Home,
    Users,
    FileText,
    MessageSquareQuote,
    Calendar,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { BuilderCountedInput } from './builder-field';
import { MultiSelectPages } from './multi-select-pages';
import { DraggableItemList, AddCustomLinkRow, type DraggableItemListItem, type ChildMenuItem } from './draggable-item-list';

export function NavMenuContent() {
    const [logoUrl, setLogoUrl] = useState<string>('');
    const [companyName, setCompanyName] = useState('RA EVENTS');
    const [city, setCity] = useState('Melapalayam (Tirunelveli)');
    const [showLogin, setShowLogin] = useState(true);
    const [showSignIn, setShowSignIn] = useState(true);
    const [menuHeading, setMenuHeading] = useState('Nav Menu');
    const [isSaving, setIsSaving] = useState(false);

    const handleLogoSelect = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setLogoUrl(e.target?.result as string);
            toast.success('Company logo updated.');
        };
        reader.readAsDataURL(file);
    };

    // Selected Pages tags
    const [selectedPages, setSelectedPages] = useState<string[]>([
        'home',
        'about-us',
        'pages',
        'service',
        'events',
        'gallery',
        'contact-us',
    ]);

    const pageOptions = [
        { label: 'Home', value: 'home', icon: Home },
        { label: 'About Us', value: 'about-us', icon: Users },
        { label: 'Pages', value: 'pages', icon: FileText },
        { label: 'Service', value: 'service', icon: MessageSquareQuote },
        { label: 'Events', value: 'events', icon: Calendar },
        { label: 'Gallery', value: 'gallery', icon: FileText },
        { label: 'Contact Us', value: 'contact-us', icon: FileText },
    ];

    // Menu Items for drag and drop list
    const [menuItems, setMenuItems] = useState<DraggableItemListItem[]>([
        { id: 'home', label: 'Home', icon: Home, children: [] },
        { id: 'about-us', label: 'About Us', icon: Users, children: [] },
        { id: 'pages', label: 'Pages', icon: FileText, children: [] },
        { id: 'service', label: 'Service', icon: MessageSquareQuote, children: [] },
        { id: 'events', label: 'Events', icon: Calendar, children: [] },
    ]);

    const handleAddChild = (parentId: string | number, child: ChildMenuItem) => {
        setMenuItems((prev) =>
            prev.map((item) =>
                item.id === parentId
                    ? { ...item, children: [...(item.children ?? []), child] }
                    : item
            )
        );
        toast.success(`Child page added.`);
    };

    const handleDeleteChild = (parentId: string | number, childId: string) => {
        setMenuItems((prev) =>
            prev.map((item) =>
                item.id === parentId
                    ? { ...item, children: (item.children ?? []).filter((child) => child.id !== childId) }
                    : item
            )
        );
        toast.info(`Child page removed.`);
    };

    const handleAddCustomLink = (name: string, link: string) => {
        const newItem: DraggableItemListItem = {
            id: `custom-${Date.now()}`,
            label: name,
            icon: FileText,
            children: [],
            description: link || undefined,
        };

        setMenuItems((prev) => [...prev, newItem]);
        toast.success(`Custom menu link "${name}" added.`);
    };

    const handleDeleteMenuItem = (item: DraggableItemListItem) => {
        setMenuItems(menuItems.filter((i) => i.id !== item.id));
        toast.success(`Menu item "${item.label}" removed.`);
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Nav Menu brand, settings, and order saved successfully!');
        }, 500);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                <div>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">Nav Menu Settings</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage navigation brand logo, company name, city, buttons, and menu ordering.
                    </p>
                </div>
                <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            {/* Card 1: Nav Menu Brand */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold">Nav Menu Brand</CardTitle>
                    <CardDescription className="text-xs">
                        This logo, company name, and city will be used in the website navigation.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 lg:grid-cols-[140px_minmax(0,1fr)]">
                        {/* Company Logo Box */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">COMPANY LOGO</label>
                            {logoUrl ? (
                                <div className="relative flex h-24 w-full items-center justify-center rounded-lg border bg-card overflow-hidden p-2">
                                    <img src={logoUrl} alt="Company Logo" className="h-full w-full object-contain" />
                                    <button
                                        type="button"
                                        onClick={() => setLogoUrl('')}
                                        className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-white hover:bg-slate-900 transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ) : (
                                <div className="relative flex flex-col items-center justify-center h-24 w-full rounded-lg border border-dashed bg-muted/20 hover:bg-muted/30 cursor-pointer p-2 text-center">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleLogoSelect(file);
                                        }}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <span className="text-[11px] font-bold text-primary tracking-wide">Upload Logo</span>
                                    <span className="text-[9px] text-muted-foreground">Click or drag image</span>
                                </div>
                            )}
                        </div>

                        {/* Grid: Company Name, Login, City, Get Started */}
                        <div className="grid content-start gap-3 sm:grid-cols-2">
                            <BuilderCountedInput
                                label="Company Name"
                                value={companyName}
                                onChange={setCompanyName}
                                maxLength={100}
                            />

                            <div className="flex items-center justify-between rounded-lg border p-3 bg-card">
                                <div>
                                    <h4 className="font-semibold text-xs text-foreground">Login</h4>
                                    <p className="text-[10px] text-muted-foreground">
                                        Show or hide the Login button in the website navigation.
                                    </p>
                                </div>
                                <Switch checked={showLogin} onCheckedChange={setShowLogin} />
                            </div>

                            <BuilderCountedInput
                                label="City"
                                value={city}
                                onChange={setCity}
                                maxLength={100}
                                lockInput
                            />

                            <div className="flex items-center justify-between rounded-lg border p-3 bg-card">
                                <div>
                                    <h4 className="font-semibold text-xs text-foreground">Get Started</h4>
                                    <p className="text-[10px] text-muted-foreground">
                                        Show or hide the Get Started button in the website navigation.
                                    </p>
                                </div>
                                <Switch checked={showSignIn} onCheckedChange={setShowSignIn} />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Card 2: Nav Menu Settings */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold">Nav Menu Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <BuilderCountedInput
                        label="Nav Menu Heading"
                        value={menuHeading}
                        onChange={setMenuHeading}
                        maxLength={60}
                        lockInput
                    />

                    <p className="text-[10px] font-medium text-muted-foreground">
                        This list is now connected to the Pages module and updates from your saved pages.
                    </p>

                    <MultiSelectPages
                        label="Select Pages"
                        value={selectedPages}
                        options={pageOptions}
                        onChange={setSelectedPages}
                        placeholder="Add page"
                    />
                </CardContent>
            </Card>

            {/* Card 3: Nav Menu Order */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold">Nav Menu Order</CardTitle>
                    <CardDescription className="text-xs">
                        Drag and drop to reorder • Click + on any item to add a child menu
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <DraggableItemList
                        items={menuItems}
                        pageOptions={pageOptions}
                        onReorder={setMenuItems}
                        onDelete={handleDeleteMenuItem}
                        onAddChild={handleAddChild}
                        onDeleteChild={handleDeleteChild}
                    />

                    <AddCustomLinkRow onAdd={handleAddCustomLink} />
                </CardContent>
            </Card>
        </div>
    );
}
