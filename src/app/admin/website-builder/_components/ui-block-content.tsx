'use client';

import { useState, useMemo, useRef } from 'react';
import {
    GripVertical,
    FileText,
    List,
    Monitor,
    Search,
    Settings,
    Palette,
    Mail,
    SlidersHorizontal,
    GalleryHorizontal,
    Folder,
    Star,
    Users,
    Eye,
    Lock,
    RotateCcw,
    Save,
    Sparkles,
    HelpCircle,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

type UiBlockFilter = 'all' | 'visible' | 'hidden';

interface UiBlockItem {
    id: string;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    visible: boolean;
    locked: boolean;
    required: boolean;
}

const INITIAL_BLOCKS: UiBlockItem[] = [
    { id: 'basic-information', label: 'Header', description: 'Website logo, company name, and header details.', icon: FileText, visible: true, locked: true, required: true },
    { id: 'nav-menu', label: 'Nav Menu', description: 'Website navigation menu settings.', icon: List, visible: true, locked: true, required: true },
    { id: 'ui-block', label: 'Web UI Block', description: 'Sidebar visibility and block ordering.', icon: Monitor, visible: true, locked: true, required: true },
    { id: 'seo', label: 'SEO Settings', description: 'Search engine metadata settings.', icon: Search, visible: true, locked: false, required: false },
    { id: 'footer', label: 'Footer Settings', description: 'Website footer configuration.', icon: Settings, visible: true, locked: true, required: true },
    { id: 'theme-color', label: 'Theme Color', description: 'Website theme color configuration.', icon: Palette, visible: true, locked: true, required: true },
    { id: 'pages', label: 'Pages', description: 'Create and manage website pages.', icon: FileText, visible: true, locked: false, required: true },
    { id: 'about-us', label: 'About Us', description: 'System page module.', icon: FileText, visible: true, locked: true, required: true },
    { id: 'service', label: 'Service', description: 'System page module.', icon: FileText, visible: true, locked: false, required: false },
    { id: 'events', label: 'Events', description: 'System page module.', icon: FileText, visible: true, locked: false, required: false },
    { id: 'terms-conditions', label: 'Terms & Conditions', description: 'System page module.', icon: FileText, visible: true, locked: true, required: true },
    { id: 'privacy-policy', label: 'Privacy Policy', description: 'System page module.', icon: FileText, visible: true, locked: true, required: true },
    { id: 'maintenance', label: 'Maintenance', description: 'System page module.', icon: FileText, visible: true, locked: true, required: true },
    { id: 'contact_us', label: 'Contact Us', description: 'Contact form builder module.', icon: Mail, visible: true, locked: false, required: true },
    { id: 'hero-section', label: 'Hero Section', description: 'Homepage hero section content.', icon: Monitor, visible: true, locked: false, required: true },
    { id: 'basic-slider', label: 'Simple Slider', description: 'Basic homepage slider.', icon: SlidersHorizontal, visible: false, locked: false, required: false },
    { id: 'advance-slider', label: 'Advance Slider', description: 'Advanced homepage slider.', icon: SlidersHorizontal, visible: true, locked: false, required: false },
    { id: 'gallery-images', label: 'Gallery Images', description: 'Gallery image management.', icon: GalleryHorizontal, visible: true, locked: false, required: true },
    { id: 'gallery-categories', label: 'Gallery Categories', description: 'Gallery category management.', icon: Folder, visible: true, locked: true, required: true },
    { id: 'testimonials', label: 'Testimonials', description: 'Customer testimonial management.', icon: Star, visible: true, locked: false, required: false },
    { id: 'basic-sponsors', label: 'Sponsors', description: 'Sponsor logo section.', icon: Users, visible: true, locked: false, required: false },
    { id: 'basic-clients', label: 'Clients', description: 'Client logo section.', icon: Users, visible: true, locked: false, required: false },
];

export function UIBlockContent() {
    const [blocks, setBlocks] = useState<UiBlockItem[]>(INITIAL_BLOCKS);
    const [filter, setFilter] = useState<UiBlockFilter>('all');
    const [isSaving, setIsSaving] = useState(false);

    const dragIndex = useRef<number | null>(null);

    const visibleCount = blocks.filter((item) => item.visible).length;
    const hiddenCount = blocks.length - visibleCount;

    const filteredBlocks = useMemo(() => {
        if (filter === 'visible') return blocks.filter((item) => item.visible);
        if (filter === 'hidden') return blocks.filter((item) => !item.visible);
        return blocks;
    }, [blocks, filter]);

    const handleVisibilityChange = (id: string, visible: boolean) => {
        setBlocks((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    if (item.required) {
                        toast.error('Required blocks cannot be hidden.');
                        return item;
                    }
                    return { ...item, visible };
                }
                return item;
            })
        );
    };

    const handleDragStart = (index: number) => {
        if (filter !== 'all' || blocks[index]?.locked) return;
        dragIndex.current = index;
    };

    const handleDrop = (targetIndex: number) => {
        if (filter !== 'all' || dragIndex.current === null) {
            dragIndex.current = null;
            return;
        }

        const fromIndex = dragIndex.current;
        dragIndex.current = null;

        if (fromIndex === targetIndex) return;

        const next = [...blocks];
        const moved = next[fromIndex];
        if (!moved || moved.locked) return;

        next.splice(fromIndex, 1);
        next.splice(targetIndex, 0, moved);
        setBlocks(next);
        toast.success(`Reordered ${moved.label}`);
    };

    const handleResetDefaults = () => {
        setBlocks(INITIAL_BLOCKS);
        setFilter('all');
        toast.success('UI blocks reset to default layout');
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Web UI Block configuration saved successfully!');
        }, 500);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                <div>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">Web UI Block</h1>
                    <p className="text-sm text-muted-foreground">Manage your website UI blocks and UI Block settings.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => toast.info('Organize and toggle visibility for website layout blocks.')} className="h-8 px-3 text-xs font-semibold text-slate-600 border-slate-200 hover:bg-slate-50">
                        <HelpCircle className="h-3.5 w-3.5 text-slate-400 mr-1" /> How It Works
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleResetDefaults} className="h-8 px-3 text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50">
                        <RotateCcw className="h-3.5 w-3.5 text-rose-500 mr-1" /> Reset
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving} className="h-8 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
                        {isSaving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            {/* Main Super Admin Card Table */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3 border-b">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <CardTitle className="text-lg font-bold">UI Blocks</CardTitle>
                            <CardDescription className="text-xs">Manage the sections that appear in this builder sidebar.</CardDescription>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleResetDefaults}
                            className="h-8 px-3 text-xs gap-1.5"
                        >
                            <RotateCcw className="h-3.5 w-3.5" /> Reset Layout
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Filter Bar */}
                    <div className="flex items-center gap-2 p-4 bg-muted/20 border-b">
                        <button
                            type="button"
                            onClick={() => setFilter('all')}
                            className={cn(
                                'inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-all',
                                filter === 'all'
                                    ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                                    : 'border-input bg-background text-muted-foreground hover:bg-muted'
                            )}
                        >
                            All Blocks <Badge className="text-[10px] bg-emerald-800/20 text-emerald-950 font-bold px-1.5 py-0 border-0">{blocks.length}</Badge>
                        </button>

                        <button
                            type="button"
                            onClick={() => setFilter('visible')}
                            className={cn(
                                'inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-all',
                                filter === 'visible'
                                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                                    : 'border-input bg-background text-muted-foreground hover:bg-muted'
                            )}
                        >
                            Visible <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0">{visibleCount}</Badge>
                        </button>

                        <button
                            type="button"
                            onClick={() => setFilter('hidden')}
                            className={cn(
                                'inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-all',
                                filter === 'hidden'
                                    ? 'border-rose-600 bg-rose-600 text-white shadow-xs'
                                    : 'border-input bg-background text-muted-foreground hover:bg-muted'
                            )}
                        >
                            Hidden <Badge variant="secondary" className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0">{hiddenCount}</Badge>
                        </button>
                    </div>

                    {/* Super Admin Styled Table */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/40">
                                <TableRow>
                                    <TableHead className="w-[40px]"></TableHead>
                                    <TableHead className="font-bold text-xs">BLOCK / SECTION</TableHead>
                                    <TableHead className="font-bold text-xs w-[180px]">STATUS</TableHead>
                                    <TableHead className="font-bold text-xs w-[100px] text-right">ACTIONS</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBlocks.map((item) => {
                                    const realIndex = blocks.findIndex((b) => b.id === item.id);
                                    const Icon = item.icon;
                                    const dragDisabled = filter !== 'all' || item.locked;

                                    return (
                                        <TableRow
                                            key={item.id}
                                            draggable={!dragDisabled}
                                            onDragStart={() => handleDragStart(realIndex)}
                                            onDragOver={(e) => {
                                                if (!dragDisabled) e.preventDefault();
                                            }}
                                            onDrop={() => handleDrop(realIndex)}
                                            className="group hover:bg-muted/30 transition-colors"
                                        >
                                            {/* Drag Handle */}
                                            <TableCell className="w-[40px] pr-0">
                                                <GripVertical
                                                    className={cn(
                                                        'h-4 w-4',
                                                        dragDisabled ? 'text-muted-foreground/30' : 'cursor-grab text-muted-foreground group-hover:text-foreground'
                                                    )}
                                                />
                                            </TableCell>

                                            {/* Block Icon + Label + Description + Required Badge */}
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-primary/10 text-primary">
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-sm text-foreground">{item.label}</span>
                                                            {item.required && (
                                                                <Badge variant="outline" className="text-[10px] border-primary/30 bg-primary/5 text-primary font-semibold">
                                                                    Required
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">{item.description}</p>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Status Column */}
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                                                        <Eye className="h-3.5 w-3.5" />
                                                        <span>{item.visible ? 'Visible' : 'Hidden'}</span>
                                                    </div>
                                                    <Switch
                                                        checked={item.visible}
                                                        disabled={item.required}
                                                        onCheckedChange={(val) => handleVisibilityChange(item.id, val)}
                                                    />
                                                </div>
                                            </TableCell>

                                            {/* Actions Column */}
                                            <TableCell className="text-right">
                                                {item.locked ? (
                                                    <Badge variant="outline" className="gap-1 text-[11px] font-semibold border-slate-200 bg-slate-100 text-slate-500 shadow-none">
                                                        <Lock className="h-3 w-3 text-slate-400" /> Locked
                                                    </Badge>
                                                ) : (
                                                    <span className="text-xs text-slate-400 font-mono">•••</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
