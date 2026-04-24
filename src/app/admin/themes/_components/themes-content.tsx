'use client';

import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Palette } from 'lucide-react';
import { useThemes, useCreateTheme, useUpdateTheme, useDeleteTheme, Theme } from '@/hooks/use-themes';
import { useTranslation } from '@/hooks/use-translation';
import { CommonTable, type CommonColumn } from '@/components/common/common-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PageLoader } from '@/components/common/page-loader';
import { TablePagination } from '@/components/common/table-pagination';
import { DeleteDialog } from '@/components/common/delete-dialog';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const schema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    header_color: z.string().optional().nullable(),
    footer_color: z.string().optional().nullable(),
    primary_color: z.string().optional().nullable(),
    secondary_color: z.string().optional().nullable(),
    hover_color: z.string().optional().nullable(),
    text_color: z.string().optional().nullable(),
    is_active: z.boolean().default(true),
    plans: z.array(z.number()).default([]),
});

type FormData = z.infer<typeof schema>;

function normalise(item: Theme): Theme & { created_at: string; is_active: boolean | number } {
    return {
        ...item,
        is_active: item.is_active as boolean | number,
        created_at: (item as any).created_at ?? (item as any).createdAt ?? '',
    };
}

export function ThemesContent() {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const { data: themesResponse, isLoading } = useThemes({ page, limit });
    const rawThemes = themesResponse?.data || [];
    const pagination = themesResponse?.pagination;
    const themes = useMemo(() => rawThemes.map(normalise), [rawThemes]);

    const createTheme = useCreateTheme();
    const updateTheme = useUpdateTheme();
    const deleteTheme = useDeleteTheme();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editItem, setEditItem] = useState<Theme | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { name: '', header_color: '#ffffff', footer_color: '#ffffff', primary_color: '#3b82f6', secondary_color: '#64748b', hover_color: '#2563eb', text_color: '#0f172a', is_active: true, plans: [] },
    });

    const closeDialog = () => {
        setDialogOpen(false);
        setEditItem(null);
        form.reset();
    };

    const openCreate = () => {
        setEditItem(null);
        form.reset({
            name: '',
            header_color: '#ffffff',
            footer_color: '#ffffff',
            primary_color: '#3b82f6',
            secondary_color: '#64748b',
            hover_color: '#2563eb',
            text_color: '#0f172a',
            is_active: true,
            plans: []
        });
        setDialogOpen(true);
    };

    const openEdit = (item: Theme) => {
        setEditItem(item);
        form.reset({
            name: item.name,
            header_color: item.header_color || '#ffffff',
            footer_color: item.footer_color || '#ffffff',
            primary_color: item.primary_color || '#3b82f6',
            secondary_color: item.secondary_color || '#64748b',
            hover_color: item.hover_color || '#2563eb',
            text_color: item.text_color || '#0f172a',
            is_active: Number(item.is_active) === 1,
            plans: Array.isArray(item.plans) ? item.plans.map((p: any) => Number(p)) : []
        });
        setDialogOpen(true);
    };

    const { data: plansRes } = useSubscriptions({ page: 1, limit: 100 });
    const subPlans = useMemo(() => plansRes?.data ?? [], [plansRes]);

    const onSubmit = (data: FormData) => {
        const payload: any = { ...data, is_active: data.is_active ? 1 : 0 };
        if (editItem) {
            updateTheme.mutate({ id: editItem.id, data: payload }, { onSuccess: closeDialog });
        } else {
            createTheme.mutate(payload, { onSuccess: closeDialog });
        }
    };

    const columns: CommonColumn<Theme>[] = [
        {
            key: 'name',
            header: t('themes.name', 'Theme Name'),
            sortable: true,
            render: (row) => <span className="font-medium">{row.name}</span>,
        },
        {
            key: 'primary_color',
            header: t('themes.primary', 'Primary Color'),
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border shadow-sm" style={{ backgroundColor: row.primary_color || '#ccc' }} title={row.primary_color || ''} />
                    <span className="text-sm text-muted-foreground">{row.primary_color}</span>
                </div>
            )
        },
        {
            key: 'secondary_color',
            header: t('themes.secondary', 'Secondary Color'),
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border shadow-sm" style={{ backgroundColor: row.secondary_color || '#ccc' }} title={row.secondary_color || ''} />
                    <span className="text-sm text-muted-foreground">{row.secondary_color}</span>
                </div>
            )
        },
        {
            key: 'layout',
            header: 'Layout',
            render: (row) => (
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={(e) => {
                        e.stopPropagation();
                        // Import useRouter normally dynamically or via window location for now 
                        window.location.href = `/admin/theme-builder?themeId=${row.id}`;
                    }}
                >
                    Edit Layout
                </Button>
            )
        }
    ];

    const isPending = createTheme.isPending || updateTheme.isPending;

    return (
        <div className="space-y-6">
            <PageLoader open={isLoading || isPending || deleteTheme.isPending} />
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Palette className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>{t('themes.title', 'Themes')}</CardTitle>
                                <CardDescription>{t('themes.desc', 'Manage application themes and color palettes')}</CardDescription>
                            </div>
                        </div>
                        <Button size="sm" onClick={openCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('themes.add', 'Add Theme')}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <CommonTable
                        columns={columns}
                        data={themes as any}
                        isLoading={isLoading}
                        emptyMessage={t('themes.no_themes', 'No themes found.')}
                        onStatusToggle={(row, val) =>
                            updateTheme.mutate({ id: row.id, data: { is_active: val ? 1 : 0 } })
                        }
                        onEdit={openEdit}
                        onDelete={(row) => setDeleteId(row.id)}
                        showStatus
                        showCreated
                        showActions
                    />
                    {pagination && <TablePagination pagination={{ ...pagination, limit }} onPageChange={setPage} onLimitChange={setLimit} />}
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={(open: boolean) => !open && closeDialog()}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{editItem ? t('themes.edit', 'Edit Theme') : t('themes.create', 'Create Theme')}</DialogTitle>
                        <DialogDescription>{t('themes.form_desc', 'Fill in the theme color details.')}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('themes.name', 'Theme Name')} <span className="text-destructive">*</span></Label>
                            <Input id="name" {...form.register('name')} placeholder="e.g. Ocean Blue" />
                            {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Assigned Plan</Label>
                            <Controller
                                control={form.control}
                                name="plans"
                                render={({ field }) => (
                                    <Select 
                                        value={field.value[0]?.toString() || "unassigned"} 
                                        onValueChange={(val) => field.onChange(val === "unassigned" ? [] : [Number(val)])}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Assign a plan..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unassigned" className="text-muted-foreground italic">-- No Plan Assigned --</SelectItem>
                                            {subPlans.map((plan: any) => (
                                                <SelectItem key={plan.id} value={plan.id.toString()}>{plan.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { key: 'header_color', label: 'Header Color' },
                                { key: 'footer_color', label: 'Footer Color' },
                                { key: 'primary_color', label: 'Primary Color' },
                                { key: 'secondary_color', label: 'Secondary Color' },
                                { key: 'hover_color', label: 'Hover Color' },
                                { key: 'text_color', label: 'Text Color' },
                            ].map(({ key, label }) => (
                                <div key={key} className="space-y-1">
                                    <Label className="text-xs font-medium">{t(`themes.${key}`, label)}</Label>
                                    <div className="flex gap-2">
                                        <Controller
                                            control={form.control}
                                            name={key as any}
                                            render={({ field }) => (
                                                <>
                                                    <Input
                                                        type="color"
                                                        value={field.value || '#000000'}
                                                        onChange={field.onChange}
                                                        className="w-12 h-9 cursor-pointer p-1"
                                                    />
                                                    <Input
                                                        type="text"
                                                        value={field.value || ''}
                                                        onChange={field.onChange}
                                                        className="flex-1 h-9 text-sm uppercase"
                                                        placeholder="#000000"
                                                    />
                                                </>
                                            )}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 mt-2">
                            <Label htmlFor="is_active">{t('common.active', 'Active')}</Label>
                            <div className="flex items-center h-10">
                                <Controller
                                    control={form.control}
                                    name="is_active"
                                    render={({ field }) => (
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeDialog}>{t('common.cancel', 'Cancel')}</Button>
                            <Button type="submit" isLoading={isPending}>
                                {isPending ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <DeleteDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title={t('common.are_you_sure', 'Are you sure?')}
                description={t('common.delete_confirm', 'This action cannot be undone.')}
                isDeleting={deleteTheme.isPending}
                onConfirm={() => {
                    if (deleteId) {
                        deleteTheme.mutate(deleteId, {
                            onSuccess: () => setDeleteId(null),
                            onError: () => setDeleteId(null)
                        });
                    }
                }}
            />
        </div>
    );
}
