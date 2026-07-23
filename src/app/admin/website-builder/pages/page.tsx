'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Trash2, FileText, Sparkles, Pencil, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface WebPageItem {
    id: string;
    num: number;
    title: string;
    slug: string;
    type: 'Fixed' | 'Custom';
    status: 'Published' | 'Unpublished';
}

export default function PagesListPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [pages, setPages] = useState<WebPageItem[]>([
        { id: '1', num: 1, title: 'About Us', slug: 'about-us', type: 'Fixed', status: 'Published' },
        { id: '2', num: 2, title: 'Service', slug: 'service', type: 'Fixed', status: 'Published' },
        { id: '3', num: 3, title: 'Events', slug: 'events', type: 'Fixed', status: 'Published' },
        { id: '4', num: 4, title: 'Terms & Conditions', slug: 'terms-conditions', type: 'Fixed', status: 'Published' },
        { id: '5', num: 5, title: 'Privacy Policy', slug: 'privacy-policy', type: 'Fixed', status: 'Published' },
        { id: '6', num: 6, title: 'Maintenance', slug: 'maintenance', type: 'Fixed', status: 'Published' },
    ]);

    const filteredPages = useMemo(() => {
        if (!searchQuery.trim()) return pages;
        const q = searchQuery.toLowerCase();
        return pages.filter((p) => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
    }, [pages, searchQuery]);

    const handleDeletePage = (id: string) => {
        const page = pages.find((p) => p.id === id);
        if (page?.type === 'Fixed') {
            toast.error('Fixed system pages cannot be deleted.');
            return;
        }
        setPages((prev) => prev.filter((p) => p.id !== id));
        toast.success('Page deleted successfully.');
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/5 text-primary">
                            <Sparkles className="h-3 w-3" /> Website Builder
                        </Badge>
                        <Badge variant="secondary" className="text-xs">Super Admin Panel</Badge>
                    </div>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">Pages List</h1>
                    <p className="text-sm text-muted-foreground">View and manage all your website pages.</p>
                </div>

                <Button size="sm" asChild className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                    <Link href="/admin/website-builder/pages/create">
                        <Plus className="h-4 w-4" /> Create Page
                    </Link>
                </Button>
            </div>

            {/* Main Card */}
            <Card className="shadow-xs border-slate-200">
                <CardHeader className="pb-3 border-b">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-base font-bold text-foreground">Pages</CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">All fixed and dynamic pages of your website.</CardDescription>
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search pages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-8.5 pl-8 text-xs rounded-lg border-slate-200"
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/70">
                                <TableRow className="border-b border-slate-200">
                                    <TableHead className="w-[60px] font-bold text-[11px] text-slate-500 uppercase">#</TableHead>
                                    <TableHead className="font-bold text-[11px] text-slate-500 uppercase">PAGE</TableHead>
                                    <TableHead className="font-bold text-[11px] text-slate-500 uppercase w-[120px]">TYPE</TableHead>
                                    <TableHead className="font-bold text-[11px] text-slate-500 uppercase w-[140px]">STATUS</TableHead>
                                    <TableHead className="font-bold text-[11px] text-slate-500 uppercase w-[100px] text-right">ACTIONS</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPages.map((page) => (
                                    <TableRow key={page.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                                        {/* Column 1: # Index */}
                                        <TableCell className="font-bold text-xs text-slate-700 w-[60px]">
                                            {page.num}
                                        </TableCell>

                                        {/* Column 2: Page Title & Slug */}
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                                                    <FileText className="h-4 w-4" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <span className="font-bold text-xs text-slate-800 block">{page.title}</span>
                                                    <span className="text-[11px] text-slate-400 block font-mono">/{page.slug}</span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Column 3: Type (Yellow/Orange Pill) */}
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
                                                {page.type}
                                            </span>
                                        </TableCell>

                                        {/* Column 4: Status (Green Pill) */}
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 border border-emerald-200">
                                                {page.status}
                                            </span>
                                        </TableCell>

                                        {/* Column 5: Actions */}
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                    className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700"
                                                >
                                                    <Link href={`/admin/website-builder/pages/create?edit=${page.id}`}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Link>
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeletePage(page.id)}
                                                    disabled={page.type === 'Fixed'}
                                                    className="h-7 w-7 p-0 text-slate-300 hover:text-rose-600 disabled:opacity-40"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
