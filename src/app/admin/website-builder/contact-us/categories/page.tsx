'use client';

import { useState, useMemo } from 'react';
import { Save, RotateCcw, Sparkles, Search, Pencil, Trash2, HelpCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BuilderCountedInput, BuilderCountedTextarea } from '../../_components/builder-field';
import { cn } from '@/lib/utils';

interface CategoryItem {
    id: string;
    num: number;
    name: string;
    description: string;
    slug: string;
    status: boolean;
    order: number;
}

export default function ContactCategoriesPage() {
    // New Category Form State
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState(true);
    const [displayOrder, setDisplayOrder] = useState('3');

    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    // Existing Categories
    const [categories, setCategories] = useState<CategoryItem[]>([
        { id: '1', num: 1, name: 'Others', description: 'Other Section', slug: 'others', status: true, order: 1 },
        { id: '2', num: 2, name: 'fdsadgdg', description: 'dsgasgdg', slug: 'fdsadgdg', status: true, order: 2 },
    ]);

    const [isSaving, setIsSaving] = useState(false);

    const handleNameChange = (val: string) => {
        setName(val);
        if (!editingId) {
            setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
    };

    const handleSaveCategory = () => {
        if (!name.trim()) {
            toast.error('Category Name is required.');
            return;
        }

        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            if (editingId) {
                setCategories((prev) =>
                    prev.map((c) =>
                        c.id === editingId
                            ? { ...c, name, slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), description, status, order: parseInt(displayOrder) || 1 }
                            : c
                    )
                );
                toast.success(`Category "${name}" updated successfully.`);
                setEditingId(null);
            } else {
                const newCat: CategoryItem = {
                    id: Date.now().toString(),
                    num: categories.length + 1,
                    name,
                    slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    description,
                    status,
                    order: parseInt(displayOrder) || categories.length + 1,
                };
                setCategories([...categories, newCat]);
                toast.success(`Category "${name}" created successfully.`);
            }

            // Reset form
            setName('');
            setSlug('');
            setDescription('');
            setStatus(true);
            setDisplayOrder((categories.length + 2).toString());
        }, 400);
    };

    const handleEdit = (cat: CategoryItem) => {
        setEditingId(cat.id);
        setName(cat.name);
        setSlug(cat.slug);
        setDescription(cat.description);
        setStatus(cat.status);
        setDisplayOrder(cat.order.toString());
        toast.info(`Editing category "${cat.name}".`);
    };

    const handleDelete = (id: string) => {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        toast.success('Category deleted.');
    };

    const handleToggleStatus = (id: string, newStatus: boolean) => {
        setCategories((prev) =>
            prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
        );
    };

    const handleResetForm = () => {
        setName('');
        setSlug('');
        setDescription('');
        setStatus(true);
        setDisplayOrder('3');
        setEditingId(null);
        toast.info('Form reset.');
    };

    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return categories;
        const q = searchQuery.toLowerCase();
        return categories.filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
    }, [categories, searchQuery]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                <div>
                    
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">Contact Categories</h1>
                    <p className="text-sm text-muted-foreground">
                        Create categories used by the dynamic contact form.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => toast.info('Manage category topics for organizing customer contact form inquiries.')} className="h-8 px-3 text-xs font-semibold text-slate-600 border-slate-200 hover:bg-slate-50">
                        <HelpCircle className="h-3.5 w-3.5 text-slate-400 mr-1" /> How It Works
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleResetForm} className="h-8 px-3 text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50">
                        <RotateCcw className="h-3.5 w-3.5 text-rose-500 mr-1" /> Reset
                    </Button>
                    <Button size="sm" onClick={handleSaveCategory} disabled={isSaving} className="h-8 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
                        {isSaving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                        {isSaving ? 'Saving...' : 'Save Category'}
                    </Button>
                </div>
            </div>

            {/* Card 1: Add / Edit New Category Form */}
            <Card className="shadow-xs border-slate-200">
                <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-base font-bold text-foreground">
                        {editingId ? 'Edit Category' : 'Add New Category'}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                        Create the categories visitors can choose from in the dynamic contact form.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3 items-end">
                        <BuilderCountedInput
                            label="Category Name *"
                            value={name}
                            onChange={handleNameChange}
                            maxLength={80}
                            placeholder="e.g. Wedding Enquiry"
                        />

                        <BuilderCountedInput
                            label="Slug *"
                            value={slug}
                            onChange={setSlug}
                            maxLength={80}
                            placeholder="e.g. wedding-enquiry"
                        />

                        <BuilderCountedTextarea
                            label="Description"
                            value={description}
                            onChange={setDescription}
                            maxLength={1000}
                            rows={3}
                            placeholder="Write a short description..."
                        />

                        {/* Status */}
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-semibold text-slate-600">Status</Label>
                            <div className="flex h-9 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 shadow-xs">
                                <span className="text-xs font-bold text-slate-700">
                                    {status ? 'Active' : 'Inactive'}
                                </span>
                                <Switch checked={status} onCheckedChange={setStatus} />
                            </div>
                        </div>

                        {/* Display Order */}
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-semibold text-slate-600">Display Order</Label>
                            <Input
                                type="number"
                                value={displayOrder}
                                onChange={(e) => setDisplayOrder(e.target.value)}
                                className="h-9 text-xs font-mono border-slate-200"
                            />
                        </div>

                        {/* Action Buttons: Cancel and Save Category */}
                        <div className="grid grid-cols-2 gap-2 h-9">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleResetForm}
                                className="h-9 text-xs font-semibold border-slate-200 hover:bg-slate-50"
                            >
                                Cancel
                            </Button>

                            <Button
                                type="button"
                                size="sm"
                                onClick={handleSaveCategory}
                                disabled={isSaving}
                                className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold"
                            >
                                {isSaving ? 'Saving...' : 'Save Category'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Card 2: Contact Categories Table List */}
            <Card className="shadow-xs border-slate-200">
                <CardHeader className="pb-3 border-b">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <CardTitle className="text-base font-bold text-foreground">Contact Categories</CardTitle>

                        {/* Search Input */}
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search categories..."
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
                                    <TableHead className="w-[50px] font-bold text-[11px] text-slate-500 uppercase">#</TableHead>
                                    <TableHead className="font-bold text-[11px] text-slate-500 uppercase">CATEGORY</TableHead>
                                    <TableHead className="font-bold text-[11px] text-slate-500 uppercase w-[160px]">SLUG</TableHead>
                                    <TableHead className="font-bold text-[11px] text-slate-500 uppercase w-[120px]">STATUS</TableHead>
                                    <TableHead className="font-bold text-[11px] text-slate-500 uppercase w-[100px]">ORDER</TableHead>
                                    <TableHead className="font-bold text-[11px] text-slate-500 uppercase w-[100px] text-right">ACTIONS</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCategories.map((cat) => (
                                    <TableRow key={cat.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                                        {/* Column 1: # Index */}
                                        <TableCell className="font-bold text-xs text-slate-700 w-[50px]">
                                            {cat.num}
                                        </TableCell>

                                        {/* Column 2: Category Name & Description */}
                                        <TableCell>
                                            <div className="space-y-0.5">
                                                <span className="font-bold text-xs text-slate-800 block">{cat.name}</span>
                                                <span className="text-[11px] text-slate-400 block">{cat.description}</span>
                                            </div>
                                        </TableCell>

                                        {/* Column 3: Slug Pill */}
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-600 border border-slate-200">
                                                {cat.slug}
                                            </span>
                                        </TableCell>

                                        {/* Column 4: Status Toggle */}
                                        <TableCell>
                                            <Switch
                                                checked={cat.status}
                                                onCheckedChange={(val) => handleToggleStatus(cat.id, val)}
                                            />
                                        </TableCell>

                                        {/* Column 5: Order */}
                                        <TableCell className="font-bold text-xs text-slate-700">
                                            {cat.order}
                                        </TableCell>

                                        {/* Column 6: Actions */}
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleEdit(cat)}
                                                    className={cn(
                                                        'h-8 w-8 rounded-lg p-0 transition-colors',
                                                        editingId === cat.id
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
                                                    onClick={() => handleDelete(cat.id)}
                                                    className="h-8 w-8 rounded-lg p-0 text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
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
