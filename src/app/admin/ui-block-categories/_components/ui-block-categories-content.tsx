'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, FolderOpen } from 'lucide-react';
import { useUiBlockCategories, useCreateUiBlockCategory, useUpdateUiBlockCategory, useDeleteUiBlockCategory, UiBlockCategory } from '@/hooks/use-ui-block-categories';
import { CommonTable, type CommonColumn } from '@/components/common/common-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PageLoader } from '@/components/common/page-loader';
import { TablePagination } from '@/components/common/table-pagination';
import { DeleteDialog } from '@/components/common/delete-dialog';

const schema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    description: z.string().optional().nullable(),
    is_active: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;

export function UiBlockCategoriesContent() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const { data: res, isLoading } = useUiBlockCategories({ page, limit });
    const categories: UiBlockCategory[] = res?.data || [];
    const pagination = res?.pagination;

    const create = useCreateUiBlockCategory();
    const update = useUpdateUiBlockCategory();
    const del = useDeleteUiBlockCategory();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editItem, setEditItem] = useState<UiBlockCategory | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { name: '', description: '', is_active: true },
    });

    const closeDialog = () => { setDialogOpen(false); setEditItem(null); form.reset(); };

    const openCreate = () => {
        setEditItem(null);
        form.reset({ name: '', description: '', is_active: true });
        setDialogOpen(true);
    };

    const openEdit = (item: UiBlockCategory) => {
        setEditItem(item);
        form.reset({ name: item.name, description: item.description || '', is_active: Number(item.is_active) === 1 });
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

    const columns: CommonColumn<UiBlockCategory>[] = [
        {
            key: 'name',
            header: 'Category Name',
            sortable: true,
            render: (row) => <span className="font-semibold">{row.name}</span>,
        },
        {
            key: 'description',
            header: 'Description',
            render: (row) => <span className="text-sm text-muted-foreground">{row.description || '—'}</span>,
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
                                <FolderOpen className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>UI Block Categories</CardTitle>
                                <CardDescription>Group UI blocks into organisational categories</CardDescription>
                            </div>
                        </div>
                        <Button size="sm" onClick={openCreate}>
                            <Plus className="mr-2 h-4 w-4" /> Add Category
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <CommonTable
                        columns={columns}
                        data={categories as any}
                        isLoading={isLoading}
                        emptyMessage="No categories found."
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
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editItem ? 'Edit Category' : 'Add Category'}</DialogTitle>
                        <DialogDescription>Organise your UI blocks into categories.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <Label>Name <span className="text-destructive">*</span></Label>
                            <Input {...form.register('name')} placeholder="e.g. Hero Sections" />
                            {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Description</Label>
                            <Textarea {...form.register('description')} placeholder="Optional description..." rows={2} />
                        </div>
                        <div className="flex items-center gap-3">
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
                title="Delete Category?"
                description="This will unlink all blocks assigned to this category."
                isDeleting={del.isPending}
                onConfirm={() => { if (deleteId) del.mutate(deleteId, { onSuccess: () => setDeleteId(null), onError: () => setDeleteId(null) }); }}
            />
        </div>
    );
}
