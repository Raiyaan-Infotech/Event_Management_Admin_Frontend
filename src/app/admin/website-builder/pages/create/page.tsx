'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Save, ArrowLeft, Sparkles, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RichTextEditor } from '@/components/common/rich-text-editor';
import { cn } from '@/lib/utils';

export default function CreateCustomPage() {
    const [title, setTitle] = useState('');
    const [isPublished, setIsPublished] = useState(true);
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        if (!title.trim()) {
            toast.error('Page title is required.');
            return;
        }
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success(`Custom page "${title}" saved successfully!`);
        }, 500);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" asChild className="gap-1.5 h-9">
                        <Link href="/admin/website-builder/pages">
                            <ArrowLeft className="h-4 w-4" /> Back to Pages
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/5 text-primary text-xs">
                                <Sparkles className="h-3 w-3" /> Website Builder
                            </Badge>
                            <Badge variant="secondary" className="text-xs">Super Admin Panel</Badge>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight mt-1">Create Custom Page</h1>
                        <p className="text-xs text-muted-foreground">Add a new custom page to the website with rich text formatting.</p>
                    </div>
                </div>

                <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save & Publish Page'}
                </Button>
            </div>

            {/* Form Card */}
            <Card className="shadow-xs">
                <CardHeader className="border-b pb-4">
                    <CardTitle className="text-base font-bold">Page Details & Rich Content</CardTitle>
                    <CardDescription className="text-xs">Specify page title, published status switch, and format body content.</CardDescription>
                </CardHeader>
                <CardContent className="pt-5 space-y-5">
                    {/* Title & Status Switch Row */}
                    <div className="grid gap-6 md:grid-cols-12 items-end">
                        {/* Page Title (8 cols) */}
                        <div className="md:col-span-8 space-y-1.5">
                            <Label htmlFor="pageTitle" className="text-xs font-semibold text-foreground">Page Title</Label>
                            <Input
                                id="pageTitle"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Terms of Service, Event Guidelines, Booking Terms"
                                className="h-9.5 text-sm"
                            />
                        </div>

                        {/* Published Status Switch (4 cols) */}
                        <div className="md:col-span-4 space-y-1.5">
                            <Label className="text-xs font-semibold text-foreground">Published Status</Label>
                            <div className="flex items-center gap-3 rounded-lg border p-2 bg-muted/20 h-9.5">
                                <div className={cn(
                                    "flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded",
                                    isPublished ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
                                )}>
                                    <Eye className="h-3.5 w-3.5" />
                                    <span>{isPublished ? 'Published' : 'Draft Mode'}</span>
                                </div>
                                <Switch
                                    checked={isPublished}
                                    onCheckedChange={setIsPublished}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Rich Text Body Content */}
                    <div className="space-y-1.5">
                        <Label htmlFor="pageContent" className="text-xs font-semibold text-foreground">Body Content</Label>
                        <RichTextEditor
                            value={content}
                            onChange={setContent}
                            placeholder="Write page content here..."
                            className="min-h-[300px]"
                            variant="full"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
