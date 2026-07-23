'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, RotateCcw, Lock, FileText, Sparkles, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface WebPageItem {
    id: string;
    title: string;
    slug: string;
    type: 'system' | 'custom';
    status: 'published' | 'draft';
    updatedAt: string;
}

export default function PagesListPage() {
    const [pages, setPages] = useState<WebPageItem[]>([
        { id: '1', title: 'About Us', slug: 'about-us', type: 'system', status: 'published', updatedAt: '2026-07-20' },
        { id: '2', title: 'Services & Offerings', slug: 'services', type: 'system', status: 'published', updatedAt: '2026-07-21' },
        { id: '3', title: 'Events & Packages', slug: 'events', type: 'system', status: 'published', updatedAt: '2026-07-21' },
        { id: '4', title: 'Terms & Conditions', slug: 'terms-conditions', type: 'system', status: 'published', updatedAt: '2026-07-22' },
        { id: '5', title: 'Privacy Policy', slug: 'privacy-policy', type: 'system', status: 'published', updatedAt: '2026-07-22' },
        { id: '6', title: 'Maintenance Notice', slug: 'maintenance', type: 'system', status: 'published', updatedAt: '2026-07-22' },
        { id: '7', title: 'FAQ & Event Guide', slug: 'event-guide', type: 'custom', status: 'published', updatedAt: '2026-07-23' },
    ]);

    const handleResetSystemPage = (title: string) => {
        toast.info(`"${title}" system page content reset to default copy.`);
    };

    const togglePageStatus = (id: string) => {
        setPages(
            pages.map((p) => {
                if (p.id === id) {
                    if (p.type === 'system') {
                        toast.error('System pages cannot be set to draft mode.');
                        return p;
                    }
                    return { ...p, status: p.status === 'published' ? 'draft' : 'published' };
                }
                return p;
            })
        );
    };

    const handleDeletePage = (id: string) => {
        const page = pages.find((p) => p.id === id);
        if (page?.type === 'system') {
            toast.error('System pages cannot be deleted.');
            return;
        }
        setPages(pages.filter((p) => p.id !== id));
        toast.success('Custom page deleted.');
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
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">Website Pages Management</h1>
                    <p className="text-sm text-muted-foreground">Manage auto-seeded system pages and custom vendor website pages.</p>
                </div>

                <Button size="sm" asChild className="gap-1.5">
                    <Link href="/admin/website-builder/pages/create">
                        <Plus className="h-4 w-4" /> Create Custom Page
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">System & Custom Pages List</CardTitle>
                    <CardDescription>Auto-seeded system pages (fixed) and custom pages created for the website.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {pages.map((page) => (
                        <div key={page.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-semibold">{page.title}</h4>
                                    <span className="text-xs text-muted-foreground">/{page.slug}</span>
                                    <Badge variant={page.type === 'system' ? 'secondary' : 'outline'} className="text-[10px] capitalize">
                                        {page.type === 'system' && <Lock className="mr-1 h-2.5 w-2.5" />} {page.type}
                                    </Badge>
                                    <Badge variant={page.status === 'published' ? 'default' : 'secondary'} className="text-[10px] capitalize">
                                        {page.status}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">Last updated: {page.updatedAt}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                {page.type === 'system' ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="gap-1.5 text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
                                        onClick={() => handleResetSystemPage(page.title)}
                                    >
                                        <RotateCcw className="h-3.5 w-3.5" /> Reset Default
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => togglePageStatus(page.id)}
                                        >
                                            {page.status === 'published' ? 'Save Draft' : 'Publish'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDeletePage(page.id)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
