'use client';

import { useState } from 'react';
import { Save, Sparkles, Palette, Check, HelpCircle, RotateCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AdminPalette {
    id: string;
    name: string;
    primaryBg: string;
    primaryText: string;
    secondaryText: string;
    paragraph: string;
}

const ADMIN_PALETTES: AdminPalette[] = [
    { id: 'p1', name: 'Royal Sapphire (Default)', primaryBg: '#1e3a8a', primaryText: '#0f172a', secondaryText: '#475569', paragraph: '#334155' },
    { id: 'p2', name: 'Emerald Prestige', primaryBg: '#065f46', primaryText: '#064e3b', secondaryText: '#374151', paragraph: '#1f2937' },
    { id: 'p3', name: 'Luxury Rose Gold', primaryBg: '#9f1239', primaryText: '#881337', secondaryText: '#4b5563', paragraph: '#374151' },
    { id: 'p4', name: 'Midnight Onyx & Violet', primaryBg: '#581c87', primaryText: '#3b0764', secondaryText: '#4b5563', paragraph: '#1f2937' },
];

export function ThemeColorContent() {
    const [selectedPaletteId, setSelectedPaletteId] = useState('p1');
    const [pendingPaletteId, setPendingPaletteId] = useState('p1');
    const [isCustom, setIsCustom] = useState(false);
    const [customColors, setCustomColors] = useState({
        primary_bg_color: '#1e3a8a',
        primary_text_color: '#0f172a',
        secondary_text_color: '#475569',
        paragraph_color: '#334155',
    });
    const [isSaving, setIsSaving] = useState(false);

    const activePalette = ADMIN_PALETTES.find((p) => p.id === selectedPaletteId) || ADMIN_PALETTES[0];

    const currentColors = isCustom
        ? customColors
        : {
              primary_bg_color: activePalette.primaryBg,
              primary_text_color: activePalette.primaryText,
              secondary_text_color: activePalette.secondaryText,
              paragraph_color: activePalette.paragraph,
          };

    const handleReset = () => {
        setSelectedPaletteId('p1');
        setPendingPaletteId('p1');
        setIsCustom(false);
        setCustomColors({
            primary_bg_color: '#1e3a8a',
            primary_text_color: '#0f172a',
            secondary_text_color: '#475569',
            paragraph_color: '#334155',
        });
        toast.info('Theme colors reset to defaults.');
    };

    const handleApply = () => {
        if (pendingPaletteId === 'custom') {
            setIsCustom(true);
        } else {
            setIsCustom(false);
            setSelectedPaletteId(pendingPaletteId);
        }
        toast.info('Palette selection applied.');
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Theme Color saved successfully!');
        }, 500);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                <div>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">Theme Color</h1>
                    <p className="text-sm text-muted-foreground">Select a website color palette or customize 4-color hex codes.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => toast.info('Select site color scheme presets or enter custom 4-color hex palette.')} className="h-8 px-3 text-xs font-semibold text-slate-600 border-slate-200 hover:bg-slate-50">
                        <HelpCircle className="h-3.5 w-3.5 text-slate-400 mr-1" /> How It Works
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleReset} className="h-8 px-3 text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50">
                        <RotateCcw className="h-3.5 w-3.5 text-rose-500 mr-1" /> Reset
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving} className="h-8 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
                        {isSaving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                        {isSaving ? 'Saving...' : 'Save Theme Color'}
                    </Button>
                </div>
            </div>

            {/* Section 1: Color Palette Selector */}
            <Card>
                <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                    <Palette className="h-4 w-4 text-primary" />
                    <div>
                        <CardTitle className="text-lg">Color Palette</CardTitle>
                        <CardDescription>Select palette and click Apply to update active site colors.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex-1 min-w-[200px]">
                            <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Color Palette</Label>
                            <Select value={pendingPaletteId} onValueChange={setPendingPaletteId}>
                                <SelectTrigger className="h-10 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ADMIN_PALETTES.map((pal) => (
                                        <SelectItem key={pal.id} value={pal.id}>
                                            {pal.name}
                                        </SelectItem>
                                    ))}
                                    <SelectItem value="custom">Custom 4-Color Palette</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex h-10 items-center gap-1 pt-5">
                            <span className="h-6 w-6 rounded border" style={{ backgroundColor: currentColors.primary_bg_color }} title="Primary Color" />
                            <span className="h-6 w-6 rounded border" style={{ backgroundColor: currentColors.primary_text_color }} title="Primary Text Color" />
                            <span className="h-6 w-6 rounded border" style={{ backgroundColor: currentColors.secondary_text_color }} title="Secondary Text Color" />
                            <span className="h-6 w-6 rounded border" style={{ backgroundColor: currentColors.paragraph_color }} title="Paragraph Text Color" />
                        </div>

                        <div className="pt-5">
                            <Button type="button" variant="outline" onClick={handleApply} disabled={pendingPaletteId === selectedPaletteId && !isCustom} className="h-10 text-xs">
                                Apply
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section 2: Swatch Color Rows */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{isCustom ? 'Custom Colors' : activePalette.name}</CardTitle>
                    <CardDescription>4 semantic color tokens controlling website styling.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 divide-y">
                    {[
                        { key: 'primary_bg_color', label: 'Primary Color' },
                        { key: 'primary_text_color', label: 'Primary Text Color' },
                        { key: 'secondary_text_color', label: 'Secondary Text Color' },
                        { key: 'paragraph_color', label: 'Paragraph text Color' },
                    ].map((item, idx) => {
                        const k = item.key as keyof typeof currentColors;
                        return (
                            <div key={k} className={`flex items-center justify-between gap-4 ${idx !== 0 ? 'pt-3' : ''}`}>
                                <Label className="text-xs font-semibold">{item.label}</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={currentColors[k]}
                                        disabled={!isCustom}
                                        onChange={(e) => {
                                            if (isCustom) setCustomColors({ ...customColors, [k]: e.target.value });
                                        }}
                                        className="h-8 w-8 cursor-pointer rounded border p-0.5 disabled:opacity-60"
                                    />
                                    <Input
                                        value={currentColors[k]}
                                        disabled={!isCustom}
                                        onChange={(e) => {
                                            if (isCustom) setCustomColors({ ...customColors, [k]: e.target.value });
                                        }}
                                        className="h-8 w-[100px] font-mono text-xs uppercase"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        </div>
    );
}
