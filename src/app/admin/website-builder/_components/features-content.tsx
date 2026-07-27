'use client';

import { useState } from 'react';
import {
    Save,
    ArrowLeft,
    Plus,
    Trash2,
    Check,
    X,
    GripVertical,
    Upload,
    Monitor,
    Smartphone,
    Lightbulb,
    Loader2,
    Calendar,
    MapPin,
    Users,
    Image as ImageIcon,
    MessageSquare,
    Gift,
    Video,
    Music,
    Heart,
    Bell,
    Scan,
    QrCode,
    Sparkles,
    ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { useFeaturesData, useSaveFeaturesList, type FeatureItem } from '@/hooks/useFeatures';

const ICON_PRESETS = [
    { name: 'calendar', Icon: Calendar },
    { name: 'map-pin', Icon: MapPin },
    { name: 'users', Icon: Users },
    { name: 'image', Icon: ImageIcon },
    { name: 'message', Icon: MessageSquare },
    { name: 'gift', Icon: Gift },
    { name: 'video', Icon: Video },
    { name: 'music', Icon: Music },
    { name: 'heart', Icon: Heart },
    { name: 'bell', Icon: Bell },
    { name: 'scan', Icon: Scan },
    { name: 'qr-code', Icon: QrCode },
];

const DEFAULT_FEATURES: FeatureItem[] = [
    {
        id: '1',
        title: 'Beautiful Templates',
        short_description: 'Choose from 1000+ professionally designed templates for any occasion.',
        detailed_description: 'Explore beautifully crafted responsive templates with custom color schemes and typography for modern events.',
        icon: 'image',
        bullet_points_json: ['Wedding, Engagement, Birthday & more', 'Multi-theme & fully customizable', 'Modern & elegant designs'],
        show_in_menu: true,
        menu_order: 1,
        status: 'Active',
        sort_order: 1,
        created_by: 'Rohan Mehta',
        created_on: '18 May 2025, 11:30 AM',
    },
    {
        id: '2',
        title: 'All in One App',
        short_description: 'Everything you need in one place. No additional tools required.',
        detailed_description: 'Manage invitations, agendas, galleries, and real-time updates seamlessly in a unified app.',
        icon: 'calendar',
        bullet_points_json: ['Invitation, Agenda, Gallery & more', 'Manage all event details', 'Real-time updates'],
        show_in_menu: true,
        menu_order: 2,
        status: 'Active',
        sort_order: 2,
        created_by: 'Rohan Mehta',
        created_on: '18 May 2025, 11:30 AM',
    },
    {
        id: '3',
        title: 'Location & Navigation',
        short_description: 'Help your guests reach the venue easily with built-in navigation.',
        detailed_description: 'Google Maps integration with interactive directions and nearby parking spots for guests.',
        icon: 'map-pin',
        bullet_points_json: ['Google Maps Integration', 'Venue Details & Directions', 'Nearby Places & Parking Info'],
        show_in_menu: true,
        menu_order: 3,
        status: 'Active',
        sort_order: 3,
        created_by: 'Rohan Mehta',
        created_on: '18 May 2025, 11:30 AM',
    },
    {
        id: '4',
        title: 'Guest Management',
        short_description: 'Manage your guests and track responses in real-time.',
        detailed_description: 'Comprehensive guest lists, digital invitation tracking, and instant QR code check-in system.',
        icon: 'users',
        bullet_points_json: ['Guest List & Invitations', 'RSVP Tracking', 'Check-in & Attendance'],
        show_in_menu: true,
        menu_order: 4,
        status: 'Active',
        sort_order: 4,
        created_by: 'Rohan Mehta',
        created_on: '18 May 2025, 11:30 AM',
    },
    {
        id: '5',
        title: 'Agenda & Schedule',
        short_description: 'Create events, programs and schedules with beautiful timelines.',
        detailed_description: 'Help your guests never miss an important moment. Create multiple events, sessions and activities with date, time and venue details.',
        icon: 'calendar',
        bullet_points_json: ['Multiple Events & Sessions', 'Date & Time Management', 'Easy to Update', 'Beautiful Timeline View'],
        show_in_menu: true,
        menu_order: 6,
        status: 'Active',
        sort_order: 5,
        created_by: 'Rohan Mehta',
        created_on: '18 May 2025, 11:30 AM',
    },
    {
        id: '6',
        title: 'Live Streaming',
        short_description: 'Stream your special moments live for guests who can\'t attend.',
        detailed_description: 'High quality live video streaming integration with private guest link sharing.',
        icon: 'video',
        bullet_points_json: ['High-Quality Streaming', 'Secure & Private Links', 'Easy to Share'],
        show_in_menu: true,
        menu_order: 7,
        status: 'Active',
        sort_order: 6,
        created_by: 'Rohan Mehta',
        created_on: '18 May 2025, 11:30 AM',
    },
];

export function FeaturesBuilderContent() {
    const [viewMode, setViewMode] = useState<'grid' | 'form'>('grid');
    const [features, setFeatures] = useState<FeatureItem[]>(DEFAULT_FEATURES);
    const [selectedId, setSelectedId] = useState<string | number | null>('5');
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

    // Form State
    const [selectedIcon, setSelectedIcon] = useState('calendar');
    const [title, setTitle] = useState('Agenda & Schedule');
    const [shortDesc, setShortDesc] = useState('Create events, programs and schedules with beautiful timelines.');
    const [detailedDesc, setDetailedDesc] = useState('Help your guests never miss an important moment. Create multiple events, sessions and activities with date, time and venue details.');
    const [bullets, setBullets] = useState<string[]>([
        'Multiple Events & Sessions',
        'Date & Time Management',
        'Easy to Update',
        'Beautiful Timeline View',
    ]);
    const [newBulletText, setNewBulletText] = useState('');
    const [showInMenu, setShowInMenu] = useState(true);
    const [menuOrder, setMenuOrder] = useState('6');
    const [status, setStatus] = useState<'Active' | 'Inactive' | 'Draft'>('Active');

    // Drag and Drop Bullet State
    const [draggedBulletIdx, setDraggedBulletIdx] = useState<number | null>(null);

    const saveFeaturesMutation = useSaveFeaturesList();
    const isSaving = saveFeaturesMutation.isPending;

    const handleEditFeature = (item: FeatureItem) => {
        setSelectedId(item.id || null);
        setTitle(item.title);
        setShortDesc(item.short_description);
        setDetailedDesc(item.detailed_description || '');
        setSelectedIcon(item.icon || 'calendar');
        setBullets(item.bullet_points_json || []);
        setShowInMenu(item.show_in_menu);
        setMenuOrder(String(item.menu_order || 1));
        setStatus(item.status);
        setViewMode('form');
    };

    const handleCreateNew = () => {
        setSelectedId(null);
        setTitle('');
        setShortDesc('');
        setDetailedDesc('');
        setSelectedIcon('calendar');
        setBullets([]);
        setShowInMenu(true);
        setMenuOrder('1');
        setStatus('Active');
        setViewMode('form');
    };

    const handleAddBullet = () => {
        if (!newBulletText.trim()) return;
        setBullets((prev) => [...prev, newBulletText.trim()]);
        setNewBulletText('');
    };

    const handleRemoveBullet = (idx: number) => {
        setBullets((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleSaveCurrentFeature = () => {
        if (!title.trim()) {
            toast.error('Feature title is required.');
            return;
        }

        const newFeatureObj: FeatureItem = {
            id: selectedId || String(Date.now()),
            title,
            short_description: shortDesc,
            detailed_description: detailedDesc,
            icon: selectedIcon,
            bullet_points_json: bullets,
            show_in_menu: showInMenu,
            menu_order: parseInt(menuOrder) || 1,
            status,
            sort_order: features.length + 1,
            created_by: 'Rohan Mehta',
            created_on: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        };

        let updatedList: FeatureItem[];
        if (selectedId) {
            updatedList = features.map((f) => (f.id === selectedId ? newFeatureObj : f));
        } else {
            updatedList = [...features, newFeatureObj];
        }

        setFeatures(updatedList);
        saveFeaturesMutation.mutate(updatedList);
        setViewMode('grid');
    };

    const renderActiveIcon = (iconName: string, className = 'h-6 w-6 text-primary') => {
        const preset = ICON_PRESETS.find((p) => p.name === iconName);
        if (preset) {
            const IconComp = preset.Icon;
            return <IconComp className={className} />;
        }
        return <Calendar className={className} />;
    };

    return (
        <div className="space-y-4 text-foreground">
            {/* Top Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3.5">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground">
                        {viewMode === 'form' ? (selectedId ? 'Edit Feature' : 'Add Feature') : 'All Features Management'}
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        {viewMode === 'form'
                            ? 'Create or update a feature to display on your website and mobile app.'
                            : 'Manage powerful features that showcase your event experience to guests.'}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {viewMode === 'form' ? (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className="h-9 px-3 text-xs font-semibold border-border bg-card hover:bg-accent gap-1.5"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" /> Back to Features
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSaveCurrentFeature}
                                disabled={isSaving}
                                className="h-9 px-4 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-1.5"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save Feature
                            </Button>
                        </>
                    ) : (
                        <Button
                            size="sm"
                            onClick={handleCreateNew}
                            className="h-9 px-4 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-1.5"
                        >
                            <Plus className="h-4 w-4" /> Add New Feature
                        </Button>
                    )}
                </div>
            </div>

            {/* View 1: 12-Card Grid View (Mockup 2) */}
            {viewMode === 'grid' && (
                <div className="space-y-6">
                    <div className="text-center space-y-1.5 max-w-xl mx-auto py-2">
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            FEATURES
                        </Badge>
                        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">All the Features You Need</h2>
                        <p className="text-xs text-muted-foreground">
                            Powerful tools to create, manage and enhance your event experience.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {features.map((item) => (
                            <Card
                                key={item.id}
                                className="relative border-border bg-card hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
                            >
                                <CardHeader className="p-4 pb-2 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                                            {renderActiveIcon(item.icon, 'h-5 w-5 text-primary')}
                                        </div>
                                        <Badge
                                            variant={item.status === 'Active' ? 'default' : 'secondary'}
                                            className={cn(
                                                'text-[10px] font-bold px-2 py-0.5',
                                                item.status === 'Active' && 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                            )}
                                        >
                                            {item.status}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-base font-bold text-card-foreground group-hover:text-primary transition-colors">
                                        {item.title}
                                    </CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                                        {item.short_description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="p-4 pt-0 space-y-3">
                                    {item.bullet_points_json && item.bullet_points_json.length > 0 && (
                                        <ul className="space-y-1.5 text-xs text-muted-foreground">
                                            {item.bullet_points_json.map((pt, i) => (
                                                <li key={i} className="flex items-center gap-1.5">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                                    <span className="truncate">{pt}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    <div className="pt-2 border-t border-border flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => handleEditFeature(item)}
                                            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                                        >
                                            View Feature <ArrowRight className="h-3 w-3" />
                                        </button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setFeatures((prev) => prev.filter((f) => f.id !== item.id))}
                                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* View 2: 5-Section Form View + Live Preview (Mockup 1) */}
            {viewMode === 'form' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: 5 Form Sections */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Section 1: Basic Information */}
                        <Card className="border-border bg-card shadow-xs">
                            <CardHeader className="py-3.5 px-4 border-b border-border flex items-center gap-3">
                                <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs shrink-0">
                                    1
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-bold text-foreground">Basic Information</CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground">Select icon, title, and short summary</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-foreground">
                                        Feature Icon <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {ICON_PRESETS.map(({ name, Icon }) => (
                                            <button
                                                key={name}
                                                type="button"
                                                onClick={() => setSelectedIcon(name)}
                                                className={cn(
                                                    'flex h-12 items-center justify-center rounded-xl border p-2 transition-all',
                                                    selectedIcon === name
                                                        ? 'border-primary bg-primary/10 ring-2 ring-primary/20 text-primary'
                                                        : 'border-border bg-card hover:bg-accent text-muted-foreground'
                                                )}
                                            >
                                                <Icon className="h-5 w-5" />
                                            </button>
                                        ))}
                                        <div className="col-span-2 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 p-2 text-center">
                                            <Upload className="h-4 w-4 text-muted-foreground mb-1" />
                                            <span className="text-[10px] font-bold text-foreground">Upload Custom</span>
                                            <span className="text-[9px] text-muted-foreground">SVG/PNG Max 2MB</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-xs font-bold text-foreground">
                                            Title <span className="text-destructive">*</span>
                                        </Label>
                                        <span className="text-[10px] font-semibold text-muted-foreground">{title.length}/50</span>
                                    </div>
                                    <Input
                                        maxLength={50}
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Agenda & Schedule"
                                        className="h-9 text-xs"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-xs font-bold text-foreground">
                                            Short Description <span className="text-destructive">*</span>
                                        </Label>
                                        <span className="text-[10px] font-semibold text-muted-foreground">{shortDesc.length}/120</span>
                                    </div>
                                    <Textarea
                                        maxLength={120}
                                        rows={2}
                                        value={shortDesc}
                                        onChange={(e) => setShortDesc(e.target.value)}
                                        placeholder="Brief 1-2 sentence description"
                                        className="text-xs"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section 2: Feature Description */}
                        <Card className="border-border bg-card shadow-xs">
                            <CardHeader className="py-3.5 px-4 border-b border-border flex items-center gap-3">
                                <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs shrink-0">
                                    2
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-bold text-foreground">Feature Description</CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground">Comprehensive detailed description</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label className="text-xs font-bold text-foreground">
                                        Detailed Description <span className="text-destructive">*</span>
                                    </Label>
                                    <span className="text-[10px] font-semibold text-muted-foreground">{detailedDesc.length}/500</span>
                                </div>
                                <Textarea
                                    maxLength={500}
                                    rows={4}
                                    value={detailedDesc}
                                    onChange={(e) => setDetailedDesc(e.target.value)}
                                    placeholder="Explain how this feature helps guests or event hosts..."
                                    className="text-xs"
                                />
                            </CardContent>
                        </Card>

                        {/* Section 3: Bullet Points (Key Benefits) */}
                        <Card className="border-border bg-card shadow-xs">
                            <CardHeader className="py-3.5 px-4 border-b border-border flex items-center gap-3">
                                <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs shrink-0">
                                    3
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-bold text-foreground">Bullet Points (Key Benefits)</CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground">Highlight top features or capabilities</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                <div className="space-y-2">
                                    {bullets.map((bullet, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2 text-xs"
                                        >
                                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
                                            <span className="flex-1 font-medium text-foreground">{bullet}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveBullet(idx)}
                                                className="text-muted-foreground hover:text-destructive p-1"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add bullet point (e.g. Easy to Update)"
                                        value={newBulletText}
                                        onChange={(e) => setNewBulletText(e.target.value)}
                                        className="h-9 text-xs flex-1"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddBullet();
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddBullet}
                                        className="h-9 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10"
                                    >
                                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Bullet Point
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section 4: Display Settings */}
                        <Card className="border-border bg-card shadow-xs">
                            <CardHeader className="py-3.5 px-4 border-b border-border flex items-center gap-3">
                                <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs shrink-0">
                                    4
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-bold text-foreground">Display Settings</CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground">Menu visibility, order, and status</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-foreground">
                                        Show in Menu <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowInMenu(true)}
                                            className={cn(
                                                'flex-1 rounded-xl border p-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-all',
                                                showInMenu
                                                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                                                    : 'border-border bg-card hover:bg-accent text-muted-foreground'
                                            )}
                                        >
                                            <span className={cn('h-2.5 w-2.5 rounded-full', showInMenu ? 'bg-primary' : 'bg-muted')} />
                                            Yes, show in menu
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowInMenu(false)}
                                            className={cn(
                                                'flex-1 rounded-xl border p-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-all',
                                                !showInMenu
                                                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                                                    : 'border-border bg-card hover:bg-accent text-muted-foreground'
                                            )}
                                        >
                                            <span className={cn('h-2.5 w-2.5 rounded-full', !showInMenu ? 'bg-primary' : 'bg-muted')} />
                                            No, hide from menu
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-bold text-foreground">
                                            Menu Order <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            type="number"
                                            value={menuOrder}
                                            onChange={(e) => setMenuOrder(e.target.value)}
                                            className="h-9 text-xs"
                                        />
                                        <span className="text-[10px] text-muted-foreground">Lower numbers show first</span>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs font-bold text-foreground">
                                            Status <span className="text-destructive">*</span>
                                        </Label>
                                        <div className="flex gap-2">
                                            {(['Active', 'Inactive'] as const).map((st) => (
                                                <button
                                                    key={st}
                                                    type="button"
                                                    onClick={() => setStatus(st)}
                                                    className={cn(
                                                        'flex-1 rounded-lg border p-2 text-xs font-semibold transition-all',
                                                        status === st
                                                            ? 'border-primary bg-primary/10 text-primary font-bold'
                                                            : 'border-border bg-card text-muted-foreground hover:bg-accent'
                                                    )}
                                                >
                                                    {st}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section 5: Additional Options */}
                        <Card className="border-border bg-card shadow-xs">
                            <CardHeader className="py-3.5 px-4 border-b border-border flex items-center gap-3">
                                <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs shrink-0">
                                    5
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-bold text-foreground">Additional Options (Optional)</CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground">Feature image or media illustration</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-2">
                                <Label className="text-xs font-bold text-foreground">Feature Image</Label>
                                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 p-6 text-center hover:bg-muted/40 transition-all cursor-pointer">
                                    <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                                    <span className="text-xs font-semibold text-foreground">Click to upload image</span>
                                    <span className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG or WEBP (Max 2MB) — Recommended size: 600 x 400px</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bottom Action Bar */}
                        <div className="flex items-center gap-3 pt-2">
                            <Button
                                size="sm"
                                onClick={handleSaveCurrentFeature}
                                disabled={isSaving}
                                className="h-9 px-5 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-1.5"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save Feature
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className="h-9 px-4 text-xs font-semibold border-border bg-card hover:bg-accent"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>

                    {/* Right Column: Live Preview & Summary Panel */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Live Preview Card */}
                        <Card className="border-border bg-card shadow-xs sticky top-4">
                            <CardHeader className="py-3.5 px-4 border-b border-border flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold text-card-foreground">Live Preview</CardTitle>
                                <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewDevice('desktop')}
                                        className={cn('p-1 rounded-md transition-all', previewDevice === 'desktop' ? 'bg-card shadow-xs text-primary' : 'text-muted-foreground')}
                                    >
                                        <Monitor className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewDevice('mobile')}
                                        className={cn('p-1 rounded-md transition-all', previewDevice === 'mobile' ? 'bg-card shadow-xs text-primary' : 'text-muted-foreground')}
                                    >
                                        <Smartphone className="h-4 w-4" />
                                    </button>
                                </div>
                            </CardHeader>
                            <CardContent className={cn('p-6 space-y-4 transition-all', previewDevice === 'mobile' && 'max-w-[320px] mx-auto border-x border-border rounded-2xl my-2')}>
                                <div className="text-center space-y-3 p-6 rounded-2xl border border-primary/20 bg-primary/5">
                                    <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-xs">
                                        {renderActiveIcon(selectedIcon, 'h-7 w-7 text-primary')}
                                    </div>
                                    <h3 className="text-lg font-extrabold text-foreground">{title || 'Feature Title'}</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{shortDesc || 'Short description will appear here...'}</p>
                                </div>

                                {bullets.length > 0 && (
                                    <div className="space-y-2 pt-2">
                                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Key Benefits</Label>
                                        <ul className="space-y-2 text-xs text-foreground font-medium">
                                            {bullets.map((b, i) => (
                                                <li key={i} className="flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                                                    <span>{b}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Feature Summary Card */}
                        <Card className="border-border bg-card shadow-xs">
                            <CardHeader className="py-3 px-4 border-b border-border">
                                <CardTitle className="text-sm font-bold text-card-foreground">Feature Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-2.5 text-xs">
                                <div className="flex justify-between border-b border-border pb-1.5">
                                    <span className="text-muted-foreground">Title</span>
                                    <span className="font-bold text-foreground">{title || '-'}</span>
                                </div>
                                <div className="flex justify-between border-b border-border pb-1.5">
                                    <span className="text-muted-foreground">Menu Order</span>
                                    <span className="font-bold text-foreground">{menuOrder}</span>
                                </div>
                                <div className="flex justify-between border-b border-border pb-1.5">
                                    <span className="text-muted-foreground">Status</span>
                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold px-2 py-0.5">
                                        {status}
                                    </Badge>
                                </div>
                                <div className="flex justify-between border-b border-border pb-1.5">
                                    <span className="text-muted-foreground">Show in Menu</span>
                                    <span className="font-bold text-foreground">{showInMenu ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="flex justify-between border-b border-border pb-1.5">
                                    <span className="text-muted-foreground">Created By</span>
                                    <span className="font-semibold text-foreground">Rohan Mehta</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Created On</span>
                                    <span className="font-semibold text-foreground">18 May 2025, 11:30 AM</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tips Card */}
                        <Card className="border-border bg-amber-500/5 shadow-xs">
                            <CardContent className="p-4 space-y-2">
                                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                                    <Lightbulb className="h-4 w-4" /> Tips for High-Converting Features
                                </div>
                                <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-4">
                                    <li>Use a clear and meaningful title (2-4 words)</li>
                                    <li>Choose an icon that represents the feature well</li>
                                    <li>Keep short descriptions concise for fast scanning</li>
                                    <li>Add bullet points to highlight key guest benefits</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
