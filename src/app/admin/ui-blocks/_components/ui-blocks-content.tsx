'use client';

import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Component } from 'lucide-react';
import { useUiBlockCategories } from '@/hooks/use-ui-block-categories';
import { useUiBlocks, useCreateUiBlock, useUpdateUiBlock, useDeleteUiBlock, UiBlock } from '@/hooks/use-ui-blocks';
import { CommonTable, type CommonColumn } from '@/components/common/common-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { TablePagination } from '@/components/common/table-pagination';
import { DeleteDialog } from '@/components/common/delete-dialog';
import { Switch } from '@/components/ui/switch';
import { PageLoader } from '@/components/common/page-loader';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

const schema = z.object({
    block_type: z.string().trim().min(1, 'Block type is required'),
    label: z.string().trim().min(1, 'Label is required'),
    icon: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    category_id: z.number().optional().nullable(),
    is_active: z.boolean().default(true),
    preview_image: z.string().optional().nullable(),
    variants: z.array(z.string()).optional().default([]),
});
type FormData = z.infer<typeof schema>;

export function UiBlocksContent() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);

    const { data: res, isLoading } = useUiBlocks({ page, limit, search: debouncedSearch });
    const blocks: UiBlock[] = res?.data || [];
    const pagination = res?.pagination;

    const { data: catRes } = useUiBlockCategories();
    const categories = catRes?.data || [];

    const create = useCreateUiBlock();
    const update = useUpdateUiBlock();
    const del = useDeleteUiBlock();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editItem, setEditItem] = useState<UiBlock | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { block_type: '', label: '', icon: '', description: '', category_id: null, is_active: true, preview_image: '', variants: [] },
    });

    const closeDialog = () => { setDialogOpen(false); setEditItem(null); form.reset(); };

    const openCreate = () => {
        setEditItem(null);
        form.reset({ block_type: '', label: '', icon: '', description: '', category_id: null, is_active: true });
        setDialogOpen(true);
    };

    const openEdit = (item: UiBlock) => {
        setEditItem(item);
        form.reset({
            block_type: item.block_type,
            label: item.label,
            icon: item.icon || '',
            description: item.description || '',
            category_id: item.category_id || null,
            is_active: Number(item.is_active) === 1,
            preview_image: (item as any).preview_image || '',
            variants: Array.isArray((item as any).variants) ? (item as any).variants : [],
        });
        setDialogOpen(true);
    };

    const onSubmit = (data: FormData) => {
        const payload: any = { ...data, is_active: data.is_active ? 1 : 0 };
        if (editItem) {
            update.mutate({ id: editItem.id, data: payload }, { onSuccess: closeDialog });
        } else {
            create.mutate(payload, { onSuccess: closeDialog });
        }
    };

    const columns: CommonColumn<UiBlock>[] = [
        {
            key: 'label',
            header: 'Label',
            sortable: true,
            render: (row) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-semibold">{row.label}</span>
                    <code className="text-[10px] text-muted-foreground bg-muted px-1 py-0.5 rounded">{row.block_type}</code>
                </div>
            ),
        },
        {
            key: 'category_id',
            header: 'Category',
            render: (row) => row.category
                ? <Badge variant="outline">{row.category.name}</Badge>
                : <span className="text-muted-foreground text-xs">—</span>,
        },
        {
            key: 'icon',
            header: 'Icon Key',
            render: (row) => row.icon
                ? <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{row.icon}</code>
                : <span className="text-muted-foreground text-xs">—</span>,
        },
        {
            key: 'description',
            header: 'Description',
            render: (row) => <span className="text-sm text-muted-foreground line-clamp-1">{row.description || '—'}</span>,
        },
    ];

    const isPending = create.isPending || update.isPending;

    return (
        <div className="space-y-6">
            <PageLoader open={isLoading || isPending || del.isPending} />
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Component className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>UI Blocks</CardTitle>
                                 <CardDescription>Manage reusable UI blocks for theme layouts</CardDescription>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search blocks..."
                                    className="pl-9 h-9"
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch('')}
                                        className="absolute right-2.5 top-2.5 hover:text-foreground text-muted-foreground"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            <Button size="sm" onClick={openCreate}>
                                <Plus className="mr-2 h-4 w-4" /> Add UI Block
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <CommonTable
                        columns={columns}
                        data={blocks as any}
                        isLoading={isLoading}
                        emptyMessage="No UI blocks found."
                        onStatusToggle={(row, val) => update.mutate({ id: row.id, data: { is_active: val ? 1 : 0 } })}
                        onEdit={openEdit}
                        onDelete={(row) => setDeleteId(row.id)}
                        showStatus
                        showCreated
                        showActions
                    />
                    {pagination && <TablePagination pagination={{ ...pagination, limit }} onPageChange={setPage} onLimitChange={setLimit} />}
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editItem ? 'Edit UI Block' : 'Add UI Block'}</DialogTitle>
                        <DialogDescription>Define a block type that can be used in theme layouts.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Block Type <span className="text-destructive">*</span></Label>
                                <Input {...form.register('block_type')} placeholder="e.g. hero_slider" />
                                {form.formState.errors.block_type && <p className="text-xs text-destructive">{form.formState.errors.block_type.message}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label>Label <span className="text-destructive">*</span></Label>
                                <Input {...form.register('label')} placeholder="e.g. Hero Slider" />
                                {form.formState.errors.label && <p className="text-xs text-destructive">{form.formState.errors.label.message}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Category</Label>
                                <Controller
                                    control={form.control}
                                    name="category_id"
                                    render={({ field }) => (
                                        <Select
                                            value={field.value?.toString() || 'none'}
                                            onValueChange={(v) => field.onChange(v === 'none' ? null : Number(v))}
                                        >
                                            <SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none" className="text-muted-foreground italic">— No Category —</SelectItem>
                                                {categories.map((c: any) => (
                                                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Icon Key</Label>
                                <Input {...form.register('icon')} placeholder="e.g. Layers" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Description</Label>
                            <Textarea {...form.register('description')} placeholder="Brief description of this block..." rows={2} />
                        </div>

                        <div className="space-y-1.5">
                            <Label>Preview Image URL</Label>
                            <Input {...form.register('preview_image')} placeholder="https://example.com/preview.png" />
                        </div>

                        <div className="space-y-2">
                            <Label>Variants</Label>
                            <div className="space-y-2">
                                <Controller
                                    control={form.control}
                                    name="variants"
                                    render={({ field }) => (
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap gap-2">
                                                {(field.value ?? []).map((v, i) => (
                                                    <Badge key={i} variant="secondary" className="pl-3 pr-1.5 py-1 gap-1.5">
                                                        {v}
                                                        <button
                                                            type="button"
                                                            onClick={() => field.onChange((field.value ?? []).filter((_: any, idx: number) => idx !== i))}
                                                            className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                                {(field.value ?? []).length === 0 && <span className="text-xs text-muted-foreground italic">No variants added</span>}
                                            </div>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="new-variant-input"
                                                    placeholder="Add variant name (e.g. Modern, Classic)"
                                                    className="h-8 shadow-none border-dashed"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const val = (e.target as HTMLInputElement).value.trim();
                                                            if (val && !(field.value ?? []).includes(val)) {
                                                                field.onChange([...(field.value ?? []), val]);
                                                                (e.target as HTMLInputElement).value = '';
                                                            }
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 shrink-0"
                                                    onClick={() => {
                                                        const el = document.getElementById('new-variant-input') as HTMLInputElement;
                                                        const val = el.value.trim();
                                                        if (val && !(field.value ?? []).includes(val)) {
                                                            field.onChange([...(field.value ?? []), val]);
                                                            el.value = '';
                                                        }
                                                    }}
                                                >
                                                    Add
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <Label>Active</Label>
                            <Controller
                                control={form.control}
                                name="is_active"
                                render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
                            <Button type="submit" isLoading={isPending}>{isPending ? 'Saving...' : 'Save'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <DeleteDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Delete UI Block?"
                description="This action cannot be undone."
                isDeleting={del.isPending}
                onConfirm={() => { if (deleteId) del.mutate(deleteId, { onSuccess: () => setDeleteId(null), onError: () => setDeleteId(null) }); }}
            />
        </div>
    );
}
