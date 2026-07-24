'use client';

import { useState } from 'react';
import {
    Save,
    Plus,
    Trash2,
    Pencil,
    ChevronLeft,
    ChevronRight,
    GripVertical,
    HelpCircle,
    X,
    Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    BuilderCountedInput,
    BuilderCountedTextarea,
    BuilderSegmentedControl,
    BuilderRadioGroup,
    BuilderImageUploadDropzone,
    BuilderStatusSwitch,
} from './builder-field';
import { MediaCropDialog } from '@/components/common/media-crop-dialog';
import { cn } from '@/lib/utils';

type SliderHeight = 'small' | 'medium' | 'large' | 'fullscreen';
type LinkTargetMode = 'page' | 'custom';

interface Slide {
    id: string;
    title: string;
    description: string;
    buttonLabel: string;
    targetMode: LinkTargetMode;
    customUrl: string;
    imageUrl: string;
    status: boolean;
}

const sliderHeightOptions: { label: string; value: SliderHeight }[] = [
    { label: 'Small (400px)', value: 'small' },
    { label: 'Medium (600px)', value: 'medium' },
    { label: 'Large (800px)', value: 'large' },
    { label: 'Full Screen', value: 'fullscreen' },
];

const targetModeOptions: { label: string; value: LinkTargetMode }[] = [
    { label: 'Page', value: 'page' },
    { label: 'Custom', value: 'custom' },
];

export function SimpleSliderContent() {
    // Top-level Slider Settings
    const [sliderTitle, setSliderTitle] = useState('Home Page Slider');
    const [sliderHeight, setSliderHeight] = useState<SliderHeight>('medium');

    // Slide Items State
    const [slides, setSlides] = useState<Slide[]>([
        {
            id: '1',
            title: 'Creating Unforgettable Moments',
            description:
                'From elegant weddings to corporate events, we handle every detail with creativity and perfection. Let us bring your dream event to life.',
            buttonLabel: 'Explore Events',
            targetMode: 'custom',
            customUrl: '/events',
            imageUrl: '',
            status: true,
        },
        {
            id: '2',
            title: 'Perfect Events, Lasting Memories',
            description:
                'We create beautiful moments that last forever with top tier planning and execution.',
            buttonLabel: 'View Service',
            targetMode: 'custom',
            customUrl: '/services',
            imageUrl: '',
            status: true,
        },
        {
            id: '3',
            title: 'We Plan. You Celebrate.',
            description:
                'Stress-free event management tailored to your specific budget and style preferences.',
            buttonLabel: 'Contact Us',
            targetMode: 'custom',
            customUrl: '/contact',
            imageUrl: '',
            status: true,
        },
    ]);

    const [editingSlideId, setEditingSlideId] = useState<string>('1');
    const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);
    const [isSaving, setIsSaving] = useState(false);

    // Image Cropper State
    const [cropOpen, setCropOpen] = useState(false);
    const [cropImageRaw, setCropImageRaw] = useState('');
    const [cropFileName, setCropFileName] = useState('slide.jpg');
    const [cropMimeType, setCropMimeType] = useState('image/jpeg');

    const activeSlide = slides.find((s) => s.id === editingSlideId) || slides[0] || null;

    const handleAddSlide = () => {
        const newSlide: Slide = {
            id: Date.now().toString(),
            title: 'New Slide Title',
            description: 'Add slide description copy here.',
            buttonLabel: 'Learn More',
            targetMode: 'custom',
            customUrl: '/events',
            imageUrl: '',
            status: true,
        };
        setSlides([...slides, newSlide]);
        setEditingSlideId(newSlide.id);
        setActivePreviewIndex(slides.length);
        toast.info('New slide added and selected for editing.');
    };

    const handleDeleteSlide = (id: string) => {
        if (slides.length <= 1) {
            toast.error('At least one slide is required.');
            return;
        }
        const updated = slides.filter((s) => s.id !== id);
        setSlides(updated);
        if (editingSlideId === id) {
            setEditingSlideId(updated[0]?.id || '');
        }
        if (activePreviewIndex >= updated.length) {
            setActivePreviewIndex(Math.max(0, updated.length - 1));
        }
        toast.success('Slide removed.');
    };

    const updateActiveSlide = (field: keyof Slide, value: any) => {
        if (!editingSlideId) return;
        setSlides(slides.map((s) => (s.id === editingSlideId ? { ...s, [field]: value } : s)));
    };

    const handleFileSelect = (file: File) => {
        setCropFileName(file.name);
        setCropMimeType(file.type || 'image/jpeg');
        const reader = new FileReader();
        reader.onload = (e) => {
            setCropImageRaw(e.target?.result as string);
            setCropOpen(true);
        };
        reader.readAsDataURL(file);
    };

    const handleCropped = (_file: File, dataUrl: string) => {
        updateActiveSlide('imageUrl', dataUrl);
        setCropOpen(false);
        toast.success('Slide image uploaded successfully.');
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Simple Slider settings updated successfully!');
        }, 500);
    };

    const previewSlide = slides[activePreviewIndex] || activeSlide || slides[0];

    const prevPreview = () => {
        setActivePreviewIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
    };

    const nextPreview = () => {
        setActivePreviewIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
    };

    return (
        <div className="space-y-5">
            {/* Top Page Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">Simple Slider</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Manage your website simple slider and Simple Slider settings.
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1">
                        <span>Dashboard</span>
                        <span>›</span>
                        <span>Website Builder</span>
                        <span>›</span>
                        <span className="font-semibold text-slate-800">Simple Slider</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs text-slate-700 h-8">
                        <HelpCircle className="h-3.5 w-3.5" /> How It Works
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-8"
                        onClick={() => {
                            if (editingSlideId) handleDeleteSlide(editingSlideId);
                        }}
                    >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-8 px-4"
                    >
                        <Save className="h-3.5 w-3.5" /> {isSaving ? 'Updating...' : 'Update'}
                    </Button>
                </div>
            </div>

            {/* 2-Column Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Column: Slide Settings Form Card (5 Cols) */}
                <div className="lg:col-span-5 space-y-4">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="py-3 px-4 border-b">
                            <CardTitle className="text-sm font-bold text-slate-900">Slide Settings</CardTitle>
                            <CardDescription className="text-xs text-slate-500">
                                Add and edit slide information for the homepage slider.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {/* Slider Title */}
                            <BuilderCountedInput
                                label="Slider Title"
                                value={sliderTitle}
                                onChange={setSliderTitle}
                                maxLength={100}
                                inputClassName="!h-9 text-xs"
                            />

                            {/* Slider Height Radio Group */}
                            <BuilderRadioGroup
                                label="Slider Height"
                                description="Set the height of the slider section."
                                name="sliderHeight"
                                options={sliderHeightOptions}
                                value={sliderHeight}
                                onChange={setSliderHeight}
                            />

                            {activeSlide && (
                                <>
                                    {/* Slide Title */}
                                    <BuilderCountedInput
                                        label="Slide Title"
                                        value={activeSlide.title}
                                        onChange={(val) => updateActiveSlide('title', val)}
                                        maxLength={100}
                                        inputClassName="!h-9 text-xs"
                                    />

                                    {/* Slide Description */}
                                    <BuilderCountedTextarea
                                        label="Slide Description"
                                        value={activeSlide.description}
                                        onChange={(val) => updateActiveSlide('description', val)}
                                        maxLength={200}
                                        rows={3}
                                        textareaClassName="text-xs resize-none"
                                    />

                                    {/* Button Label */}
                                    <BuilderCountedInput
                                        label="Button Label"
                                        value={activeSlide.buttonLabel}
                                        onChange={(val) => updateActiveSlide('buttonLabel', val)}
                                        maxLength={30}
                                        inputClassName="!h-9 text-xs"
                                    />

                                    {/* Link Target Mode (Segmented Control Component) */}
                                    <BuilderSegmentedControl
                                        options={targetModeOptions}
                                        value={activeSlide.targetMode}
                                        onChange={(val) => updateActiveSlide('targetMode', val)}
                                    />

                                    {/* Button Page Dropdown Selector */}
                                    {activeSlide.targetMode === 'page' && (
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-wide text-slate-600">
                                                Button Page
                                            </label>
                                            <Select
                                                value={activeSlide.customUrl || 'events'}
                                                onValueChange={(val) => updateActiveSlide('customUrl', val)}
                                            >
                                                <SelectTrigger className="h-9 w-full text-xs font-semibold bg-card border-slate-200">
                                                    <SelectValue placeholder="Select Page" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="home">Home</SelectItem>
                                                    <SelectItem value="about">About Us</SelectItem>
                                                    <SelectItem value="services">Services</SelectItem>
                                                    <SelectItem value="events">Events</SelectItem>
                                                    <SelectItem value="gallery">Gallery</SelectItem>
                                                    <SelectItem value="contact">Contact Us</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* Custom URL */}
                                    {activeSlide.targetMode === 'custom' && (
                                        <BuilderCountedInput
                                            label="Custom URL"
                                            value={activeSlide.customUrl}
                                            onChange={(val) => updateActiveSlide('customUrl', val)}
                                            maxLength={200}
                                            inputClassName="!h-9 text-xs font-mono"
                                        />
                                    )}

                                    {/* SLIDE IMAGE Dropzone Component */}
                                    <BuilderImageUploadDropzone
                                        label="SLIDE IMAGE"
                                        imageUrl={activeSlide.imageUrl}
                                        onFileSelect={handleFileSelect}
                                        onReCrop={() => {
                                            setCropImageRaw(activeSlide.imageUrl);
                                            setCropOpen(true);
                                        }}
                                        onRemove={() => updateActiveSlide('imageUrl', '')}
                                        recommendedText="Recommended: 1920x800px (Max: 2MB)"
                                    />

                                    {/* Status Switch Component */}
                                    <BuilderStatusSwitch
                                        label="Status"
                                        description="Enable or disable this slide."
                                        checked={activeSlide.status}
                                        onCheckedChange={(val) => updateActiveSlide('status', val)}
                                    />

                                    {/* Card Footer Actions */}
                                    <div className="flex items-center justify-between pt-2 border-t mt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                toast.info('Slide edit cancelled.');
                                            }}
                                            className="gap-1.5 text-xs text-slate-600 h-8"
                                        >
                                            <X className="h-3.5 w-3.5" /> Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => {
                                                toast.success('Slide details updated.');
                                            }}
                                            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-8 px-4"
                                        >
                                            <Save className="h-3.5 w-3.5" /> Update Slide
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Live Preview + Slider Management (7 Cols) */}
                <div className="lg:col-span-7 space-y-4">
                    {/* Live Preview Card */}
                    <Card className="shadow-sm border-slate-200 overflow-hidden">
                        <CardHeader className="py-2.5 px-4 bg-slate-50/80 border-b flex flex-row items-center justify-between space-y-0">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <CardTitle className="text-xs font-semibold text-slate-700">
                                    Live Preview <span className="font-normal text-slate-500">— This is how your slider will appear on the website.</span>
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 bg-slate-950">
                            {previewSlide ? (
                                <div
                                    className={cn(
                                        'relative flex flex-col justify-center px-8 text-white transition-all duration-300 overflow-hidden',
                                        sliderHeight === 'small'
                                            ? 'h-[220px]'
                                            : sliderHeight === 'large'
                                            ? 'h-[340px]'
                                            : sliderHeight === 'fullscreen'
                                            ? 'h-[400px]'
                                            : 'h-[280px]'
                                    )}
                                    style={{
                                        background: previewSlide.imageUrl
                                            ? `linear-gradient(to right, rgba(15, 5, 29, 0.85), rgba(45, 11, 84, 0.7)), url(${previewSlide.imageUrl}) center/cover no-repeat`
                                            : 'linear-gradient(135deg, #1B0534 0%, #2D0B54 50%, #1B0534 100%)',
                                    }}
                                >
                                    {/* Left Navigation Arrow */}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={prevPreview}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white p-0 shadow-md"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>

                                    {/* Right Navigation Arrow */}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={nextPreview}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white p-0 shadow-md"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>

                                    {/* Slide Content Box */}
                                    <div className="max-w-md space-y-2.5 pl-4">
                                        <h3 className="text-xl font-extrabold tracking-tight leading-snug text-white">
                                            {previewSlide.title}
                                        </h3>
                                        <p className="text-xs text-white/80 leading-relaxed max-w-sm">
                                            {previewSlide.description}
                                        </p>
                                        <div className="pt-1">
                                            <Button
                                                type="button"
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#6C47FF] hover:bg-[#5b3adb] px-4 py-2 text-xs font-bold text-white shadow-md h-8"
                                            >
                                                {previewSlide.buttonLabel}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Bottom Pagination Dots */}
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                                        {slides.map((_, idx) => (
                                            <Button
                                                key={idx}
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setActivePreviewIndex(idx)}
                                                className={cn(
                                                    'h-1.5 p-0 rounded-full transition-all min-w-0 border-0',
                                                    activePreviewIndex === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>

                    {/* Slider Management Card */}
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="text-sm font-bold text-slate-900">Slider Management</CardTitle>
                                <CardDescription className="text-xs text-slate-500">
                                    Add, reorder, or remove slides.
                                </CardDescription>
                            </div>
                            <Button
                                size="sm"
                                onClick={handleAddSlide}
                                className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-8 px-3"
                            >
                                <Plus className="h-3.5 w-3.5" /> Add New Slide
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b uppercase text-[10px] tracking-wider">
                                        <tr>
                                            <th className="py-2.5 px-3 w-8 text-center">#</th>
                                            <th className="py-2.5 px-3">Preview</th>
                                            <th className="py-2.5 px-3">Title</th>
                                            <th className="py-2.5 px-3">Button</th>
                                            <th className="py-2.5 px-3 text-center">Status</th>
                                            <th className="py-2.5 px-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {slides.map((slide, idx) => {
                                            const isEditing = editingSlideId === slide.id;
                                            return (
                                                <tr
                                                    key={slide.id}
                                                    className={cn(
                                                        'transition-colors hover:bg-slate-50/80',
                                                        isEditing && 'bg-blue-50/40 font-medium'
                                                    )}
                                                >
                                                    {/* Index & Drag handle */}
                                                    <td className="py-3 px-3 text-slate-400">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <GripVertical className="h-3.5 w-3.5 text-slate-300 cursor-grab" />
                                                            <span className="font-bold text-slate-600">{idx + 1}</span>
                                                        </div>
                                                    </td>

                                                    {/* Preview Thumbnail */}
                                                    <td className="py-3 px-3">
                                                        <div className="h-9 w-14 rounded-md overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center shadow-xs">
                                                            {slide.imageUrl ? (
                                                                <img
                                                                    src={slide.imageUrl}
                                                                    alt={slide.title}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full bg-gradient-to-br from-[#1B0534] to-[#2D0B54] flex items-center justify-center">
                                                                    <ImageIcon className="h-3.5 w-3.5 text-white/50" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Title */}
                                                    <td className="py-3 px-3">
                                                        <p className="font-semibold text-slate-900 line-clamp-1">
                                                            {slide.title}
                                                        </p>
                                                        <span className="text-[10px] text-muted-foreground font-mono">
                                                            {slide.customUrl || '/'}
                                                        </span>
                                                    </td>

                                                    {/* Button */}
                                                    <td className="py-3 px-3 text-slate-700">
                                                        {slide.buttonLabel}
                                                    </td>

                                                    {/* Status Switch */}
                                                    <td className="py-3 px-3 text-center">
                                                        <div className="flex items-center justify-center">
                                                            <Switch
                                                                checked={slide.status}
                                                                onCheckedChange={(val) => {
                                                                    setSlides(
                                                                        slides.map((s) =>
                                                                            s.id === slide.id ? { ...s, status: val } : s
                                                                        )
                                                                    );
                                                                }}
                                                            />
                                                        </div>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="py-3 px-3 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => {
                                                                    setEditingSlideId(slide.id);
                                                                    setActivePreviewIndex(idx);
                                                                }}
                                                                className={cn(
                                                                    'h-7.5 w-7.5 rounded-lg p-0 transition-colors',
                                                                    isEditing
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
                                                                onClick={() => handleDeleteSlide(slide.id)}
                                                                className="h-7.5 w-7.5 rounded-lg p-0 text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Media Crop Dialog */}
            <MediaCropDialog
                open={cropOpen}
                imageUrl={cropImageRaw}
                fileName={cropFileName}
                mimeType={cropMimeType}
                onClose={() => setCropOpen(false)}
                onCropped={handleCropped}
            />
        </div>
    );
}
