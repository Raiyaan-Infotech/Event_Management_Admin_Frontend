'use client';

import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Repeat } from 'lucide-react';
import {
    usePlanTypes,
    useCreatePlanType,
    useUpdatePlanType,
    useUpdatePlanTypeStatus,
    useDeletePlanType,
    PlanType,
} from '@/hooks/use-plan-types';
import { useVendors } from '@/hooks/use-vendors';
import { useTranslation } from '@/hooks/use-translation';
import { CommonTable, type CommonColumn } from '@/components/common/common-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PageLoader } from '@/components/common/page-loader';
import { TablePagination } from '@/components/common/table-pagination';
import { DeleteDialog } from '@/components/common/delete-dialog';
import { RichTextEditor } from '@/components/common/rich-text-editor';
import { SearchableSelect } from '@/components/common/searchable-select';

/**
 * Plan Types — master data for the "Plan Type" dropdown in the Subscription
 * plan wizard.
 *
 * Backed by the `plan_types` table (renamed from `subscriptions`) and
 * /api/v1/plan-types. price / discounted_price / label_color / features stay on
 * the row because the public website pricing section still reads them — they
 * are simply no longer editable here.
 */
const schema = z.object({
    name: z.string().trim().min(1, 'Plan name is required'),
    description: z.string().default(''),
    features: z.string().default(''),
    sort_order: z.coerce.number().int().min(0).default(0),
    is_active: z.boolean().default(true),
    is_custom: z.boolean().default(false),
    vendor_id: z.preprocess(
        (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
        z.number().nullable().default(null)
    ),
}).refine(
    (data) => !data.is_custom || data.vendor_id != null,
    { message: 'Vendor is required for custom plans', path: ['vendor_id'] }
);

type FormData = z.infer<typeof schema>;

function normalise(item: PlanType) {
    return {
        ...item,
        is_active: item.is_active,
        is_custom: item.is_custom,
        vendor_id: item.vendor_id ?? null,
        created_at: (item as any).created_at ?? (item as any).createdAt ?? '',
    };
}

export function PlanTypesContent() {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const { data: subsResponse, isLoading } = usePlanTypes({ page, limit });
    const raw: PlanType[] = subsResponse?.data ?? [];
    const pagination = subsResponse?.pagination;
    const { data: vendorsResponse } = useVendors({ limit: 500 });
    const vendors = vendorsResponse?.data ?? [];
    const vendorOptions = useMemo(
        () => vendors.map((v: any) => ({ value: String(v.id), label: v.company_name || v.name })),
        [vendors]
    );
    const planTypes = useMemo(() => raw.map(normalise), [raw]);

    const createPlanType = useCreatePlanType();
    const updatePlanType = useUpdatePlanType();
    const updateStatus = useUpdatePlanTypeStatus();
    const deletePlanType = useDeletePlanType();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editItem, setEditItem] = useState<PlanType | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '', description: '', features: '', sort_order: 0,
            is_active: true, is_custom: false, vendor_id: null,
        },
    });

    const watchIsCustom = form.watch('is_custom');

    const closeDialog = () => {
        setDialogOpen(false);
        setEditItem(null);
        form.reset();
    };

    const openCreate = () => {
        setEditItem(null);
        form.reset({
            name: '', description: '', features: '', sort_order: 0,
            is_active: true, is_custom: false, vendor_id: null,
        });
        setDialogOpen(true);
    };

    const openEdit = (item: PlanType) => {
        if (Number(item.is_active) === 2) return;
        setEditItem(item);
        form.reset({
            name: item.name,
            description: item.description || '',
            features: item.features || '',
            sort_order: item.sort_order ?? 0,
            is_active: Number(item.is_active) === 1,
            is_custom: Number(item.is_custom) === 1,
            vendor_id: item.vendor_id ?? null,
        });
        setDialogOpen(true);
    };

    const onSubmit = (data: FormData) => {
        const isDuplicate = planTypes.some(
            (s) => s.sort_order === data.sort_order && s.id !== editItem?.id
        );
        if (isDuplicate) {
            form.setError('sort_order', { message: `Sort order ${data.sort_order} is already in use` });
            return;
        }
        closeDialog();
        const payload = {
            ...data,
            vendor_id: data.is_custom ? data.vendor_id : null,
        };
        if (editItem) {
            updatePlanType.mutate({ id: editItem.id, data: payload });
        } else {
            createPlanType.mutate(payload);
        }
    };

    const columns: CommonColumn<PlanType>[] = [
        {
            key: 'name',
            header: 'Plan Type',
            sortable: true,
            render: (row) => (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{row.name}</span>
                    {Number(row.is_custom) === 1 && (
                        <Badge variant="outline" className="text-xs border-primary/40 text-primary">Custom</Badge>
                    )}
                </div>
            ),
        },
        {
            key: 'sort_order',
            header: 'Sort Order',
            sortable: true,
            render: (row) => <span className="tabular-nums text-sm">{row.sort_order ?? 0}</span>,
        },
    ];

    const isPending = createPlanType.isPending || updatePlanType.isPending;

    return (
        <div className="space-y-6">
            <PageLoader open={isLoading || isPending || deletePlanType.isPending || updateStatus.isPending} />
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Repeat className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Plan Types</CardTitle>
                                <CardDescription>
                                    Plan types available when creating a subscription plan
                                </CardDescription>
                            </div>
                        </div>
                        <Button size="sm" onClick={openCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Plan Type
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <CommonTable
                        columns={columns}
                        data={planTypes as any}
                        isLoading={isLoading}
                        emptyMessage="No plan types found. Create your first one."
                        onStatusToggle={(row, val) => updateStatus.mutate({ id: row.id, is_active: val ? 1 : 0 })}
                        onEdit={openEdit}
                        onDelete={(row) => setDeleteId(row.id)}
                        disableStatusToggle={(row) => Number(row.is_active) === 2 || !!row.has_pending_approval}
                        disableEdit={(row) => Number(row.is_active) === 2 || !!row.has_pending_approval}
                        disableDelete={(row) => Number(row.is_active) === 2 || !!row.has_pending_approval}
                        showStatus
                        showCreated
                        showActions
                    />
                    {pagination && <TablePagination pagination={{ ...pagination, limit }} onPageChange={setPage} onLimitChange={setLimit} />}
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editItem ? 'Edit Plan Type' : 'Add Plan Type'}</DialogTitle>
                        <DialogDescription>Fill in the plan type details.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">

                        {/* Plan Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Plan Name <span className="text-destructive">*</span></Label>
                            <Input id="name" {...form.register('name')} placeholder="e.g. Pro Plan" />
                            {form.formState.errors.name && (
                                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" {...form.register('description')} placeholder="Brief description..." rows={2} />
                        </div>

                        {/* Custom Plan toggle */}
                        <div className="space-y-2">
                            <Label>Custom Plan</Label>
                            <div className="flex items-center gap-2">
                                <Controller
                                    control={form.control}
                                    name="is_custom"
                                    render={({ field }) => (
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                                <span className="text-sm text-muted-foreground">
                                    {watchIsCustom ? 'Custom plan assigned to a specific vendor' : 'Standard plan available to all'}
                                </span>
                            </div>
                        </div>

                        {/* Vendor dropdown — only when is_custom is true */}
                        {watchIsCustom && (
                            <div className="space-y-2">
                                <Label>Vendor <span className="text-destructive">*</span></Label>
                                <Controller
                                    control={form.control}
                                    name="vendor_id"
                                    render={({ field }) => (
                                        <SearchableSelect
                                            options={vendorOptions}
                                            value={field.value ? String(field.value) : undefined}
                                            onValueChange={(val) => field.onChange(val ? Number(val) : null)}
                                            placeholder="Select a vendor..."
                                            searchPlaceholder="Search vendors..."
                                            emptyText="No vendors found"
                                        />
                                    )}
                                />
                                {form.formState.errors.vendor_id && (
                                    <p className="text-xs text-destructive">{form.formState.errors.vendor_id.message}</p>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sort_order">Sort Order</Label>
                                <Input id="sort_order" type="number" min={0} {...form.register('sort_order')} placeholder="0" />
                                {form.formState.errors.sort_order ? (
                                    <p className="text-xs text-destructive">{form.formState.errors.sort_order.message}</p>
                                ) : (
                                    <p className="text-[11px] text-muted-foreground">Lower number = higher in list</p>
                                )}
                            </div>
                        </div>

                        {/* Features - Rich Text */}
                        <div className="space-y-2">
                            <Label>Features</Label>
                            <Controller
                                control={form.control}
                                name="features"
                                render={({ field }) => (
                                    <RichTextEditor
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Describe the features of this plan..."
                                        variant="compact"
                                    />
                                )}
                            />
                        </div>

                        {/* Active */}
                        <div className="space-y-2">
                            <Label>{t('common.active', 'Active')}</Label>
                            <div className="flex items-center gap-2">
                                <Controller
                                    control={form.control}
                                    name="is_active"
                                    render={({ field }) => (
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                                <span className="text-sm text-muted-foreground">
                                    {form.watch('is_active') ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeDialog} disabled={isPending}>{t('common.cancel', 'Cancel')}</Button>
                            <Button type="submit" disabled={isPending}>{t('common.save', 'Save')}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <DeleteDialog
                open={!!deleteId}
                onOpenChange={(open: boolean) => !open && setDeleteId(null)}
                title="Delete Subscription"
                description="Are you sure you want to delete this subscription plan? This action cannot be undone."
                isDeleting={deletePlanType.isPending}
                onConfirm={() => {
                    if (deleteId) {
                        deletePlanType.mutate(deleteId, {
                            onSuccess: () => setDeleteId(null),
                            onError: () => setDeleteId(null),
                        });
                    }
                }}
            />
        </div>
    );
}
