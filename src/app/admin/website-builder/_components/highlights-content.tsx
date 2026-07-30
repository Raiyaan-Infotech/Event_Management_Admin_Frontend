'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Calendar,
    Sliders,
    Monitor,
    RefreshCw,
    Upload,
    HelpCircle,
    Plus,
    Trash2,
    GripVertical,
    Save,
    RotateCcw,
    Sparkles,
    Check,
    Image as ImageIcon,
    LucideIcon,
    BarChart,
    Layers,
    DollarSign,
    Mail,
    Star,
    Award,
    Shield,
    Zap,
    Heart,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useHighlights, useSaveHighlights, DEFAULT_HIGHLIGHTS, type HighlightItem, type HighlightsSettings } from '@/hooks/useHighlights';
import { PageLoader } from '@/components/common/page-loader';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, LucideIcon> = {
    Calendar,
    Sliders,
    Monitor,
    RefreshCw,
    Upload,
    HelpCircle,
    BarChart,
    Layers,
    DollarSign,
    Mail,
    Star,
    Award,
    Shield,
    Zap,
    Heart,
};

interface HighlightsContentProps {
    pageSlug: string;
    instance: number;
}

export function HighlightsContent({ pageSlug, instance }: HighlightsContentProps) {
    const { data: fetchedData, isLoading } = useHighlights(pageSlug, instance);
    const saveMutation = useSaveHighlights();

    const [settings, setSettings] = useState<HighlightsSettings>(DEFAULT_HIGHLIGHTS);

    useEffect(() => {
        if (fetchedData) {
            setSettings(fetchedData);
        }
    }, [fetchedData]);

    const updateSetting = <K extends keyof HighlightsSettings>(key: K, value: HighlightsSettings[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const handleItemChange = (index: number, field: keyof HighlightItem, val: string) => {
        setSettings((prev) => {
            const nextItems = [...prev.items];
            nextItems[index] = { ...nextItems[index], [field]: val };
            return { ...prev, items: nextItems };
        });
    };

    const addItem = () => {
        setSettings((prev) => ({
            ...prev,
            items: [
                ...prev.items,
                { id: String(Date.now()), icon: 'Sparkles', title: 'New Highlight', description: 'Custom description' },
            ],
        }));
    };

    const removeItem = (index: number) => {
        if (settings.items.length <= 1) {
            toast.error('At least one item is required.');
            return;
        }
        setSettings((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }));
    };

    const handleSave = async () => {
        await saveMutation.mutateAsync(settings);
    };

    const handleReset = () => {
        setSettings({ ...DEFAULT_HIGHLIGHTS, page_slug: pageSlug, instance });
        toast.info('Reset highlights settings to default.');
    };

    const presets = [
        { id: 'default', label: 'Default', bg: 'linear-gradient(135deg, #F3F0FF 0%, #FFFFFF 100%)' },
        { id: 'gradient-1', label: 'Gradient 1', bg: 'linear-gradient(135deg, #E0F2FE 0%, #F0FDFA 100%)' },
        { id: 'gradient-2', label: 'Gradient 2', bg: 'linear-gradient(135deg, #FCE7F3 0%, #FFF1F2 100%)' },
        { id: 'gradient-3', label: 'Gradient 3', bg: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)' },
    ];

    return (
        <div className="space-y-6">
            <PageLoader open={saveMutation.isPending} text="Saving Highlights Customization..." />

            {/* Top Bar Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                <div>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">Highlights Customization</h1>
                    <p className="text-sm text-muted-foreground">
                        Design and customize the highlights section for <strong>{pageSlug.toUpperCase()}</strong> (Instance #{instance}).
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleReset} className="h-8 px-3 text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50">
                        <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset to Default
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending} className="h-8 px-4 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs">
                        {saveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                        {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            {/* Split Screen Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Side: Form Controls */}
                <div className="lg:col-span-7 space-y-6">
                    <Card>
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-base font-bold">Customize Highlights</CardTitle>
                            <CardDescription className="text-xs">Modify content, icons, colors, and background.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 space-y-6">
                            {/* Section 1: Highlight Items */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">1. Highlight Items</h3>
                                <div className="space-y-2.5">
                                    {settings.items.map((item, index) => {
                                        const IconComp = ICON_MAP[item.icon] || Sparkles;
                                        return (
                                            <div key={item.id || index} className="flex items-center gap-2 rounded-lg border p-2.5 bg-card hover:border-slate-300">
                                                <GripVertical className="h-4 w-4 text-slate-400 shrink-0 cursor-grab" />
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                                                    <IconComp className="h-4 w-4" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 flex-1">
                                                    <Input
                                                        value={item.title}
                                                        onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                                                        placeholder="Title"
                                                        className="h-8 text-xs font-semibold"
                                                    />
                                                    <Input
                                                        value={item.description}
                                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                        placeholder="Description"
                                                        className="h-8 text-xs"
                                                    />
                                                </div>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="h-8 w-8 text-rose-500 hover:bg-rose-50">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full text-xs font-bold gap-1">
                                    <Plus className="h-3.5 w-3.5" /> Add New Item
                                </Button>
                            </div>

                            {/* Section 2: Layout Settings */}
                            <div className="space-y-3 pt-4 border-t">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">2. Layout Settings</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold">Number of Items per Row</Label>
                                        <Select value={String(settings.items_per_row)} onValueChange={(val) => updateSetting('items_per_row', Number(val))}>
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="3">3 Items</SelectItem>
                                                <SelectItem value="4">4 Items</SelectItem>
                                                <SelectItem value="6">6 Items</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold">Icon Style</Label>
                                        <Select value={settings.icon_style} onValueChange={(val: any) => updateSetting('icon_style', val)}>
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="filled">Filled (Default)</SelectItem>
                                                <SelectItem value="outline">Outline</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Colors */}
                            <div className="space-y-3 pt-4 border-t">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">3. Colors</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center justify-between gap-2 border p-2 rounded-lg">
                                        <Label className="text-xs">Icon Background</Label>
                                        <input
                                            type="color"
                                            value={settings.icon_bg_color}
                                            onChange={(e) => updateSetting('icon_bg_color', e.target.value)}
                                            className="h-6 w-8 cursor-pointer rounded border border-slate-300 bg-transparent p-0"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between gap-2 border p-2 rounded-lg">
                                        <Label className="text-xs">Icon Color</Label>
                                        <input
                                            type="color"
                                            value={settings.icon_color}
                                            onChange={(e) => updateSetting('icon_color', e.target.value)}
                                            className="h-6 w-8 cursor-pointer rounded border border-slate-300 bg-transparent p-0"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between gap-2 border p-2 rounded-lg">
                                        <Label className="text-xs">Title Color</Label>
                                        <input
                                            type="color"
                                            value={settings.title_color}
                                            onChange={(e) => updateSetting('title_color', e.target.value)}
                                            className="h-6 w-8 cursor-pointer rounded border border-slate-300 bg-transparent p-0"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between gap-2 border p-2 rounded-lg">
                                        <Label className="text-xs">Description Color</Label>
                                        <input
                                            type="color"
                                            value={settings.description_color}
                                            onChange={(e) => updateSetting('description_color', e.target.value)}
                                            className="h-6 w-8 cursor-pointer rounded border border-slate-300 bg-transparent p-0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Side: Live Preview */}
                <div className="lg:col-span-5 space-y-4">
                    <Card className="sticky top-6">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-base font-bold">Live Preview</CardTitle>
                            <CardDescription className="text-xs">See how your highlights section will appear.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 space-y-6">
                            {/* Live Preview Container */}
                            <div
                                className="rounded-xl border p-6 transition-all shadow-xs"
                                style={{
                                    backgroundColor: settings.background_color,
                                    backgroundImage: settings.background_type === 'gradient' ? 'linear-gradient(135deg, #F3F0FF 0%, #FFFFFF 100%)' : undefined,
                                }}
                            >
                                <div className={`grid grid-cols-2 sm:grid-cols-${settings.items_per_row > 4 ? 3 : 2} gap-4`}>
                                    {settings.items.map((item, idx) => {
                                        const IconComp = ICON_MAP[item.icon] || Sparkles;
                                        return (
                                            <div key={idx} className="flex flex-col items-center text-center space-y-1.5 p-2">
                                                <div
                                                    className="flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-105"
                                                    style={{
                                                        backgroundColor: settings.icon_style === 'filled' ? settings.icon_bg_color : 'transparent',
                                                        border: settings.icon_style === 'outline' ? `2px solid ${settings.icon_color}` : 'none',
                                                        color: settings.icon_color,
                                                    }}
                                                >
                                                    <IconComp className="h-5 w-5" />
                                                </div>
                                                <h4 className="text-xs font-bold" style={{ color: settings.title_color }}>
                                                    {item.title}
                                                </h4>
                                                <p className="text-[10px]" style={{ color: settings.description_color }}>
                                                    {item.description}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Preset Buttons */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Background Presets</Label>
                                <div className="grid grid-cols-4 gap-2">
                                    {presets.map((p) => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => updateSetting('preset', p.id)}
                                            className={cn(
                                                'h-12 rounded-lg border flex flex-col items-center justify-center text-[10px] font-bold p-1 transition-all',
                                                settings.preset === p.id ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200 hover:border-slate-300'
                                            )}
                                            style={{ background: p.bg }}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
