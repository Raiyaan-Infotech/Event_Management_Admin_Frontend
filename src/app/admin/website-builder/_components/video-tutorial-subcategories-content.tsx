'use client';

import { useState, useMemo } from 'react';
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    RotateCcw,
    Loader2,
    Folder,
    Save
} from 'lucide-react';
import { Icon } from '@iconify/react';
import { IconPickerDialog } from '@/components/common/icon-picker-dialog';
import {
    useVideoTutorialSubCategories,
    useCreateVideoTutorialSubCategory,
    useUpdateVideoTutorialSubCategory,
    useUpdateVideoTutorialSubCategoryStatus,
    useDeleteVideoTutorialSubCategory,
    useVideoTutorialCategories,
    VideoTutorialSubCategory
} from '@/hooks/useVideoTutorials';
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

const PRESET_COLORS = [
    '#8B5CF6',
    '#FF4D8D',
    '#22C55E',
    '#F97316',
    '#3B82F6',
    '#EC4899',
    '#EAB308',
];

export function VideoTutorialSubCategoriesContent() {
    const { data: categories = [] } = useVideoTutorialCategories();
    const { data: subcategories = [], isLoading } = useVideoTutorialSubCategories();

    const createMutation = useCreateVideoTutorialSubCategory();
    const updateMutation = useUpdateVideoTutorialSubCategory();
    const toggleStatusMutation = useUpdateVideoTutorialSubCategoryStatus();
    const deleteMutation = useDeleteVideoTutorialSubCategory();

    // Table State
    const [search, setSearch] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [iconPickerOpen, setIconPickerOpen] = useState(false);
    const [editSubCategory, setEditSubCategory] = useState<VideoTutorialSubCategory | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [categoryId, setCategoryId] = useState('');
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('Folder');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('#8B5CF6');
    const [sortOrder, setSortOrder] = useState<number>(1);
    const [isActive, setIsActive] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const openCreateModal = () => {
        setEditSubCategory(null);
        setCategoryId(categories.length > 0 ? String(categories[0].id) : '');
        setName('');
        setIcon('Folder');
        setDescription('');
        setColor('#8B5CF6');
        setSortOrder(subcategories.length + 1);
        setIsActive(true);
        setErrors({});
        setModalOpen(true);
    };

    const openEditModal = (sub: VideoTutorialSubCategory) => {
        setEditSubCategory(sub);
        setCategoryId(String(sub.category_id));
        setName(sub.name || '');
        setIcon(sub.icon || 'Folder');
        setDescription(sub.description || '');
        setColor(sub.color || '#8B5CF6');
        setSortOrder(sub.sort_order ?? 1);
        setIsActive(Number(sub.is_active) === 1 || sub.is_active === true);
        setErrors({});
        setModalOpen(true);
    };

    const handleSave = () => {
        const newErr: Record<string, string> = {};
        if (!categoryId) newErr.category_id = 'Category is required';
        if (!name.trim()) newErr.name = 'Sub Category name is required';
        if (sortOrder === undefined || sortOrder === null || isNaN(sortOrder) || sortOrder <= 0) {
            newErr.sort_order = 'Display order is required';
        }

        if (Object.keys(newErr).length > 0) {
            setErrors(newErr);
            return;
        }
        setErrors({});

        const payload = {
            category_id: Number(categoryId),
            name: name.trim(),
            description: description.trim() || null,
            icon: icon || 'Folder',
            color: color || '#8B5CF6',
            sort_order: sortOrder,
            is_active: isActive,
        };

        if (editSubCategory) {
            updateMutation.mutate({ id: editSubCategory.id, data: payload }, {
                onSuccess: () => setModalOpen(false)
            });
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => setModalOpen(false)
            });
        }
    };

    const handleToggleStatus = (sub: VideoTutorialSubCategory) => {
        const currentActive = Number(sub.is_active) === 1 || sub.is_active === true;
        toggleStatusMutation.mutate({ id: sub.id, is_active: !currentActive });
    };

    // Filter Logic
    const filteredSubCategories = useMemo(() => {
        return subcategories.filter((sub) => {
            if (search.trim()) {
                const q = search.toLowerCase().trim();
                const nameMatch = sub.name?.toLowerCase().includes(q);
                const descMatch = sub.description?.toLowerCase().includes(q);
                const catMatch = sub.category_name?.toLowerCase().includes(q);
                if (!nameMatch && !descMatch && !catMatch) return false;
            }
            if (selectedCategoryFilter !== 'all' && String(sub.category_id) !== selectedCategoryFilter) {
                return false;
            }
            if (selectedStatus !== 'all') {
                const isActiveBool = Number(sub.is_active) === 1 || sub.is_active === true;
                const targetActive = selectedStatus === '1' || selectedStatus === 'true';
                if (isActiveBool !== targetActive) return false;
            }
            return true;
        });
    }, [subcategories, search, selectedCategoryFilter, selectedStatus]);

    const paginatedSubCategories = useMemo(() => {
        const start = (page - 1) * limit;
        return filteredSubCategories.slice(start, start + limit);
    }, [filteredSubCategories, page, limit]);

    const totalPages = Math.ceil(filteredSubCategories.length / limit) || 1;
    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16 text-foreground">
            <PageLoader open={isSaving} text="Saving Sub Categories..." />
            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Sub Categories</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Manage all video tutorial sub categories.
                    </p>
                </div>
                <Button
                    size="sm"
                    onClick={openCreateModal}
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-sm cursor-pointer whitespace-nowrap"
                >
                    <Plus className="h-4 w-4" />
                    Add Sub Category
                </Button>
            </div>

            {/* Filter Bar */}
            <Card className="border-border bg-card shadow-xs">
                <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative flex-1 min-w-[200px] w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search sub categories..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                className="pl-9 h-9 text-xs border-border bg-background text-foreground w-full"
                            />
                        </div>

                        <div className="w-full sm:w-44 shrink-0">
                            <Select value={selectedCategoryFilter} onValueChange={(val) => { setSelectedCategoryFilter(val); setPage(1); }}>
                                <SelectTrigger className="h-9 text-xs border-border bg-background text-foreground w-full">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full sm:w-36 shrink-0">
                            <Select value={selectedStatus} onValueChange={(val) => { setSelectedStatus(val); setPage(1); }}>
                                <SelectTrigger className="h-9 text-xs border-border bg-background text-foreground w-full">
                                    <SelectValue placeholder="All Status">
                                        {selectedStatus === 'all' ? 'All Status' : selectedStatus === '1' ? 'Active' : 'Inactive'}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="1">Active</SelectItem>
                                    <SelectItem value="0">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setSearch(''); setSelectedCategoryFilter('all'); setSelectedStatus('all'); setPage(1); }}
                            className="h-9 px-3.5 gap-1.5 border-border bg-background text-foreground text-xs font-semibold shrink-0"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reset
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card className="border-border bg-card shadow-xs overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-bold uppercase tracking-wider text-[11px]">
                                    <th className="py-3 px-4 w-12 text-center">#</th>
                                    <th className="py-3 px-4 min-w-[200px]">Sub Category Name</th>
                                    <th className="py-3 px-4 min-w-[160px]">Category</th>
                                    <th className="py-3 px-4 min-w-[240px]">Description</th>
                                    <th className="py-3 px-4 w-20 text-center">Icon</th>
                                    <th className="py-3 px-4 w-28">Color</th>
                                    <th className="py-3 px-4 w-28">Status</th>
                                    <th className="py-3 px-4 w-36">Created On</th>
                                    <th className="py-3 px-4 w-28 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={9} className="py-16 text-center text-muted-foreground">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                                            Loading sub categories...
                                        </td>
                                    </tr>
                                ) : paginatedSubCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="py-16 text-center text-muted-foreground">
                                            No sub categories found. Click <strong>+ Add Sub Category</strong> to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedSubCategories.map((sub, idx) => {
                                        const globalIndex = (page - 1) * limit + idx + 1;
                                        const isActive = Number(sub.is_active) === 1 || sub.is_active === true;
                                        const subColor = sub.color || '#8B5CF6';
                                        const formattedDate = sub.created_at
                                            ? new Date(sub.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                                            : '—';

                                        return (
                                            <tr key={sub.id} className="hover:bg-muted/20 transition-colors">
                                                <td className="py-3.5 px-4 font-semibold text-muted-foreground text-center">
                                                    {globalIndex}
                                                </td>
                                                <td className="py-3.5 px-4 font-extrabold text-foreground">
                                                    {sub.name}
                                                </td>
                                                <td className="py-3.5 px-4 font-bold text-primary">
                                                    {sub.category_name || '—'}
                                                </td>
                                                <td className="py-3.5 px-4 text-muted-foreground">
                                                    {sub.description || '—'}
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <div
                                                        className="h-8 w-8 rounded-lg flex items-center justify-center mx-auto shadow-xs"
                                                        style={{ backgroundColor: `${subColor}15`, color: subColor, border: `1px solid ${subColor}30` }}
                                                    >
                                                        <Icon icon={sub.icon && sub.icon.includes(':') ? sub.icon : `lucide:${(sub.icon || 'file-text').toLowerCase()}`} className="h-4 w-4" />
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold"
                                                        style={{ backgroundColor: `${subColor}15`, color: subColor, border: `1px solid ${subColor}30` }}
                                                    >
                                                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: subColor }} />
                                                        {subColor}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Switch checked={isActive} onCheckedChange={() => handleToggleStatus(sub)} />
                                                        <span className={`text-xs font-bold ${isActive ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                                                            {isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-muted-foreground font-medium">
                                                    {formattedDate}
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => openEditModal(sub)}
                                                            className="h-8 w-8 rounded-lg border-border text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/10 cursor-pointer"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <RowTranslateButton
                                                            section="video-tutorial-subcategories"
                                                            recordId={Number(sub.id) || undefined}
                                                            rowLabel={sub.name}
                                                            fields={[
                                                                { key: 'name', label: 'Sub Category Name', value: sub.name || '' },
                                                                { key: 'description', label: 'Description', value: (sub as any).description || '', type: 'textarea' },
                                                            ]}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => setDeleteId(sub.id)}
                                                            className="h-8 w-8 rounded-lg border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300 cursor-pointer"
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

                    {!isLoading && filteredSubCategories.length > 0 && (
                        <div className="p-4 border-t border-border/80">
                            {filteredSubCategories.length > limit ? (
                                <TablePagination
                                    pagination={{ page, totalPages, totalItems: filteredSubCategories.length, limit, hasNextPage: page < totalPages, hasPrevPage: page > 1 }}
                                    onPageChange={setPage}
                                    onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
                                />
                            ) : (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
                                    <span>Showing 1 to {filteredSubCategories.length} of {filteredSubCategories.length} sub categories</span>
                                    <div className="flex items-center gap-1.5">
                                        <Button variant="outline" size="sm" className="h-8 px-3 text-xs border-border bg-card text-foreground" disabled>Previous</Button>
                                        <Button variant="outline" size="sm" className="h-8 w-8 text-xs bg-primary text-primary-foreground border-primary font-bold shadow-xs">1</Button>
                                        <Button variant="outline" size="sm" className="h-8 px-3 text-xs border-border bg-card text-foreground" disabled>Next</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add / Edit Sub Category Dialog Modal (Mockup Image 0 Top-Right 1:1) */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-xl bg-card border-border text-foreground p-6 rounded-2xl shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-extrabold text-foreground">
                            {editSubCategory ? 'Edit Sub Category' : 'Add Sub Category'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Create a new sub category under a selected category.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 pt-2">
                        {/* Section 1. Sub Category Information */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-extrabold text-primary uppercase tracking-wider">1. Sub Category Information</h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-foreground">Category <span className="text-rose-500">*</span></Label>
                                    <Select value={categoryId} onValueChange={(val) => { setCategoryId(val); if (errors.category_id) setErrors((e) => ({ ...e, category_id: '' })); }}>
                                        <SelectTrigger className={cn("h-9 text-xs border-border bg-background text-foreground w-full", errors.category_id && "border-red-500 ring-1 ring-red-500 bg-red-50/10")}>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c) => (
                                                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category_id && <p className="text-xs text-rose-500 font-semibold">{errors.category_id}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-foreground">Sub Category Name <span className="text-rose-500">*</span></Label>
                                    <BuilderCountedInput
                                        value={name}
                                        onChange={(val) => { setName(val); if (errors.name) setErrors((e) => ({ ...e, name: '' })); }}
                                        maxLength={50}
                                        placeholder="Enter sub category name..."
                                        className="bg-background text-xs border-border"
                                        inputClassName={cn(errors.name && "border-red-500 ring-1 ring-red-500 bg-red-50/10")}
                                    />
                                    {errors.name && <p className="text-xs text-rose-500 font-semibold">{errors.name}</p>}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-foreground">Description <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                                <BuilderCountedTextarea
                                    value={description}
                                    onChange={setDescription}
                                    maxLength={150}
                                    rows={2}
                                    placeholder="Enter sub category description..."
                                    className="bg-background text-xs border-border"
                                />
                                <p className="text-[11px] text-muted-foreground">Briefly describe what this sub category is about.</p>
                            </div>

                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-foreground">Sub Category Icon</Label>
                                    <div className="flex items-center gap-2">
                                        <div className="h-9 w-9 rounded-lg border border-border bg-muted/40 flex items-center justify-center text-primary shrink-0">
                                            <Icon icon={icon.includes(':') ? icon : `lucide:${icon.toLowerCase()}`} className="h-5 w-5" />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIconPickerOpen(true)}
                                            className="h-9 px-3 text-xs font-semibold border-border bg-card hover:bg-accent cursor-pointer flex-1 justify-between"
                                        >
                                            <span className="truncate">{icon || 'Select Icon'}</span>
                                            <span className="text-[10px] text-muted-foreground ml-2">Browse...</span>
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-foreground">Color</Label>
                                    <div className="relative">
                                        <Input
                                            value={color}
                                            onChange={(e) => setColor(e.target.value)}
                                            className="bg-background text-xs border-border font-mono font-bold pl-9"
                                        />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full border shadow-xs" style={{ backgroundColor: color }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2. Settings */}
                        <div className="space-y-4 pt-2 border-t border-border">
                            <h4 className="text-xs font-extrabold text-primary uppercase tracking-wider">2. Settings</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-foreground">Display Order <span className="text-rose-500">*</span></Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={sortOrder}
                                        onChange={(e) => {
                                            setSortOrder(parseInt(e.target.value, 10));
                                            if (errors.sort_order) setErrors((err) => ({ ...err, sort_order: '' }));
                                        }}
                                        className={cn(
                                            'bg-background text-xs border-border',
                                            errors.sort_order && 'border-red-500 ring-1 ring-red-500 bg-red-50/10'
                                        )}
                                    />
                                    <p className="text-[11px] text-muted-foreground">Set the order in which this sub category will appear.</p>
                                    {errors.sort_order && <p className="text-xs text-rose-500 font-semibold">{errors.sort_order}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-foreground">Status <span className="text-rose-500">*</span></Label>
                                    <div className="flex items-center gap-2 pt-1">
                                        <Switch checked={isActive} onCheckedChange={setIsActive} />
                                        <span className={`text-xs font-bold ${isActive ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                                            {isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">Inactive sub categories will not be shown.</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)} className="h-9 px-4 text-xs font-bold border-border bg-card">
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="h-9 px-5 text-xs font-extrabold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm gap-1.5 cursor-pointer"
                            >
                                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                Save Sub Category
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Icon Picker Dialog */}
            <IconPickerDialog
                open={iconPickerOpen}
                onOpenChange={setIconPickerOpen}
                onSelect={(selectedIcon) => setIcon(selectedIcon)}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteDialog
                open={!!deleteId}
                onOpenChange={(val) => !val && setDeleteId(null)}
                onConfirm={() => {
                    if (deleteId) {
                        deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
                    }
                }}
                title="Delete Sub Category"
                description="Are you sure you want to delete this sub category? Video tutorials in this sub category will lose their link."
            />
        </div>
    );
}
