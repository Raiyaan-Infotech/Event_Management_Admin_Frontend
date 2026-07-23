'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ArrowDown,
    ArrowUp,
    Eye,
    EyeOff,
    LayoutGrid,
    Lock,
    Pencil,
    RotateCcw,
    Save,
    Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

interface UIBlock {
    id: string;
    key: string;
    title: string;
    description: string;
    category: string;
    isVisible: boolean;
    isLocked: boolean;
    sortOrder: number;
    editUrl: string;
}

const INITIAL_BLOCKS: UIBlock[] = [
    { id: '1', key: 'header-nav', title: 'Header & Navigation', description: 'Site logo, top bar contacts, social links, and main menu links.', category: 'Navigation', isVisible: true, isLocked: true, sortOrder: 1, editUrl: '/admin/website-builder/header' },
    { id: '2', key: 'hero-section', title: 'Hero Section', description: 'Primary banner with headline, eyebrow badge, description, and Call-to-Action buttons.', category: 'Banner', isVisible: true, isLocked: false, sortOrder: 2, editUrl: '/admin/website-builder/hero-section' },
    { id: '3', key: 'advance-slider', title: 'Advance Image Slider', description: 'Interactive slide showcase with captions, links, and background overlays.', category: 'Media Showcase', isVisible: true, isLocked: false, sortOrder: 3, editUrl: '/admin/website-builder/advance-slider' },
    { id: '4', key: 'gallery-images', title: 'Event Gallery & Categories', description: 'Filterable photo gallery organized by event category tags.', category: 'Media Showcase', isVisible: true, isLocked: false, sortOrder: 4, editUrl: '/admin/website-builder/gallery' },
    { id: '5', key: 'testimonials', title: 'Customer Testimonials', description: 'Client reviews carousel with star ratings and client avatars.', category: 'Social Proof', isVisible: true, isLocked: false, sortOrder: 5, editUrl: '/admin/website-builder/testimonials' },
    { id: '6', key: 'logo-wall', title: 'Clients & Sponsors Marquee', description: 'Continuous scrolling logo wall featuring key partners and client brands.', category: 'Social Proof', isVisible: true, isLocked: false, sortOrder: 6, editUrl: '/admin/website-builder/sponsors' },
    { id: '7', key: 'contact-us', title: 'Contact Us & Map', description: 'Contact form, location details, phone/email, and Google Maps embed.', category: 'Contact', isVisible: true, isLocked: false, sortOrder: 7, editUrl: '/admin/website-builder/contact-us' },
    { id: '8', key: 'footer-section', title: 'Footer & Quick Links', description: 'Footer columns, legal links, newsletter subscription, and copyright notice.', category: 'Navigation', isVisible: true, isLocked: true, sortOrder: 8, editUrl: '/admin/website-builder/footer' },
];

export function UIBlockContent() {
    const [blocks, setBlocks] = useState<UIBlock[]>(INITIAL_BLOCKS);
    const [isSaving, setIsSaving] = useState(false);

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        const newBlocks = [...blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newBlocks.length) return;

        if (newBlocks[index].isLocked || newBlocks[targetIndex].isLocked) {
            toast.error('Locked sections (Header & Footer) cannot be reordered from their pinned positions.');
            return;
        }

        const temp = newBlocks[index];
        newBlocks[index] = newBlocks[targetIndex];
        newBlocks[targetIndex] = temp;

        newBlocks.forEach((b, idx) => { b.sortOrder = idx + 1; });
        setBlocks(newBlocks);
    };

    const toggleVisibility = (id: string) => {
        setBlocks((prev) =>
            prev.map((b) => {
                if (b.id === id) {
                    if (b.isLocked) {
                        toast.error('Pinned system sections cannot be hidden.');
                        return b;
                    }
                    return { ...b, isVisible: !b.isVisible };
                }
                return b;
            })
        );
    };

    const handleSaveOrder = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success('UI Block order and visibility layout saved successfully!');
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
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">Web UI Block Reordering</h1>
                    <p className="text-sm text-muted-foreground">Manage section sequence, show/hide blocks, and home layout structure.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setBlocks(INITIAL_BLOCKS)} className="gap-2">
                        <RotateCcw className="h-4 w-4" /> Reset Layout
                    </Button>
                    <Button size="sm" onClick={handleSaveOrder} disabled={isSaving} className="gap-2">
                        <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Block Layout'}
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Homepage Section Ordering</CardTitle>
                    <CardDescription>Use arrow controls to reorder sections. Pinned sections remain at the top/bottom.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {blocks.map((block, index) => (
                        <div
                            key={block.id}
                            className={`flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4 transition-all ${
                                !block.isVisible ? 'bg-muted/40 opacity-70' : 'bg-card hover:border-primary/40'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-semibold text-muted-foreground">
                                    #{index + 1}
                                </div>
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-foreground">{block.title}</h3>
                                        <Badge variant="outline" className="text-[10px]">{block.category}</Badge>
                                        {block.isLocked && (
                                            <Badge variant="secondary" className="gap-1 text-[10px] text-blue-600">
                                                <Lock className="h-2.5 w-2.5" /> Pinned
                                            </Badge>
                                        )}
                                        {block.isVisible ? (
                                            <Badge variant="default" className="bg-emerald-600 text-[10px]">Visible</Badge>
                                        ) : (
                                            <Badge variant="destructive" className="text-[10px]">Hidden</Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{block.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 rounded-md border bg-background p-1">
                                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={index === 0 || block.isLocked || blocks[index - 1]?.isLocked} onClick={() => moveBlock(index, 'up')}>
                                        <ArrowUp className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={index === blocks.length - 1 || block.isLocked || blocks[index + 1]?.isLocked} onClick={() => moveBlock(index, 'down')}>
                                        <ArrowDown className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2 border-l pl-3">
                                    <span className="text-xs font-medium text-muted-foreground">Show</span>
                                    <Switch checked={block.isVisible} disabled={block.isLocked} onCheckedChange={() => toggleVisibility(block.id)} />
                                </div>
                                <Button type="button" variant="outline" size="sm" asChild className="gap-1.5">
                                    <Link href={block.editUrl}><Pencil className="h-3.5 w-3.5" /> Edit Form</Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
