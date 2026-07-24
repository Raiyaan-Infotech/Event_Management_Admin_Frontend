'use client';

import { useState, useRef } from 'react';
import {
    Save,
    Plus,
    Trash2,
    Pencil,
    ChevronLeft,
    ChevronRight,
    GripVertical,
    HelpCircle,
    RotateCcw,
    Quote,
    Star,
    Upload,
    Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { BuilderCountedInput, BuilderCountedTextarea } from './builder-field';
import { cn } from '@/lib/utils';

interface Testimonial {
    id: string;
    customerName: string;
    eventName: string;
    feedback: string;
    photoUrl: string;
    rating: number;
    showRating: boolean;
    status: boolean;
}

function avatarDataUrl(name: string, background: string) {
    const initials = name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');

    return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${background}" />
          <stop offset="100%" stop-color="#1e1b4b" />
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="24" fill="url(#g)" />
      <circle cx="80" cy="64" r="30" fill="#ffffff" opacity="0.9" />
      <path d="M30 145c8-34 28-51 50-51s42 17 50 51" fill="#ffffff" opacity="0.9" />
      <text x="80" y="72" text-anchor="middle" font-family="Inter, Arial" font-size="22" font-weight="800" fill="#1e1b4b">${initials}</text>
    </svg>
  `)}`;
}

const initialTestimonials: Testimonial[] = [
    {
        id: '1',
        customerName: 'Sarah & Michael Johnson',
        eventName: 'Wedding Clients',
        feedback:
            'The wedding decor and reception lighting blew our guests away! Truly an effortless and magical planning experience.',
        photoUrl: avatarDataUrl('Sarah & Michael Johnson', '#8b5cf6'),
        rating: 5,
        showRating: true,
        status: true,
    },
    {
        id: '2',
        customerName: 'David Sterling',
        eventName: 'VP Marketing, Nexus Global',
        feedback:
            'Handled our annual tech summit with 1,200 attendees seamlessly. AV production and check-ins ran perfectly on schedule.',
        photoUrl: avatarDataUrl('David Sterling', '#3b82f6'),
        rating: 5,
        showRating: true,
        status: true,
    },
    {
        id: '3',
        customerName: 'Elena Rostova',
        eventName: 'Birthday Celebration',
        feedback:
            'From the floral arrangements to the customized catering setup, everything exceeded our expectations!',
        photoUrl: avatarDataUrl('Elena Rostova', '#ec4899'),
        rating: 5,
        showRating: true,
        status: true,
    },
];

export function TestimonialsContent() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
    const [editingId, setEditingId] = useState<string>(initialTestimonials[0].id);
    const [activePreviewIndex, setActivePreviewIndex] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const activeItem = testimonials.find((t) => t.id === editingId) || testimonials[0];

    const updateActiveItem = (patch: Partial<Testimonial>) => {
        setTestimonials((prev) =>
            prev.map((t) => (t.id === activeItem.id ? { ...t, ...patch } : t))
        );
    };

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const imageUrl = URL.createObjectURL(file);
        updateActiveItem({ photoUrl: imageUrl });
        toast.success('Customer photo uploaded.');
    };

    const handleAddTestimonial = () => {
        const next: Testimonial = {
            id: String(Date.now()),
            customerName: 'New Customer',
            eventName: 'Event Name',
            feedback: 'Add customer feedback here.',
            photoUrl: avatarDataUrl('New Customer', '#6366f1'),
            rating: 5,
            showRating: true,
            status: true,
        };
        setTestimonials((prev) => [...prev, next]);
        setEditingId(next.id);
        toast.success('New testimonial added.');
    };

    const handleDeleteTestimonial = (testimonial: Testimonial) => {
        setTestimonials((prev) => {
            const next = prev.filter((t) => t.id !== testimonial.id);
            if (testimonial.id === editingId && next[0]) {
                setEditingId(next[0].id);
            }
            return next.length ? next : prev;
        });
        toast.success('Testimonial removed.');
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Testimonials updated successfully!');
        }, 500);
    };

    const visibleTestimonials = testimonials.filter((t) => t.status);
    const previewItem = visibleTestimonials[activePreviewIndex] || visibleTestimonials[0] || activeItem;

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
                        <span className="font-semibold text-slate-800">Testimonials</span>
                    </div>
                    <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Testimonials</h1>
                    <p className="text-xs text-slate-500">
                        Manage your website testimonials and Testimonials settings.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-semibold text-slate-600 border-slate-200 hover:bg-slate-50">
                        <HelpCircle className="h-3.5 w-3.5 text-slate-400 mr-1" /> How It Works
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteTestimonial(activeItem)} className="h-8 px-3 text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50">
                        Delete
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-8 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                    >
                        <Save className="h-3.5 w-3.5 mr-1" /> {isSaving ? 'Saving...' : 'Update Testimonial'}
                    </Button>
                </div>
            </div>

            {/* 2-Column Main Workspace */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                {/* Left Column: Form Controls (4/12 width) */}
                <div className="space-y-4 xl:col-span-4">
                    <Card className="shadow-xs border-slate-200">
                        <CardHeader className="py-3 px-4 border-b bg-slate-50/50">
                            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                                Testimonial Information
                            </CardTitle>
                            <CardDescription className="text-[11px] text-slate-500">
                                Add customer testimonial and feedback.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-4 space-y-4">
                            {/* Customer Name */}
                            <BuilderCountedInput
                                label="Customer Name"
                                required
                                value={activeItem.customerName}
                                onChange={(val) => updateActiveItem({ customerName: val })}
                                maxLength={100}
                                inputClassName="!h-9 text-xs"
                            />

                            {/* Customer Photo */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-wide text-slate-600">
                                    Customer Photo
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="relative h-24 w-24 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shrink-0">
                                        <img
                                            src={activeItem.photoUrl}
                                            alt={activeItem.customerName}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>

                                    {/* Upload Dropzone */}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handlePhotoSelect}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-3 bg-slate-50/50 hover:bg-slate-100/50 hover:border-blue-400 transition-all cursor-pointer text-center group"
                                    >
                                        <Upload className="h-4 w-4 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                                        <p className="text-[11px] font-bold text-slate-800">
                                            <span className="text-blue-600">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-[9px] text-slate-400 mt-0.5">
                                            Recommended: 400x400px (Max: 2MB)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Event Name */}
                            <BuilderCountedInput
                                label="Event Name"
                                required
                                value={activeItem.eventName}
                                onChange={(val) => updateActiveItem({ eventName: val })}
                                maxLength={100}
                                inputClassName="!h-9 text-xs"
                            />

                            {/* Feedback Textarea */}
                            <BuilderCountedTextarea
                                label="Feedback"
                                value={activeItem.feedback}
                                onChange={(val) => updateActiveItem({ feedback: val })}
                                maxLength={1000}
                                textareaClassName="min-h-[100px] text-xs"
                            />

                            {/* Show Rating Toggle */}
                            <div className="rounded-lg border border-slate-200 p-2.5 flex items-center justify-between bg-card">
                                <div className="space-y-0.5">
                                    <label className="text-xs font-bold text-slate-800">Show Rating</label>
                                    <p className="text-[10px] text-slate-500">Display star rating for this testimonial.</p>
                                </div>
                                <Switch
                                    checked={activeItem.showRating}
                                    onCheckedChange={(val) => updateActiveItem({ showRating: val })}
                                />
                            </div>

                            {/* Rating Stars Selector */}
                            {activeItem.showRating && (
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-wide text-slate-600">
                                            Rating
                                        </label>
                                        <span className="text-xs font-bold text-amber-500">{activeItem.rating}/5</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 pt-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => updateActiveItem({ rating: star })}
                                                className="p-1 hover:scale-110 transition-transform focus:outline-none"
                                            >
                                                <Star
                                                    className={cn(
                                                        'h-5 w-5',
                                                        star <= activeItem.rating
                                                            ? 'fill-amber-400 text-amber-400'
                                                            : 'text-slate-300'
                                                    )}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Show/Hide Testimonial Status */}
                            <div className="rounded-lg border border-slate-200 p-2.5 flex items-center justify-between bg-card">
                                <div className="space-y-0.5">
                                    <label className="text-xs font-bold text-slate-800">Show/Hide Testimonial</label>
                                    <p className="text-[10px] text-slate-500">
                                        Choose whether to show this testimonial on the website.
                                    </p>
                                </div>
                                <Switch
                                    checked={activeItem.status}
                                    onCheckedChange={(val) => updateActiveItem({ status: val })}
                                />
                            </div>

                            {/* Form Action Buttons */}
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingId(initialTestimonials[0].id)}
                                    className="h-9 w-full text-xs font-bold border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg shadow-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleSave}
                                    className="h-9 w-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs"
                                >
                                    Update Testimonial
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Preview & Table (8/12 width) */}
                <div className="space-y-6 xl:col-span-8">
                    {/* Live Preview Card */}
                    <Card className="shadow-xs border-slate-200">
                        <CardHeader className="py-3 px-4 border-b bg-slate-50/50">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <div>
                                    <CardTitle className="text-xs font-bold text-slate-900">Live Preview</CardTitle>
                                    <CardDescription className="text-[11px] text-slate-500">
                                        This is how testimonials will appear on the website.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-6 bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 flex flex-col items-center justify-center relative min-h-[300px]">
                            {/* Top Badge */}
                            <span className="px-3 py-1 rounded-md bg-blue-600 text-white font-bold text-[11px] mb-3 shadow-xs">
                                Testimonials
                            </span>
                            <h2 className="text-lg font-black text-slate-900 mb-6">What Our Clients Say</h2>

                            {/* Carousel Card */}
                            {previewItem ? (
                                <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-md border border-slate-100 relative flex flex-col items-center text-center">
                                    <Quote className="h-8 w-8 text-blue-600 fill-blue-600 mb-3 opacity-90" />

                                    <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-blue-100 shadow-xs mb-2">
                                        <img
                                            src={previewItem.photoUrl}
                                            alt={previewItem.customerName}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>

                                    <h3 className="font-bold text-sm text-slate-900">{previewItem.customerName}</h3>
                                    <p className="text-xs font-semibold text-blue-600 mb-2">{previewItem.eventName}</p>

                                    {previewItem.showRating && (
                                        <div className="flex items-center gap-1 mb-3">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star
                                                    key={s}
                                                    className={cn(
                                                        'h-4 w-4',
                                                        s <= previewItem.rating
                                                            ? 'fill-amber-400 text-amber-400'
                                                            : 'text-slate-200'
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    <p className="text-xs text-slate-600 leading-relaxed max-w-md italic">
                                        "{previewItem.feedback}"
                                    </p>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 font-medium">No active testimonials to preview.</p>
                            )}

                            {/* Navigation Arrows */}
                            {visibleTestimonials.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setActivePreviewIndex(
                                                (activePreviewIndex - 1 + visibleTestimonials.length) %
                                                    visibleTestimonials.length
                                            )
                                        }
                                        className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setActivePreviewIndex(
                                                (activePreviewIndex + 1) % visibleTestimonials.length
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Testimonial Management Table Card */}
                    <Card className="shadow-xs border-slate-200">
                        <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between space-y-0 bg-slate-50/50">
                            <div>
                                <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                                    Testimonial Management
                                </CardTitle>
                                <CardDescription className="text-[11px] text-slate-500">
                                    Add, edit, or remove testimonials.
                                </CardDescription>
                            </div>
                            <Button
                                size="sm"
                                onClick={handleAddTestimonial}
                                className="h-8 text-xs gap-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                            >
                                <Plus className="h-3.5 w-3.5" /> Add New Testimonial
                            </Button>
                        </CardHeader>

                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b">
                                        <tr>
                                            <th className="py-2.5 px-3 w-10 text-center">#</th>
                                            <th className="py-2.5 px-3 w-14">Photo</th>
                                            <th className="py-2.5 px-3">Name</th>
                                            <th className="py-2.5 px-3">Event Name</th>
                                            <th className="py-2.5 px-3 text-center">Rating</th>
                                            <th className="py-2.5 px-3 text-center">Status</th>
                                            <th className="py-2.5 px-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {testimonials.map((t, idx) => (
                                            <tr
                                                key={t.id}
                                                className={cn(
                                                    'hover:bg-slate-50/60 transition-colors',
                                                    editingId === t.id && 'bg-blue-50/30'
                                                )}
                                            >
                                                <td className="py-3 px-3 text-center text-slate-400 font-mono">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <GripVertical className="h-3.5 w-3.5 text-slate-300 cursor-grab" />
                                                        <span>{idx + 1}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <div className="h-8 w-8 rounded-full overflow-hidden border border-slate-200">
                                                        <img src={t.photoUrl} alt={t.customerName} className="h-full w-full object-cover" />
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3 font-semibold text-slate-900">
                                                    {t.customerName}
                                                </td>
                                                <td className="py-3 px-3 text-slate-600">
                                                    {t.eventName}
                                                </td>
                                                <td className="py-3 px-3 text-center">
                                                    {t.showRating ? (
                                                        <div className="flex items-center justify-center gap-0.5 text-amber-400">
                                                            {[1, 2, 3, 4, 5].map((s) => (
                                                                <Star
                                                                    key={s}
                                                                    className={cn(
                                                                        'h-3 w-3',
                                                                        s <= t.rating ? 'fill-amber-400' : 'text-slate-200'
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400">Hidden</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-3 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <Switch
                                                            checked={t.status}
                                                            onCheckedChange={(val) => {
                                                                setTestimonials(
                                                                    testimonials.map((item) =>
                                                                        item.id === t.id ? { ...item, status: val } : item
                                                                    )
                                                                );
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => setEditingId(t.id)}
                                                            className={cn(
                                                                'h-8 w-8 rounded-lg p-0 transition-colors',
                                                                editingId === t.id
                                                                    ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-xs'
                                                                    : 'border-slate-200 text-slate-500 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50/50'
                                                            )}
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => handleDeleteTestimonial(t)}
                                                            className="h-8 w-8 rounded-lg p-0 text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
