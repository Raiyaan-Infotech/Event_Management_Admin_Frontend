'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Save,
    Upload,
    CheckCircle2,
    Lightbulb,
    Monitor,
    Smartphone,
    ExternalLink,
    Loader2,
    Heart,
    Sparkles,
    Gift,
    Cake,
    Calendar,
    MoreHorizontal,
    PartyPopper,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    BuilderCountedInput,
    BuilderCountedTextarea,
} from '../../_components/builder-field';
import { cn } from '@/lib/utils';
import {
    useTemplateCategories,
    useSaveTemplate,
    type Template,
} from '@/hooks/useTemplates';

const TEMPLATE_TYPES = [
    { id: 'wedding', label: 'Wedding', desc: 'Wedding & Engagement', icon: Heart },
    { id: 'engagement', label: 'Engagement', desc: 'Engagement & Roka Ceremony', icon: RingIcon },
    { id: 'birthday', label: 'Birthday', desc: 'Birthday Party & Celebration', icon: Cake },
    { id: 'anniversary', label: 'Anniversary', desc: 'Anniversary & Milestone', icon: Gift },
    { id: 'other', label: 'Other', desc: 'Other Events & Occasions', icon: MoreHorizontal },
];

const DESIGN_STYLES = [
    { id: 'classic', label: 'Classic', bg: 'from-amber-100 to-amber-50 border-amber-200' },
    { id: 'modern', label: 'Modern', bg: 'from-slate-900 to-slate-800 border-slate-700 text-white' },
    { id: 'minimal', label: 'Minimal', bg: 'from-stone-100 to-stone-50 border-stone-200' },
    { id: 'floral', label: 'Floral', bg: 'from-rose-100 to-pink-50 border-pink-200' },
    { id: 'traditional', label: 'Traditional', bg: 'from-red-900 to-amber-900 border-amber-500 text-amber-200' },
];

function RingIcon({ className }: { className?: string }) {
    return <Sparkles className={className} />;
}

export default function CreateTemplatePage() {
    const router = useRouter();
    const { data: categories } = useTemplateCategories();
    const saveTemplateMutation = useSaveTemplate();

    const [templateName, setTemplateName] = useState('');
    const [categoryId, setCategoryId] = useState<string>('');
    const [description, setDescription] = useState('');
    const [templateType, setTemplateType] = useState<Template['template_type']>('wedding');
    const [designStyle, setDesignStyle] = useState<Template['design_style']>('classic');
    const [primaryColor, setPrimaryColor] = useState('#6A38F5');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [templateFileUrl, setTemplateFileUrl] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [allowCustomize, setAllowCustomize] = useState(true);
    const [viewDevice, setViewDevice] = useState<'desktop' | 'mobile'>('mobile');

    const isSaving = saveTemplateMutation.isPending;

    const handleSave = (isDraft = false) => {
        if (!templateName.trim()) {
            toast.error('Template Name is required.');
            return;
        }

        saveTemplateMutation.mutate(
            {
                template_name: templateName,
                category_id: categoryId ? Number(categoryId) : null,
                description,
                template_type: templateType,
                design_style: designStyle,
                primary_color: primaryColor,
                thumbnail_url: thumbnailUrl || '/templates/royal-wedding.jpg',
                template_file_url: templateFileUrl || '/templates/royal-wedding-full.jpg',
                is_active: isActive,
                allow_customize: allowCustomize,
                is_draft: isDraft,
            },
            {
                onSuccess: () => {
                    router.push('/admin/website-builder/templates');
                },
            }
        );
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-foreground">Add Template</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Create a beautiful event invitation template that your users can customize.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/admin/website-builder/templates">
                        <Button variant="outline" size="sm" className="h-9 text-xs font-semibold">
                            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Templates
                        </Button>
                    </Link>
                    <Button
                        size="sm"
                        onClick={() => handleSave(false)}
                        disabled={isSaving}
                        className="h-9 px-5 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-1.5"
                    >
                        {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        {isSaving ? 'Saving...' : 'Save Template'}
                    </Button>
                </div>
            </div>

            {/* 2-Column Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column - 4 Form Sections */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Section 1: Basic Information */}
                    <Card className="shadow-xs border-border">
                        <CardContent className="p-5 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-black flex items-center justify-center">
                                    1
                                </span>
                                <h3 className="text-sm font-bold text-foreground">Basic Information</h3>
                            </div>

                            <BuilderCountedInput
                                label="Template Name"
                                required
                                placeholder="e.g., Royal Wedding Invitation"
                                value={templateName}
                                onChange={setTemplateName}
                                maxLength={100}
                                inputClassName="!h-10 text-xs"
                            />

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                                    Category <span className="text-rose-500">*</span>
                                </label>
                                <Select value={categoryId} onValueChange={setCategoryId}>
                                    <SelectTrigger className="h-10 text-xs border-border bg-card">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(categories || []).map((cat) => (
                                            <SelectItem key={cat.id} value={String(cat.id)}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <BuilderCountedTextarea
                                label="Description (Optional)"
                                placeholder="A short description about this template..."
                                value={description}
                                onChange={setDescription}
                                maxLength={200}
                                textareaClassName="min-h-[80px] text-xs py-2"
                            />
                        </CardContent>
                    </Card>

                    {/* Section 2: Template Type & Style */}
                    <Card className="shadow-xs border-border">
                        <CardContent className="p-5 space-y-5">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-black flex items-center justify-center">
                                    2
                                </span>
                                <h3 className="text-sm font-bold text-foreground">Template Type & Style</h3>
                            </div>

                            {/* Template Type Selector */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                                    Template Type <span className="text-rose-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                                    {TEMPLATE_TYPES.map((type) => {
                                        const IconComp = type.icon;
                                        const isSelected = templateType === type.id;
                                        return (
                                            <button
                                                key={type.id}
                                                type="button"
                                                onClick={() => setTemplateType(type.id as Template['template_type'])}
                                                className={cn(
                                                    'flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer relative',
                                                    isSelected
                                                        ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20 shadow-xs'
                                                        : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-muted/50'
                                                )}
                                            >
                                                <div className={cn(
                                                    'h-8 w-8 rounded-full flex items-center justify-center mb-1.5',
                                                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                                )}>
                                                    <IconComp className="h-4 w-4" />
                                                </div>
                                                <span className="text-xs font-bold leading-tight text-foreground">{type.label}</span>
                                                <span className="text-[9px] text-muted-foreground leading-tight mt-0.5">{type.desc}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Design Style Selector */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                                    Design Style <span className="text-rose-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                                    {DESIGN_STYLES.map((style) => {
                                        const isSelected = designStyle === style.id;
                                        return (
                                            <button
                                                key={style.id}
                                                type="button"
                                                onClick={() => setDesignStyle(style.id as Template['design_style'])}
                                                className={cn(
                                                    'p-2.5 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer relative',
                                                    isSelected
                                                        ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                                                        : 'border-border bg-card hover:border-primary/50'
                                                )}
                                            >
                                                <div className={cn(
                                                    'h-12 w-full rounded-lg bg-gradient-to-br border mb-2 flex items-center justify-center text-[10px] font-extrabold shadow-2xs',
                                                    style.bg
                                                )}>
                                                    {style.label}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className={cn(
                                                        'h-3.5 w-3.5 rounded-full border flex items-center justify-center',
                                                        isSelected ? 'border-primary bg-primary' : 'border-border'
                                                    )}>
                                                        {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                                                    </div>
                                                    <span className="text-xs font-semibold text-foreground">{style.label}</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Primary Color */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                                    Primary Color
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="h-10 w-12 rounded-lg border border-border cursor-pointer p-0.5 bg-card"
                                    />
                                    <Input
                                        type="text"
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="h-10 w-36 text-xs font-mono uppercase border-border"
                                    />
                                    <div
                                        className="h-10 w-10 rounded-lg shadow-xs border border-border flex items-center justify-center text-white"
                                        style={{ backgroundColor: primaryColor }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 3: Template Design Uploads */}
                    <Card className="shadow-xs border-border">
                        <CardContent className="p-5 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-black flex items-center justify-center">
                                    3
                                </span>
                                <h3 className="text-sm font-bold text-foreground">Template Design</h3>
                            </div>

                            {/* Thumbnail Upload */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                                    Template Thumbnail <span className="text-rose-500">*</span>
                                </label>
                                <div className="border-2 border-dashed border-border hover:border-primary/60 transition-colors rounded-xl p-6 text-center bg-muted/20 cursor-pointer">
                                    <Upload className="h-7 w-7 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-xs font-bold text-foreground">Click to upload thumbnail</p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">PNG, JPG or WEBP (Max. 2MB)</p>
                                    <p className="text-[10px] text-primary font-semibold mt-1">Recommended size: 800 x 1200px</p>
                                </div>
                            </div>

                            {/* Template File Upload */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                                    Template File <span className="text-rose-500">*</span>
                                </label>
                                <div className="border-2 border-dashed border-border hover:border-primary/60 transition-colors rounded-xl p-6 text-center bg-muted/20 cursor-pointer">
                                    <Upload className="h-7 w-7 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-xs font-bold text-foreground">Click to upload template file</p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">PNG, JPG or WEBP (Max. 10MB)</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">Upload the full template image or design</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 4: Settings */}
                    <Card className="shadow-xs border-border">
                        <CardContent className="p-5 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-black flex items-center justify-center">
                                    4
                                </span>
                                <h3 className="text-sm font-bold text-foreground">Settings</h3>
                            </div>

                            <div className="rounded-xl border border-border p-3.5 flex items-center justify-between bg-card">
                                <div>
                                    <p className="text-xs font-bold text-foreground">Make this template active</p>
                                    <p className="text-[11px] text-muted-foreground">Active templates will be visible to users.</p>
                                </div>
                                <Switch checked={isActive} onCheckedChange={setIsActive} />
                            </div>

                            <div className="rounded-xl border border-border p-3.5 flex items-center justify-between bg-card">
                                <div>
                                    <p className="text-xs font-bold text-foreground">Allow users to customize</p>
                                    <p className="text-[11px] text-muted-foreground">Users can edit text, images, colors and other elements.</p>
                                </div>
                                <Switch checked={allowCustomize} onCheckedChange={setAllowCustomize} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bottom Action Bar */}
                    <div className="flex items-center gap-3">
                        <Button
                            size="lg"
                            onClick={() => handleSave(false)}
                            disabled={isSaving}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-6 shadow-xs gap-1.5"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save Template
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => handleSave(true)}
                            disabled={isSaving}
                            className="font-bold text-xs px-6 border-border"
                        >
                            Save as Draft
                        </Button>
                        <Link href="/admin/website-builder/templates">
                            <Button variant="ghost" size="lg" className="text-xs font-semibold text-muted-foreground">
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Right Column - Live Preview & Tips */}
                <div className="lg:col-span-5 space-y-6 sticky top-6">
                    {/* Template Preview Card */}
                    <Card className="shadow-xs border-border overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                            <h4 className="text-xs font-bold text-foreground">Template Preview</h4>
                            <div className="flex items-center border border-border rounded-lg p-0.5 bg-card">
                                <button
                                    type="button"
                                    onClick={() => setViewDevice('desktop')}
                                    className={cn(
                                        'p-1 rounded-md text-xs transition-colors',
                                        viewDevice === 'desktop' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                                    )}
                                >
                                    <Monitor className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewDevice('mobile')}
                                    className={cn(
                                        'p-1 rounded-md text-xs transition-colors',
                                        viewDevice === 'mobile' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                                    )}
                                >
                                    <Smartphone className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>

                        <CardContent className="p-6 flex flex-col items-center justify-center bg-slate-50/50">
                            {/* Invitation Card Mockup */}
                            <div className="w-full max-w-xs rounded-2xl border-4 border-amber-200/60 bg-white p-6 shadow-md text-center space-y-3 relative overflow-hidden">
                                {/* Decorative floral corner elements */}
                                <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-rose-200/50 to-transparent rounded-br-full" />
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-rose-200/50 to-transparent rounded-bl-full" />

                                <p className="text-[9px] font-black uppercase tracking-widest text-amber-800">
                                    YOU ARE INVITED TO THE
                                </p>

                                <h2 className="text-2xl font-serif font-extrabold text-amber-950 italic">
                                    Wedding
                                </h2>

                                <p className="text-[10px] font-serif text-amber-800 italic">of</p>

                                <div className="space-y-0.5">
                                    <h3 className="text-base font-serif font-bold text-slate-900">
                                        John Smith
                                    </h3>
                                    <p className="text-xs font-serif italic text-amber-700">&</p>
                                    <h3 className="text-base font-serif font-bold text-slate-900">
                                        Emily Johnson
                                    </h3>
                                </div>

                                <div className="pt-2 border-t border-amber-200/80 space-y-1">
                                    <p className="text-[9px] font-bold tracking-wider text-slate-700">
                                        SUNDAY <span className="mx-1 font-black">20 | JULY | 2025</span>
                                    </p>
                                    <p className="text-[9px] text-slate-500">10:30 AM ONWARDS</p>
                                </div>

                                <div className="pt-2">
                                    <p className="text-[9px] font-black uppercase tracking-wider text-amber-900">
                                        GRAND ROYAL PALACE
                                    </p>
                                    <p className="text-[8px] text-slate-500">CHENNAI</p>
                                </div>
                            </div>

                            <Button variant="outline" size="sm" className="mt-4 text-xs font-semibold text-primary border-primary/30 w-full">
                                Preview Full Screen <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Tips Card */}
                    <Card className="shadow-xs border-border bg-gradient-to-br from-amber-500/5 to-primary/5">
                        <CardContent className="p-5 space-y-3">
                            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs">
                                <Lightbulb className="h-4 w-4" />
                                Tips for Great Templates
                            </div>

                            <ul className="space-y-2 text-xs text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                                    <span>Use high quality images (300 DPI)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                                    <span>Keep important text in the center</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                                    <span>Use readable fonts</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                                    <span>Ensure good contrast for visibility</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                                    <span>Test on both mobile and desktop</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
