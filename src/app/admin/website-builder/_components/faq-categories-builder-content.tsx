'use client';

import { useState, useMemo } from 'react';
import {
    Plus,
    Pencil,
    Trash2,
    Rocket,
    Mail,
    Share2,
    Users,
    Calendar,
    BarChart3,
    Headphones,
    Shield,
    HelpCircle,
    Save,
    Loader2,
    X
} from 'lucide-react';
import {
    useWebsiteFaqCategories,
    useCreateWebsiteFaqCategory,
    useUpdateWebsiteFaqCategory,
    useDeleteWebsiteFaqCategory,
} from '@/hooks/useWebsiteFaqCategories';
import { WebsiteFaqCategory } from '@/hooks/useWebsiteFaqs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DeleteDialog } from '@/components/common/delete-dialog';
import { TablePagination } from '@/components/common/table-pagination';
import { BuilderCountedInput, BuilderCountedTextarea } from './builder-field';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { RowTranslateButton } from './row-translate-dialog';
import { PageLoader } from '@/components/common/page-loader';

const ICON_OPTIONS = [
    { label: 'Rocket (Getting Started)', value: 'Rocket', icon: Rocket },
    { label: 'Mail (Invitations)', value: 'Mail', icon: Mail },
    { label: 'Share (Sharing)', value: 'Share2', icon: Share2 },
    { label: 'Users (Guests & RSVP)', value: 'Users', icon: Users },
    { label: 'Calendar (Events)', value: 'Calendar', icon: Calendar },
    { label: 'BarChart (Analytics)', value: 'BarChart3', icon: BarChart3 },
    { label: 'Headphones (Support)', value: 'Headphones', icon: Headphones },
    { label: 'Shield (Security)', value: 'Shield', icon: Shield },
    { label: 'Help Circle (General)', value: 'HelpCircle', icon: HelpCircle },
];

const ICON_MAP: Record<string, any> = {
    Rocket,
    Mail,
    Share2,
    Users,
    Calendar,
    BarChart3,
    Headphones,
    Shield,
    HelpCircle,
};

const PRESET_COLORS = [
    '#7C3AED',
    '#8B5CF6',
    '#EC4899',
    '#10B981',
    '#F59E0B',
    '#3B82F6',
    '#EF4444',
    '#6366F1',
];

export function FaqCategoriesBuilderContent() {
    const { data: categories = [], isLoading } = useWebsiteFaqCategories();
    const createMutation = useCreateWebsiteFaqCategory();
    const updateMutation = useUpdateWebsiteFaqCategory();
    const deleteMutation = useDeleteWebsiteFaqCategory();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const paginatedCategories = useMemo(() => {
        const start = (page - 1) * limit;
        return categories.slice(start, start + limit);
    }, [categories, page, limit]);

    const totalPages = Math.ceil(categories.length / limit) || 1;

    const [modalOpen, setModalOpen] = useState(false);
    const [editCategory, setEditCategory] = useState<WebsiteFaqCategory | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Modal Form State
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('HelpCircle');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('#7C3AED');
    const [sortOrder, setSortOrder] = useState<number>(1);
    const [isActive, setIsActive] = useState(true);

    const [error, setError] = useState('');

    const openCreateModal = () => {
        setEditCategory(null);
        setName('');
        setIcon('HelpCircle');
        setDescription('');
        setColor('#7C3AED');
        setSortOrder(categories.length + 1);
        setIsActive(true);
        setError('');
        setModalOpen(true);
    };

    const openEditModal = (cat: WebsiteFaqCategory) => {
        setEditCategory(cat);
        setName(cat.name || '');
        setIcon(cat.icon || 'HelpCircle');
        setDescription(cat.description || '');
        setColor(cat.color || '#7C3AED');
        setSortOrder(cat.sort_order ?? 1);
        setIsActive(Number(cat.is_active) === 1 || cat.is_active === true);
        setError('');
        setModalOpen(true);
    };

    const isSaving = createMutation.isPending || updateMutation.isPending;

    const handleSaveCategory = () => {
        if (!name.trim()) {
            setError('Category name is required');
            return;
        }

        const payload = {
            name: name.trim(),
            icon,
            description: description.trim() || null,
            color: color.trim() || '#7C3AED',
            sort_order: sortOrder,
            is_active: isActive,
        };

        if (editCategory) {
            updateMutation.mutate({ id: editCategory.id, data: payload }, {
                onSuccess: () => setModalOpen(false)
            });
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => setModalOpen(false)
            });
        }
    };

    const handleToggleStatus = (cat: WebsiteFaqCategory) => {
        updateMutation.mutate({
            id: cat.id,
            data: { is_active: !(Number(cat.is_active) === 1 || cat.is_active === true) }
        });
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16 text-foreground">
            <PageLoader open={isSaving} text="Saving FAQ Categories..." />
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">FAQ Categories</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Organize your FAQs using categories.
                    </p>
                </div>
                <div>
                    <Button
                        size="sm"
                        onClick={openCreateModal}
                        className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Add Category
                    </Button>
                </div>
            </div>

            {/* Categories Data Table */}
            <Card className="border-border bg-card shadow-xs overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-bold uppercase tracking-wider text-[11px]">
                                    <th className="py-3 px-4 w-12 text-center">#</th>
                                    <th className="py-3 px-4 w-16 text-center">Icon</th>
                                    <th className="py-3 px-4 min-w-[200px]">Category Name</th>
                                    <th className="py-3 px-4 min-w-[260px]">Description</th>
                                    <th className="py-3 px-4 w-20 text-center">Order</th>
                                    <th className="py-3 px-4 w-32">Status</th>
                                    <th className="py-3 px-4 w-28 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-muted-foreground">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                                            Loading categories...
                                        </td>
                                    </tr>
                                ) : paginatedCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-muted-foreground">
                                            No categories found. Click <strong>+ Add Category</strong> to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedCategories.map((cat, idx) => {
                                        const globalIndex = (page - 1) * limit + idx + 1;
                                        const catIconName = cat.icon || 'HelpCircle';
                                        const IconComp = ICON_MAP[catIconName] || HelpCircle;
                                        const catColor = cat.color || '#7C3AED';
                                        const isActive = Number(cat.is_active) === 1 || cat.is_active === true;

                                        return (
                                            <tr key={cat.id} className="hover:bg-muted/20 transition-colors">
                                                <td className="py-3.5 px-4 font-semibold text-muted-foreground text-center">
                                                    {globalIndex}
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <div
                                                        className="h-9 w-9 rounded-full flex items-center justify-center mx-auto shadow-xs"
                                                        style={{
                                                            backgroundColor: `${catColor}18`,
                                                            color: catColor,
                                                            border: `1px solid ${catColor}30`
                                                        }}
                                                    >
                                                        <IconComp className="h-4 w-4" />
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 font-bold text-foreground">
                                                    {cat.name}
                                                </td>
                                                <td className="py-3.5 px-4 text-muted-foreground font-medium">
                                                    {cat.description || '—'}
                                                </td>
                                                <td className="py-3.5 px-4 text-center font-medium text-foreground">
                                                    {cat.sort_order ?? 0}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            checked={isActive}
                                                            onCheckedChange={() => handleToggleStatus(cat)}
                                                        />
                                                        <span className={`text-xs font-bold ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                                                            {isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => openEditModal(cat)}
                                                            className="h-8 w-8 rounded-lg border-border text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <RowTranslateButton
                                                            section="faq-categories"
                                                            recordId={Number(cat.id) || undefined}
                                                            rowLabel={cat.name}
                                                            fields={[
                                                                { key: 'name', label: 'Category Name', value: cat.name || '' },
                                                                { key: 'description', label: 'Description', value: (cat as any).description || '', type: 'textarea' },
                                                            ]}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => setDeleteId(cat.id)}
                                                            className="h-8 w-8 rounded-lg border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-300 cursor-pointer"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {!isLoading && categories.length > 0 && (
                        <div className="p-4 border-t border-border/80">
                            {categories.length > limit ? (
                                <TablePagination
                                    pagination={{
                                        page,
                                        totalPages,
                                        totalItems: categories.length,
                                        limit,
                                        hasNextPage: page < totalPages,
                                        hasPrevPage: page > 1,
                                    }}
                                    onPageChange={setPage}
                                    onLimitChange={(newLimit) => {
                                        setLimit(newLimit);
                                        setPage(1);
                                    }}
                                />
                            ) : (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
                                    <span>Showing 1 to {categories.length} of {categories.length} categories</span>
                                    <div className="flex items-center gap-1.5">
                                        <Button variant="outline" size="sm" className="h-8 px-3 text-xs border-border bg-card text-foreground cursor-pointer" disabled>
                                            Previous
                                        </Button>
                                        <Button variant="outline" size="sm" className="h-8 w-8 text-xs bg-primary text-primary-foreground border-primary font-bold shadow-xs">
                                            1
                                        </Button>
                                        <Button variant="outline" size="sm" className="h-8 px-3 text-xs border-border bg-card text-foreground cursor-pointer" disabled>
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add / Edit FAQ Category Dialog Modal */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-xl p-6 sm:p-7 border-border bg-card text-foreground rounded-2xl">
                    <DialogHeader className="border-b border-border/80 pb-4">
                        <DialogTitle className="text-xl font-bold text-foreground">
                            {editCategory ? 'Edit FAQ Category' : 'Add FAQ Category'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                            Create a new category to organize your FAQs.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Section 1: Category Information */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                1. Category Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                {/* Category Name */}
                                <div>
                                    <BuilderCountedInput
                                        label="Category Name"
                                        labelClassName="text-xs font-bold text-foreground"
                                        required
                                        placeholder="Enter category name..."
                                        value={name}
                                        onChange={(val) => {
                                            setName(val);
                                            if (error) setError('');
                                        }}
                                        maxLength={50}
                                        inputClassName={cn(
                                            '!h-10 text-xs border-border bg-background text-foreground',
                                            error && 'border-red-500 ring-1 ring-red-500 bg-red-50/10'
                                        )}
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        Enter a clear and relevant name for this FAQ category.
                                    </p>
                                    {error && <p className="text-xs font-semibold text-red-500 mt-1">{error}</p>}
                                </div>

                                {/* Category Icon */}
                                <div className="w-full space-y-1">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-bold text-foreground">Category Icon</Label>
                                    </div>
                                    <Select value={icon} onValueChange={setIcon}>
                                        <SelectTrigger className="h-10 text-xs border-border bg-background text-foreground">
                                            <SelectValue placeholder="Select an icon">
                                                {ICON_OPTIONS.find(item => item.value === icon)?.label || icon}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ICON_OPTIONS.map((item) => {
                                                const ItemIcon = item.icon;
                                                return (
                                                    <SelectItem key={item.value} value={item.value}>
                                                        <div className="flex items-center gap-2">
                                                            <ItemIcon className="h-4 w-4 text-primary" />
                                                            <span>{item.label}</span>
                                                        </div>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        Choose an icon that represents this category.
                                    </p>
                                </div>

                                {/* Description */}
                                <div>
                                    <BuilderCountedTextarea
                                        label="Description (Optional)"
                                        placeholder="Enter category description..."
                                        value={description}
                                        onChange={setDescription}
                                        maxLength={150}
                                        textareaClassName="min-h-[75px] text-xs border-border bg-background text-foreground"
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        Briefly describe what this category is about.
                                    </p>
                                </div>

                                {/* Color Picker & Swatches */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-foreground">Color</Label>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-10 w-10 rounded-xl border border-border shrink-0 flex items-center justify-center shadow-xs cursor-pointer relative overflow-hidden"
                                            style={{ backgroundColor: color }}
                                        >
                                            <input
                                                type="color"
                                                value={color}
                                                onChange={(e) => setColor(e.target.value)}
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                            />
                                            <Pencil className="h-4 w-4 text-white drop-shadow-md" />
                                        </div>
                                        <Input
                                            value={color}
                                            onChange={(e) => setColor(e.target.value)}
                                            placeholder="#7C3AED"
                                            className="h-10 text-xs border-border bg-background text-foreground font-mono uppercase"
                                        />
                                    </div>
                                    {/* Preset Color Swatches */}
                                    <div className="flex items-center gap-1.5 pt-1">
                                        {PRESET_COLORS.map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setColor(c)}
                                                className={`h-5 w-5 rounded-full border transition-all cursor-pointer ${color.toUpperCase() === c.toUpperCase() ? 'ring-2 ring-primary ring-offset-1 scale-110' : 'border-black/10'}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        Choose a color to identify this category.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Settings */}
                        <div className="space-y-4 border-t border-border/60 pt-4">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                2. Settings
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Display Order */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                                        Display Order <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(Number(e.target.value))}
                                        className="h-10 text-xs border-border bg-background text-foreground"
                                    />
                                    <p className="text-[10px] text-muted-foreground">
                                        Set the order in which this category will appear.
                                    </p>
                                </div>

                                {/* Status Toggle */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                                        Status <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="flex items-center gap-3 pt-1">
                                        <Switch
                                            checked={isActive}
                                            onCheckedChange={setIsActive}
                                        />
                                        <span className={`text-xs font-bold ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                                            {isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        Inactive categories will not be shown in the FAQ section.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer Actions */}
                    <div className="flex items-center justify-end gap-3 border-t border-border/80 pt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setModalOpen(false)}
                            className="h-9 px-4 border-border bg-card hover:bg-accent text-foreground font-semibold"
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSaveCategory}
                            disabled={isSaving}
                            className="h-9 px-5 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-sm"
                        >
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {isSaving ? 'Saving...' : 'Save Category'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <DeleteDialog
                open={!!deleteId}
                onOpenChange={(val) => !val && setDeleteId(null)}
                onConfirm={() => {
                    if (deleteId) {
                        deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
                    }
                }}
                title="Delete Category"
                description="Are you sure you want to delete this category? FAQs in this category may lose their category link."
            />
        </div>
    );
}
