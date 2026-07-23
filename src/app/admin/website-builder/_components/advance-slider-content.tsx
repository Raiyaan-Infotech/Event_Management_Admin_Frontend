'use client';

import { useState } from 'react';
import { Save, Plus, Trash2, Sparkles, Pencil, Upload, Image as ImageIcon, Sliders } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface Slide {
    id: string;
    title: string;
    description: string;
    buttonLabel: string;
    buttonColor: string;
    buttonTextColor: string;
    imageUrl: string;
    status: boolean;
    customUrl: string;
}

export function AdvanceSliderContent() {
    const [slides, setSlides] = useState<Slide[]>([
        {
            id: '1',
            title: 'Creating Unforgettable Moments',
            description: 'From elegant weddings to corporate events, we handle every detail with creativity and perfection.',
            buttonLabel: 'Explore Events',
            buttonColor: '#6C47FF',
            buttonTextColor: '#FFFFFF',
            imageUrl: '',
            status: true,
            customUrl: '/events',
        },
        {
            id: '2',
            title: 'Perfect Events, Lasting Memories',
            description: 'We create beautiful moments that last forever.',
            buttonLabel: 'View Services',
            buttonColor: '#6C47FF',
            buttonTextColor: '#FFFFFF',
            imageUrl: '',
            status: true,
            customUrl: '/services',
        },
    ]);

    const [editingSlideId, setEditingSlideId] = useState<string | null>('1');
    const [overlayOpacity, setOverlayOpacity] = useState(60);
    const [brightness, setBrightness] = useState(100);
    const [blur, setBlur] = useState(0);
    const [titleColor, setTitleColor] = useState('#FFFFFF');
    const [descriptionColor, setDescriptionColor] = useState('#E2E8F0');
    const [isSaving, setIsSaving] = useState(false);

    const activeSlide = slides.find((s) => s.id === editingSlideId) || slides[0];

    const handleAddSlide = () => {
        const newSlide: Slide = {
            id: Date.now().toString(),
            title: 'New Advance Slide',
            description: 'Advance slide description and subtitle.',
            buttonLabel: 'View Package',
            buttonColor: '#6C47FF',
            buttonTextColor: '#FFFFFF',
            imageUrl: '',
            status: true,
            customUrl: '/events',
        };
        setSlides([...slides, newSlide]);
        setEditingSlideId(newSlide.id);
        toast.info('New advance slide added.');
    };

    const handleDeleteSlide = (id: string) => {
        setSlides(slides.filter((s) => s.id !== id));
        if (editingSlideId === id) setEditingSlideId(slides[0]?.id || null);
        toast.success('Slide removed.');
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Advance Slider saved successfully!');
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
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">Advance Slider</h1>
                    <p className="text-sm text-muted-foreground">Manage interactive slide items, button text colors, overlay opacity, brightness, and blur.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={handleAddSlide} className="gap-1.5">
                        <Plus className="h-4 w-4" /> Add Slide
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2">
                        <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Advance Slider'}
                    </Button>
                </div>
            </div>

            {/* Live Preview Bar */}
            {activeSlide && (
                <Card className="border-indigo-500/30 bg-indigo-500/5">
                    <CardHeader className="py-3">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <CardTitle className="text-xs font-semibold text-indigo-600">Advance Live Preview</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                        <div className="relative flex h-52 w-full flex-col justify-center rounded-lg bg-gradient-to-r from-slate-950 via-purple-950 to-slate-950 p-6 shadow-inner overflow-hidden">
                            <h3 className="text-xl font-bold" style={{ color: titleColor }}>{activeSlide.title}</h3>
                            <p className="text-xs max-w-lg mt-1" style={{ color: descriptionColor }}>{activeSlide.description}</p>
                            <div className="mt-4">
                                <button className="rounded px-4 py-2 text-xs font-bold shadow" style={{ backgroundColor: activeSlide.buttonColor, color: activeSlide.buttonTextColor }}>
                                    {activeSlide.buttonLabel} →
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Slider Items Management Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Slider Items List</CardTitle>
                    <CardDescription>Select a slide to edit or toggle visibility.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {slides.map((slide, idx) => (
                        <div
                            key={slide.id}
                            className={`flex flex-wrap items-center justify-between gap-4 rounded-lg border p-3 transition-all ${
                                editingSlideId === slide.id ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'bg-card'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-muted-foreground">#{idx + 1}</span>
                                <div>
                                    <h4 className="font-semibold text-sm">{slide.title}</h4>
                                    <span className="text-xs text-muted-foreground">{slide.customUrl}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Active</span>
                                    <Switch
                                        checked={slide.status}
                                        onCheckedChange={(val) => {
                                            setSlides(slides.map((s) => (s.id === slide.id ? { ...s, status: val } : s)));
                                        }}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant={editingSlideId === slide.id ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setEditingSlideId(slide.id)}
                                    className="gap-1 text-xs"
                                >
                                    <Pencil className="h-3.5 w-3.5" /> Edit
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeleteSlide(slide.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Advance Filters & Overlay Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Advance Overlay & Text Filters</CardTitle>
                    <CardDescription>Adjust image overlay opacity, brightness, blur, and typography colors.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-muted-foreground">Overlay Opacity (%)</Label>
                                <span className="text-xs font-bold text-primary">{overlayOpacity}%</span>
                            </div>
                            <input
                                type="range" min="0" max="100" value={overlayOpacity}
                                onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary mt-2"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-muted-foreground">Brightness (%)</Label>
                                <span className="text-xs font-bold text-primary">{brightness}%</span>
                            </div>
                            <input
                                type="range" min="0" max="200" value={brightness}
                                onChange={(e) => setBrightness(Number(e.target.value))}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary mt-2"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-muted-foreground">Blur (px)</Label>
                                <span className="text-xs font-bold text-primary">{blur}px</span>
                            </div>
                            <input
                                type="range" min="0" max="20" value={blur}
                                onChange={(e) => setBlur(Number(e.target.value))}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary mt-2"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 pt-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground">Title Text Color</Label>
                            <div className="flex items-center gap-2">
                                <input type="color" value={titleColor} onChange={(e) => setTitleColor(e.target.value)} className="h-9 w-9 cursor-pointer rounded border p-0.5" />
                                <Input value={titleColor} onChange={(e) => setTitleColor(e.target.value)} className="h-9 font-mono text-xs uppercase" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground">Description Text Color</Label>
                            <div className="flex items-center gap-2">
                                <input type="color" value={descriptionColor} onChange={(e) => setDescriptionColor(e.target.value)} className="h-9 w-9 cursor-pointer rounded border p-0.5" />
                                <Input value={descriptionColor} onChange={(e) => setDescriptionColor(e.target.value)} className="h-9 font-mono text-xs uppercase" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
