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
    Eye,
    Gift,
    Share2,
    QrCode,
    Users,
    ShieldCheck,
    Headphones,
    Layout,
    Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useHighlights, useSaveHighlights, DEFAULT_HIGHLIGHTS, type HighlightItem, type HighlightsSettings } from '@/hooks/useHighlights';
import { PageLoader } from '@/components/common/page-loader';
import { ConfirmResetDialog } from '@/components/common/confirm-reset-dialog';
import { IconPickerDialog } from '@/components/common/icon-picker-dialog';
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
    Gift,
    Share2,
    QrCode,
    Users,
    ShieldCheck,
    Headphones,
    Layout,
    Package,
    Sparkles,
};

interface HighlightsContentProps {
    pageSlug: string;
    instance: number;
}

export function HighlightsContent({ pageSlug, instance }: HighlightsContentProps) {
    const { data: fetchedData, isLoading } = useHighlights(pageSlug, instance);
    const saveMutation = useSaveHighlights();

    const [settings, setSettings] = useState<HighlightsSettings>(DEFAULT_HIGHLIGHTS);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const [iconPickerItemIndex, setIconPickerItemIndex] = useState<number | null>(null);
    const [iconSearch, setIconSearch] = useState('');

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
        { id: 'default', label: 'Default', bg: 'linear-gradient(135deg, #F3F0FF 0%, #FFFFFF 100%)', color: '#F3F0FF' },
        { id: 'gradient-1', label: 'Gradient 1', bg: 'linear-gradient(135deg, #E0F2FE 0%, #F0FDFA 100%)', color: '#E0F2FE' },
        { id: 'gradient-2', label: 'Gradient 2', bg: 'linear-gradient(135deg, #FCE7F3 0%, #FFF1F2 100%)', color: '#FCE7F3' },
        { id: 'gradient-3', label: 'Gradient 3', bg: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', color: '#EFF6FF' },
    ];

    const selectPreset = (presetId: string) => {
        const found = presets.find((p) => p.id === presetId);
        setSettings((prev) => ({
            ...prev,
            preset: presetId,
            background_type: 'gradient',
            background_color: found?.color || '#FFFFFF',
        }));
    };

    const activePresetObj = presets.find((p) => p.id === settings.preset);
    const previewBackgroundStyle = activePresetObj
        ? { backgroundImage: activePresetObj.bg }
        : settings.background_type === 'gradient'
        ? { backgroundImage: 'linear-gradient(135deg, #F3F0FF 0%, #FFFFFF 100%)' }
        : { backgroundColor: settings.background_color || '#FFFFFF' };

    const getGridClass = (count: number) => {
        if (count === 3) return 'grid grid-cols-1 sm:grid-cols-3 gap-4';
        if (count === 4) return 'grid grid-cols-2 sm:grid-cols-4 gap-4';
        if (count === 6) return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4';
        return 'grid grid-cols-1 sm:grid-cols-3 gap-4';
    };

    return (
        <div className="space-y-6">
            <PageLoader open={saveMutation.isPending || isLoading} text="Loading Highlights Settings..." />

            {/* Top Bar Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                <div>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">Highlights Customization — {pageSlug.toUpperCase()}</h1>
                    <p className="text-sm text-muted-foreground">
                        Design and customize the highlights section for <strong>{pageSlug.toUpperCase()}</strong> (Instance #{instance}).
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewOpen(true)}
                        className="h-8 px-3 text-xs font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                    >
                        <Eye className="h-3.5 w-3.5 text-emerald-600 mr-1" /> Live Preview
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setResetDialogOpen(true)} className="h-8 px-3 text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50">
                        <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset to Default
                    </Button>
                    <Button type="button" size="sm" onClick={handleSave} disabled={saveMutation.isPending} className="h-8 px-4 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs">
                        {saveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                        {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            {/* Expanded Form Controls (100% width) */}
            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-base font-bold">Customize Highlights ({pageSlug.toUpperCase()} #{instance})</CardTitle>
                        <CardDescription className="text-xs">Modify content, icons, colors, and background.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 space-y-6">
                        {/* Section 1: Highlight Items */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">1. Highlight Items</h3>
                            <div className="space-y-3">
                                {settings.items.map((item, index) => {
                                    const IconComp = ICON_MAP[item.icon] || Sparkles;
                                    const itemColor = item.icon_color || settings.icon_color || '#6C5DD3';
                                    const itemBg = item.icon_bg_color || settings.icon_bg_color || '#F3F0FF';

                                    return (
                                        <div key={item.id || index} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-xl border p-3 bg-card hover:border-slate-300 transition-all shadow-2xs">
                                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                                <GripVertical className="h-4 w-4 text-slate-400 shrink-0 cursor-grab" />
                                                {/* Clickable Icon Button to Open Visual Icon Picker Dialog */}
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIconPickerItemIndex(index);
                                                            setIconSearch('');
                                                        }}
                                                        title="Click to select icon"
                                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-2xs transition-all hover:scale-105 hover:ring-2 hover:ring-primary/40 cursor-pointer"
                                                        style={{ backgroundColor: itemBg, color: itemColor }}
                                                    >
                                                        <IconComp className="h-4 w-4" />
                                                    </button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setIconPickerItemIndex(index);
                                                            setIconSearch('');
                                                        }}
                                                        className="h-8 px-2.5 text-xs font-semibold text-slate-700 gap-1 border-slate-200 hover:bg-slate-50"
                                                    >
                                                        <IconComp className="h-3.5 w-3.5 text-slate-500" />
                                                        <span>{item.icon || 'Select Icon'}</span>
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Title & Description Inputs */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 w-full">
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

                                            {/* Individual Icon Color & Background Color Pickers */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600 border px-2 py-1 rounded-md bg-slate-50" title="Item Icon Text Color">
                                                    <span className="text-[10px] text-slate-400">Color:</span>
                                                    <input
                                                        type="color"
                                                        value={itemColor}
                                                        onChange={(e) => handleItemChange(index, 'icon_color', e.target.value)}
                                                        className="h-5 w-5 cursor-pointer rounded border border-slate-300 bg-transparent p-0"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600 border px-2 py-1 rounded-md bg-slate-50" title="Item Background Color">
                                                    <span className="text-[10px] text-slate-400">BG:</span>
                                                    <input
                                                        type="color"
                                                        value={itemBg}
                                                        onChange={(e) => handleItemChange(index, 'icon_bg_color', e.target.value)}
                                                        className="h-5 w-5 cursor-pointer rounded border border-slate-300 bg-transparent p-0"
                                                    />
                                                </div>

                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="h-8 w-8 text-rose-500 hover:bg-rose-50">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full text-xs font-bold gap-1 mt-2">
                                <Plus className="h-3.5 w-3.5" /> Add New Highlight Item
                            </Button>
                        </div>

                        {/* Section 2: Layout Settings */}
                        <div className="space-y-3 pt-4 border-t">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">2. Layout Settings</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">3. Colors & Presets</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

                            {/* Presets */}
                            <div className="space-y-2 pt-3">
                                <Label className="text-xs font-semibold">Background Presets</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {presets.map((p) => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => selectPreset(p.id)}
                                            className={cn(
                                                'h-12 rounded-lg border flex flex-col items-center justify-center text-[10px] font-bold p-1 transition-all cursor-pointer shadow-xs',
                                                settings.preset === p.id ? 'border-primary ring-2 ring-primary/40 font-extrabold scale-105' : 'border-slate-200 hover:border-slate-300'
                                            )}
                                            style={{ background: p.bg }}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Live Preview Modal */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-4xl w-[92vw]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base font-bold">
                            <Eye className="h-4 w-4 text-emerald-600" /> Highlights Live Preview ({pageSlug.toUpperCase()} #{instance})
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Real-time preview of your highlights grid layout ({settings.items_per_row} items per row).
                        </DialogDescription>
                    </DialogHeader>

                    <div
                        className="rounded-xl border p-6 transition-all shadow-xs my-3 overflow-hidden"
                        style={previewBackgroundStyle}
                    >
                        <div className={getGridClass(Number(settings.items_per_row))}>
                            {settings.items.map((item, idx) => {
                                const IconComp = ICON_MAP[item.icon] || Sparkles;
                                const itemColor = item.icon_color || settings.icon_color || '#6C5DD3';
                                const itemBg = item.icon_bg_color || settings.icon_bg_color || '#F3F0FF';

                                return (
                                    <div key={idx} className="flex flex-col items-center text-center space-y-2 p-3 rounded-lg border border-transparent hover:border-slate-200/60 transition-all min-w-0">
                                        <div
                                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105 shadow-xs"
                                            style={{
                                                backgroundColor: settings.icon_style === 'filled' ? itemBg : 'transparent',
                                                border: settings.icon_style === 'outline' ? `2px solid ${itemColor}` : 'none',
                                                color: itemColor,
                                            }}
                                        >
                                            <IconComp className="h-5 w-5" />
                                        </div>
                                        <h4 className="text-xs font-bold break-words line-clamp-2 max-w-full text-center" style={{ color: settings.title_color }}>
                                            {item.title}
                                        </h4>
                                        <p className="text-[11px] leading-relaxed break-words line-clamp-3 max-w-full text-center" style={{ color: settings.description_color }}>
                                            {item.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Visual Icon Picker Dialog Modal (Shared Component) */}
            <IconPickerDialog
                open={iconPickerItemIndex !== null}
                onOpenChange={(open) => !open && setIconPickerItemIndex(null)}
                onSelect={(selectedIcon) => {
                    if (iconPickerItemIndex !== null) {
                        handleItemChange(iconPickerItemIndex, 'icon', selectedIcon);
                        setIconPickerItemIndex(null);
                        toast.success(`Icon updated to "${selectedIcon}"`);
                    }
                }}
            />

            <ConfirmResetDialog
                open={resetDialogOpen}
                onOpenChange={setResetDialogOpen}
                onConfirm={handleReset}
            />
        </div>
    );
}
