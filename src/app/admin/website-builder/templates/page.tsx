'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    GripVertical,
    Tag,
    Loader2,
    LayoutGrid,
    List,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
    useTemplates,
    useTemplateCategories,
    useSaveTemplate,
    useDeleteTemplate,
    type Template,
} from '@/hooks/useTemplates';

export default function TemplatesPage() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    const { data: dbTemplates, isLoading } = useTemplates({
        template_type: selectedType,
        search: searchQuery,
    });
    const { data: categories } = useTemplateCategories();
    const saveTemplateMutation = useSaveTemplate();
    const deleteTemplateMutation = useDeleteTemplate();

    const templates = dbTemplates || [];

    const handleDelete = (id?: number) => {
        if (!id) return;
        deleteTemplateMutation.mutate(id);
    };

    const getCategoryName = (template: Template) => {
        if (template.category_name && isNaN(Number(template.category_name))) {
            return template.category_name;
        }
        const found = (categories || []).find(
            (c) => String(c.id) === String(template.category_id) || String(c.id) === String(template.category_name)
        );
        return found ? found.name : template.category_name && isNaN(Number(template.category_name)) ? template.category_name : 'General';
    };

    const filteredTemplates = templates.filter((t) => {
        const catName = getCategoryName(t);
        const matchesCategory =
            selectedCategory === 'all' ||
            String(t.category_id) === selectedCategory ||
            String(t.category_name).toLowerCase() === selectedCategory.toLowerCase() ||
            catName.toLowerCase() === selectedCategory.toLowerCase();

        const matchesType = selectedType === 'all' || t.template_type === selectedType;
        const matchesSearch =
            t.template_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            catName.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesType && matchesSearch;
    });

    return (
        <div className="space-y-5 max-w-7xl mx-auto pb-12">
            {/* Header Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
                <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                        <span>Dashboard</span>
                        <span>›</span>
                        <span>Website Builder</span>
                        <span>›</span>
                        <span className="font-semibold text-foreground">Event Templates</span>
                    </div>
                    <h1 className="text-xl font-extrabold tracking-tight text-foreground">Event Templates</h1>
                    <p className="text-xs text-muted-foreground">
                        Create, organize, and manage promotional event invitation templates for your platform website.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/admin/website-builder/templates/categories">
                        <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-semibold border-border">
                            <Tag className="h-3.5 w-3.5 mr-1" /> Categories
                        </Button>
                    </Link>
                    <Link href="/admin/website-builder/templates/create">
                        <Button size="sm" className="h-8 px-4 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-1.5">
                            <Plus className="h-3.5 w-3.5" /> Add Template
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Content Card with Search Bar & Management Table */}
            <Card className="shadow-xs border-border bg-card">
                <CardHeader className="py-3 px-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-muted/40">
                    <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
                        <span>Template Management ({filteredTemplates.length})</span>
                    </CardTitle>

                    {/* Filters & Actions Bar */}
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-56">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Search templates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-8 pl-8 text-xs border-border bg-card text-foreground placeholder:text-muted-foreground"
                            />
                        </div>

                        {/* Category Select Filter */}
                        <div className="w-36">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="h-8 text-xs border-border bg-card text-foreground">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {(categories || []).map((c) => (
                                        <SelectItem key={c.id || c.name} value={c.name}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Type Select Filter */}
                        <div className="w-32">
                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger className="h-8 text-xs border-border bg-card text-foreground">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="wedding">Wedding</SelectItem>
                                    <SelectItem value="engagement">Engagement</SelectItem>
                                    <SelectItem value="birthday">Birthday</SelectItem>
                                    <SelectItem value="anniversary">Anniversary</SelectItem>
                                    <SelectItem value="baby_shower">Baby Shower</SelectItem>
                                    <SelectItem value="corporate">Corporate</SelectItem>
                                    <SelectItem value="festival">Festival</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* View Switcher (Table vs Grid) */}
                        <div className="flex items-center border border-border rounded-lg p-0.5 bg-card">
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                className={cn(
                                    'p-1 rounded-md text-xs transition-colors',
                                    viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                                )}
                                title="Table View"
                            >
                                <List className="h-3.5 w-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    'p-1 rounded-md text-xs transition-colors',
                                    viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                                )}
                                title="Grid View"
                            >
                                <LayoutGrid className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {viewMode === 'table' ? (
                        /* Management Table View */
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-muted/50 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
                                    <tr>
                                        <th className="py-2.5 px-3 w-12 text-center">#</th>
                                        <th className="py-2.5 px-3 w-16 text-center">Preview</th>
                                        <th className="py-2.5 px-3">Template Name</th>
                                        <th className="py-2.5 px-3">Category</th>
                                        <th className="py-2.5 px-3 text-center">Type</th>
                                        <th className="py-2.5 px-3 text-center">Style</th>
                                        <th className="py-2.5 px-3 text-center">Customizable</th>
                                        <th className="py-2.5 px-3 text-center">Status</th>
                                        <th className="py-2.5 px-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={9} className="py-8 text-center text-xs text-muted-foreground">
                                                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                                                Loading templates...
                                            </td>
                                        </tr>
                                    ) : filteredTemplates.length > 0 ? (
                                        filteredTemplates.map((template, idx) => (
                                            <tr key={template.id || idx} className="hover:bg-muted/40 transition-colors">
                                                <td className="py-3 px-3 text-center text-muted-foreground font-mono">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50" />
                                                        <span>{idx + 1}</span>
                                                    </div>
                                                </td>

                                                {/* Preview Thumbnail Box */}
                                                <td className="py-3 px-3 text-center">
                                                    {template.thumbnail_url ? (
                                                        <img
                                                            src={template.thumbnail_url}
                                                            alt={template.template_name}
                                                            className="h-12 w-9 rounded-md border border-border shadow-2xs mx-auto object-cover"
                                                        />
                                                    ) : (
                                                        <div
                                                            className="h-12 w-9 rounded-md border border-border shadow-2xs mx-auto flex items-center justify-center text-[8px] text-white font-serif font-bold p-1 text-center truncate overflow-hidden"
                                                            style={{ backgroundColor: template.primary_color || '#6A38F5' }}
                                                        >
                                                            {template.template_name.slice(0, 8)}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Template Name & Description */}
                                                <td className="py-3 px-3 font-semibold text-foreground">
                                                    <div className="flex items-center gap-1.5">
                                                        <span>{template.template_name}</span>
                                                        {template.is_popular ? (
                                                            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-amber-500/15 text-amber-600 border border-amber-500/30">
                                                                🔥 Popular
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                    {template.description ? (
                                                        <p className="text-[10px] font-normal text-muted-foreground truncate max-w-sm">
                                                            {template.description}
                                                        </p>
                                                    ) : null}
                                                </td>

                                                {/* Category */}
                                                <td className="py-3 px-3">
                                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary/10 text-primary border border-primary/20 inline-block">
                                                        {getCategoryName(template)}
                                                    </span>
                                                </td>

                                                {/* Type */}
                                                <td className="py-3 px-3 text-center">
                                                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-muted text-muted-foreground capitalize border border-border inline-block">
                                                        {template.template_type}
                                                    </span>
                                                </td>

                                                {/* Style */}
                                                <td className="py-3 px-3 text-center">
                                                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-purple-500/10 text-purple-600 capitalize border border-purple-500/20 inline-block">
                                                        {template.design_style}
                                                    </span>
                                                </td>

                                                {/* Customizable */}
                                                <td className="py-3 px-3 text-center font-medium">
                                                    {template.allow_customize !== false ? (
                                                        <span className="text-emerald-600 font-bold text-[10px]">Yes</span>
                                                    ) : (
                                                        <span className="text-muted-foreground text-[10px]">No</span>
                                                    )}
                                                </td>

                                                {/* Status Switch */}
                                                <td className="py-3 px-3 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <Switch
                                                            checked={template.is_active !== false}
                                                            onCheckedChange={(val) => {
                                                                if (template.id) {
                                                                    saveTemplateMutation.mutate({ ...template, is_active: val });
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3 px-3 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Link href={`/admin/website-builder/templates/create?id=${template.id}`}>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-lg p-0 border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => handleDelete(template.id)}
                                                            className="h-8 w-8 rounded-lg p-0 text-rose-500 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={9} className="py-8 text-center text-xs text-muted-foreground">
                                                No event templates found. Click "Add Template" to create one.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        /* Grid View Option */
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredTemplates.length > 0 ? (
                                filteredTemplates.map((t) => (
                                    <div key={t.id} className="rounded-xl border border-border bg-card p-3 space-y-2 text-center shadow-xs hover:shadow-md transition-shadow">
                                        <div
                                            className="h-36 w-full rounded-lg border border-border p-3 flex flex-col items-center justify-center text-white text-xs font-bold"
                                            style={{ backgroundColor: t.primary_color || '#6A38F5' }}
                                        >
                                            <p className="text-[10px] uppercase font-mono tracking-widest opacity-80">{t.category_name}</p>
                                            <h4 className="text-base font-serif italic mt-1">{t.template_name}</h4>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-foreground">{t.template_name}</h4>
                                            <p className="text-[10px] text-muted-foreground capitalize">{t.template_type} • {t.design_style}</p>
                                        </div>
                                        <div className="flex items-center justify-center gap-1.5 pt-1">
                                            <Link href={`/admin/website-builder/templates/create?id=${t.id}`} className="w-full">
                                                <Button variant="outline" size="sm" className="h-7 w-full text-[10px] font-semibold border-border">
                                                    Edit Template
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
                                    No event templates found. Click "Add Template" to create one.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer Pagination */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/40 text-xs text-muted-foreground">
                        <span>Showing {filteredTemplates.length} of {templates.length} event templates</span>
                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-xs bg-primary text-primary-foreground border-primary">
                                1
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
