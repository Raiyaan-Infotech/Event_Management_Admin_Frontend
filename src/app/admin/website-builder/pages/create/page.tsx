'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Save, ArrowLeft, Sparkles, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function CreateCustomPage() {
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [status, setStatus] = useState<'published' | 'draft'>('published');
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleTitleChange = (val: string) => {
        setTitle(val);
        setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    };

    const handleSave = () => {
        if (!title) {
            toast.error('Page title is required.');
            return;
        }
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success(`Custom page "${title}" created successfully!`);
        }, 500);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild className="gap-1.5">
                        <Link href="/admin/website-builder/pages"><ArrowLeft className="h-4 w-4" /> Back to Pages</Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Create Custom Page</h1>
                        <p className="text-sm text-muted-foreground">Add a new custom page to the website with rich content formatting.</p>
                    </div>
                </div>

                <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2">
                    <Save className="h-4 w-4" /> {isSaving ? 'Creating...' : 'Save & Publish Page'}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Page Details & Content</CardTitle>
                    <CardDescription>Specify title, URL slug, status, and rich text body content.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="pageTitle">Page Title</Label>
                            <Input id="pageTitle" value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="e.g. Booking Policy & Guidelines" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pageSlug">URL Slug</Label>
                            <Input id="pageSlug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="booking-policy" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Publish Status</Label>
                        <Select value={status} onValueChange={(val: 'published' | 'draft') => setStatus(val)}>
                            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="draft">Draft Mode</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="pageContent">Body Content</Label>
                        <Textarea id="pageContent" value={content} onChange={(e) => setContent(e.target.value)} rows={10} placeholder="Write page content here..." />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
