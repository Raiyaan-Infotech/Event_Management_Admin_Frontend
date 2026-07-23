'use client';

import { useState } from 'react';
import { Save, Plus, Trash2, Sparkles, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GalleryImageItem {
    id: string;
    imageUrl: string;
    category: string;
    title: string;
}

export function GalleryContent() {
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('wedding');
    const [categories, setCategories] = useState([
        { label: 'Wedding Decor', value: 'wedding' },
        { label: 'Corporate Summits', value: 'corporate' },
        { label: 'Private Parties', value: 'private' },
    ]);
    const [images, setImages] = useState<GalleryImageItem[]>([
        { id: '1', imageUrl: '', category: 'wedding', title: 'Royal Wedding Stage' },
        { id: '2', imageUrl: '', category: 'corporate', title: 'Tech Summit Stage' },
        { id: '3', imageUrl: '', category: 'private', title: 'Birthday Floral Setup' },
    ]);
    const [isSaving, setIsSaving] = useState(false);

    const visibleImages = activeFilter === 'all'
        ? images
        : images.filter((img) => img.category === activeFilter);

    const handleDeleteImage = (id: string) => {
        setImages(images.filter((img) => img.id !== id));
        toast.success('Gallery photo removed.');
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Gallery settings and photos saved successfully!');
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
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">Event Gallery</h1>
                    <p className="text-sm text-muted-foreground">Upload and manage photo gallery showcases filterable by category tags.</p>
                </div>
                <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2">
                    <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Gallery'}
                </Button>
            </div>

            {/* Gallery Live Preview */}
            <Card className="border-emerald-500/30 bg-emerald-500/5">
                <CardHeader className="py-3">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <CardTitle className="text-xs font-semibold text-emerald-600">Gallery Live Preview</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 pb-4">
                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveFilter('all')}
                            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                                activeFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            All ({images.length})
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.value}
                                type="button"
                                onClick={() => setActiveFilter(cat.value)}
                                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                                    activeFilter === cat.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Image Grid */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {visibleImages.map((img) => (
                            <div key={img.id} className="group relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
                                <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-300 text-xs font-semibold">
                                    {img.title}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Upload Gallery Photos Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Add Gallery Photos</CardTitle>
                    <CardDescription>Select category and upload high-resolution event photos.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="w-[240px]">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Upload className="h-4 w-4" /> Upload Photos
                        </Button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 pt-2">
                        {images.map((img) => (
                            <div key={img.id} className="flex items-center justify-between rounded-lg border p-3 bg-card">
                                <div>
                                    <h4 className="font-semibold text-xs">{img.title}</h4>
                                    <Badge variant="outline" className="text-[10px] capitalize mt-0.5">{img.category}</Badge>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeleteImage(img.id)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
