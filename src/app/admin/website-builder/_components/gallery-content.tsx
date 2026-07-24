'use client';

import { useState, useRef } from 'react';
import {
    Save,
    Upload,
    Trash2,
    Plus,
    HelpCircle,
    RotateCcw,
    Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { BuilderCountedInput } from './builder-field';
import { cn } from '@/lib/utils';

interface GalleryImage {
    id: string;
    url: string;
    alt?: string;
    category: string;
}

export function GalleryContent() {
    const [eventName, setEventName] = useState('Sarah & Michael Wedding');
    const [eventType, setEventType] = useState('wedding');
    const [city, setCity] = useState('New York, USA');
    const [activeFilter, setActiveFilter] = useState('All');
    const [isSaving, setIsSaving] = useState(false);

    const [categories, setCategories] = useState([
        'All',
        'Wedding Decor',
        'Corporate Summits',
        'Private Parties',
        'Exhibition',
    ]);

    const [images, setImages] = useState<GalleryImage[]>([
        { id: '1', url: '', category: 'wedding', alt: 'Royal Wedding Stage' },
        { id: '2', url: '', category: 'corporate', alt: 'Tech Summit Stage' },
        { id: '3', url: '', category: 'private', alt: 'Birthday Floral Setup' },
        { id: '4', url: '', category: 'wedding', alt: 'Reception Hall' },
        { id: '5', url: '', category: 'exhibition', alt: 'Art Exhibition' },
        { id: '6', url: '', category: 'corporate', alt: 'Corporate Gala' },
    ]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const newImgs: GalleryImage[] = files.map((file, idx) => ({
            id: `${Date.now()}-${idx}`,
            url: URL.createObjectURL(file),
            alt: file.name,
            category: eventType,
        }));

        setImages((prev) => [...prev, ...newImgs]);
        toast.success(`Uploaded ${files.length} gallery image(s).`);
    };

    const handleRemoveImage = (id: string) => {
        setImages((prev) => prev.filter((img) => img.id !== id));
        toast.success('Image removed from gallery.');
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Gallery saved successfully!');
        }, 600);
    };

    const handleReset = () => {
        setEventName('Sarah & Michael Wedding');
        setEventType('wedding');
        setCity('New York, USA');
        setActiveFilter('All');
        toast.info('Gallery form reset to defaults.');
    };

    const visibleImages =
        activeFilter === 'All'
            ? images
            : images.filter(
                  (img) =>
                      img.category.toLowerCase() === activeFilter.toLowerCase() ||
                      activeFilter.toLowerCase().includes(img.category.toLowerCase())
              );

    return (
        <div className="space-y-5">
            {/* Header Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
                <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                        <span>Dashboard</span>
                        <span>›</span>
                        <span>Website Builder</span>
                        <span>›</span>
                        <span className="font-semibold text-slate-800">Gallery</span>
                    </div>
                    <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Gallery</h1>
                    <p className="text-xs text-slate-500">Manage your website gallery and Gallery settings.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 text-slate-600 border-slate-200">
                        <HelpCircle className="h-3.5 w-3.5 text-slate-400" /> How It Works
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleReset} className="h-8 text-xs gap-1.5 text-slate-600 border-slate-200">
                        <RotateCcw className="h-3.5 w-3.5 text-slate-400" /> Reset
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving} className="h-8 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                        <Save className="h-3.5 w-3.5" /> {isSaving ? 'Saving...' : 'Save Gallery'}
                    </Button>
                </div>
            </div>

            {/* 2-Column Main Workspace */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                {/* Left Column: Form Controls (4/12 width) */}
                <div className="space-y-4 xl:col-span-4">
                    {/* Panel 1: Gallery Information */}
                    <Card className="shadow-xs border-slate-200">
                        <CardHeader className="py-3 px-4 border-b bg-slate-50/50">
                            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                                Gallery Information
                            </CardTitle>
                            <CardDescription className="text-[11px] text-slate-500">
                                Add details about the event gallery.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <BuilderCountedInput
                                label="Event Name"
                                required
                                value={eventName}
                                onChange={setEventName}
                                maxLength={100}
                                inputClassName="!h-9 text-xs"
                            />

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-wide text-slate-600">
                                    Event Type <span className="text-rose-500">*</span>
                                </label>
                                <Select value={eventType} onValueChange={setEventType}>
                                    <SelectTrigger className="h-9 w-full text-xs font-semibold bg-card border-slate-200">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="wedding">Wedding Decor</SelectItem>
                                        <SelectItem value="corporate">Corporate Summits</SelectItem>
                                        <SelectItem value="private">Private Parties</SelectItem>
                                        <SelectItem value="exhibition">Exhibition</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-slate-400 font-medium">Create a gallery category first</p>
                            </div>

                            <BuilderCountedInput
                                label="City"
                                required
                                value={city}
                                onChange={setCity}
                                maxLength={100}
                                inputClassName="!h-9 text-xs"
                            />
                        </CardContent>
                    </Card>

                    {/* Panel 2: Gallery Images */}
                    <Card className="shadow-xs border-slate-200">
                        <CardHeader className="py-3 px-4 border-b bg-slate-50/50">
                            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                                Gallery Images
                            </CardTitle>
                            <CardDescription className="text-[11px] text-slate-500">
                                Upload multiple images for this gallery.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {/* Hidden File Input */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAddImages}
                                multiple
                                accept="image/*"
                                className="hidden"
                            />

                            {/* Dropzone */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50/50 hover:bg-slate-100/50 hover:border-blue-400 transition-all cursor-pointer text-center group"
                            >
                                <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <Upload className="h-5 w-5" />
                                </div>
                                <p className="text-xs font-bold text-slate-800">
                                    <span className="text-blue-600 hover:underline">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                                    Recommended: 1200x800px gallery image (Max: 5MB each)
                                </p>
                            </div>

                            <p className="text-[10px] text-slate-400 font-medium text-center">
                                You can upload up to 50 images.
                            </p>

                            {/* Thumbnails preview */}
                            {images.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100">
                                    {images.map((img) => (
                                        <div
                                            key={img.id}
                                            className="group relative aspect-square rounded-lg border border-slate-200 bg-slate-100 overflow-hidden"
                                        >
                                            {img.url ? (
                                                <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                                                    <ImageIcon className="h-4 w-4 text-slate-400" />
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveImage(img.id);
                                                }}
                                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                            >
                                                <Trash2 className="h-3.5 w-3.5 text-red-400 hover:text-red-300" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Live Preview Workspace (8/12 width) */}
                <div className="xl:col-span-8">
                    <Card className="shadow-xs border-slate-200">
                        <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between space-y-0 bg-slate-50/50">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <div>
                                    <CardTitle className="text-xs font-bold text-slate-900">Gallery Preview</CardTitle>
                                    <CardDescription className="text-[11px] text-slate-500">
                                        This is how your gallery will appear on the website.
                                    </CardDescription>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => {
                                    const newCat = prompt('Enter new category name:');
                                    if (newCat) {
                                        setCategories([...categories, newCat]);
                                        toast.success(`Category "${newCat}" added.`);
                                    }
                                }}
                                className="h-8 text-xs gap-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                            >
                                <Plus className="h-3.5 w-3.5" /> Add Category
                            </Button>
                        </CardHeader>

                        <CardContent className="p-5 space-y-5">
                            {/* Category Filter Pills */}
                            <div className="flex flex-wrap gap-1.5">
                                {categories.map((cat) => {
                                    const isSelected = activeFilter.toLowerCase() === cat.toLowerCase();
                                    return (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setActiveFilter(cat)}
                                            className={cn(
                                                'px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer',
                                                isSelected
                                                    ? 'bg-blue-600 text-white shadow-xs'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            )}
                                        >
                                            {cat}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Responsive 4-Column Image Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {visibleImages.length > 0 ? (
                                    visibleImages.map((img) => (
                                        <div
                                            key={img.id}
                                            className="group relative aspect-[4/3] rounded-xl border border-slate-200 bg-slate-100 overflow-hidden shadow-2xs transition-all hover:shadow-md"
                                        >
                                            {img.url ? (
                                                <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 flex flex-col items-center justify-center p-2 text-center">
                                                    <ImageIcon className="h-6 w-6 text-slate-400 mb-1" />
                                                    <span className="text-[10px] font-semibold text-slate-500 line-clamp-1">
                                                        {img.alt || 'Gallery Image'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                        <ImageIcon className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                                        <p className="text-xs font-bold text-slate-600">No Gallery Images Found</p>
                                        <p className="text-[11px] text-slate-400 mt-1">Upload images from the left panel to display in this category.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
