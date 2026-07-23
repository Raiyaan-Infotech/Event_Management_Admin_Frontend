'use client';

import { useState } from 'react';
import { Save, Plus, Trash2, Sparkles, Pencil, Upload, Image as ImageIcon, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
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
    imageUrl: string;
    status: boolean;
    customUrl: string;
}

export function SimpleSliderContent() {
    const [slides, setSlides] = useState<Slide[]>([
        {
            id: '1',
            title: 'Creating Unforgettable Moments',
            description: 'From elegant weddings to corporate events, we handle every detail with creativity and perfection.',
            buttonLabel: 'Explore Events',
            buttonColor: '#6C47FF',
            imageUrl: '',
            status: true,
            customUrl: '/events',
        },
        {
            id: '2',
            title: 'Perfect Events, Lasting Memories',
            description: 'We create beautiful moments that last forever.',
            buttonLabel: 'View Service',
            buttonColor: '#6C47FF',
            imageUrl: '',
            status: true,
            customUrl: '/services',
        },
    ]);

    const [editingSlideId, setEditingSlideId] = useState<string | null>('1');
    const [activePreviewIndex, setActivePreviewIndex] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    const activeSlide = slides.find((s) => s.id === editingSlideId) || slides[0];

    const handleAddSlide = () => {
        const newSlide: Slide = {
            id: Date.now().toString(),
            title: 'New Slide Title',
            description: 'Slide description copy goes here.',
            buttonLabel: 'Learn More',
            buttonColor: '#6C47FF',
            imageUrl: '',
            status: true,
            customUrl: '/events',
        };
        setSlides([...slides, newSlide]);
        setEditingSlideId(newSlide.id);
        toast.info('New slide added and selected for editing.');
    };

    const handleDeleteSlide = (id: string) => {
        setSlides(slides.filter((s) => s.id !== id));
        if (editingSlideId === id) {
            setEditingSlideId(slides[0]?.id || null);
        }
        toast.success('Slide removed.');
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Simple Slider saved successfully!');
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
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">Simple Slider</h1>
                    <p className="text-sm text-muted-foreground">Manage simple image slider items, titles, descriptions, button colors, and links.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={handleAddSlide} className="gap-1.5">
                        <Plus className="h-4 w-4" /> Add Slide
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2">
                        <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Slider'}
                    </Button>
                </div>
            </div>

            {/* Live Preview Bar */}
            {activeSlide && (
                <Card className="border-emerald-500/30 bg-emerald-500/5">
                    <CardHeader className="py-3">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <CardTitle className="text-xs font-semibold text-emerald-600">Live Preview</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                        <div className="relative flex h-48 w-full flex-col justify-center rounded-lg bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white overflow-hidden shadow-inner">
                            <h3 className="text-lg font-bold">{activeSlide.title}</h3>
                            <p className="text-xs text-white/80 max-w-lg mt-1">{activeSlide.description}</p>
                            <div className="mt-3">
                                <button className="rounded px-3 py-1.5 text-xs font-bold text-white shadow" style={{ backgroundColor: activeSlide.buttonColor }}>
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
                    <CardDescription>Select a slide to edit its content or toggle visibility.</CardDescription>
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

            {/* Slide Editor Form */}
            {activeSlide && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Edit Slide Item ({activeSlide.title})</CardTitle>
                        <CardDescription>Title, description, button styling, image, and destination link.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground">Slide Title</Label>
                            <Input
                                value={activeSlide.title}
                                onChange={(e) => {
                                    setSlides(slides.map((s) => (s.id === activeSlide.id ? { ...s, title: e.target.value } : s)));
                                }}
                                maxLength={80}
                                className="h-9 text-sm font-semibold"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground">Description Copy</Label>
                            <Textarea
                                value={activeSlide.description}
                                onChange={(e) => {
                                    setSlides(slides.map((s) => (s.id === activeSlide.id ? { ...s, description: e.target.value } : s)));
                                }}
                                maxLength={200}
                                rows={3}
                                className="text-sm"
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground">Button Label</Label>
                                <Input
                                    value={activeSlide.buttonLabel}
                                    onChange={(e) => {
                                        setSlides(slides.map((s) => (s.id === activeSlide.id ? { ...s, buttonLabel: e.target.value } : s)));
                                    }}
                                    maxLength={30}
                                    className="h-9 text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground">Button Color</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={activeSlide.buttonColor}
                                        onChange={(e) => {
                                            setSlides(slides.map((s) => (s.id === activeSlide.id ? { ...s, buttonColor: e.target.value } : s)));
                                        }}
                                        className="h-9 w-9 cursor-pointer rounded border p-0.5"
                                    />
                                    <Input
                                        value={activeSlide.buttonColor}
                                        onChange={(e) => {
                                            setSlides(slides.map((s) => (s.id === activeSlide.id ? { ...s, buttonColor: e.target.value } : s)));
                                        }}
                                        className="h-9 font-mono text-xs uppercase"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground">Destination Link URL</Label>
                            <Input
                                value={activeSlide.customUrl}
                                onChange={(e) => {
                                    setSlides(slides.map((s) => (s.id === activeSlide.id ? { ...s, customUrl: e.target.value } : s)));
                                }}
                                className="h-9 font-mono text-xs"
                            />
                        </div>

                        <div className="space-y-2 pt-1">
                            <Label className="text-xs font-semibold text-muted-foreground">Slide Image</Label>
                            <div className="flex items-center gap-4 border border-dashed rounded-lg p-4 bg-card">
                                <div className="flex h-16 w-28 items-center justify-center rounded bg-muted text-xs font-semibold text-muted-foreground">
                                    SLIDE IMAGE
                                </div>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Upload className="h-4 w-4" /> Upload Slide Image
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
