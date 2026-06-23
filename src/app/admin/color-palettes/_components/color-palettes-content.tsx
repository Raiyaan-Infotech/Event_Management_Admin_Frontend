'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Palette } from 'lucide-react';
import {
    useColorPalettes,
    useCreateColorPalette,
    useUpdateColorPalette,
    useDeleteColorPalette,
    ColorPalette,
} from '@/hooks/use-color-palettes';
import { CommonTable, type CommonColumn } from '@/components/common/common-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PageLoader } from '@/components/common/page-loader';
import { TablePagination, type PaginationMeta } from '@/components/common/table-pagination';
import { DeleteDialog } from '@/components/common/delete-dialog';
import { PermissionGuard } from '@/components/guards/permission-guard';

// The 4 semantic website colors (maps to the website builder + preview roles).
const COLOR_FIELDS = [
    { key: 'primary_bg_color',     label: 'Primary Background', hint: 'Header, footer, buttons & highlights', default: '#7C3AED' },
    { key: 'primary_text_color',   label: 'Primary Text',       hint: 'UI block headings',                    default: '#0F172A' },
    { key: 'secondary_text_color', label: 'Secondary Text',     hint: 'Sub-text below headings',              default: '#64748B' },
    { key: 'paragraph_color',      label: 'Paragraph',          hint: 'Terms & Conditions / Privacy body',    default: '#475569' },
] as const;

type ColorKey = typeof COLOR_FIELDS[number]['key'];

const schema = z.object({
    name:                 z.string().trim().min(1, 'Name is required'),
    primary_bg_color:     z.string().nullable().optional(),
    primary_text_color:   z.string().nullable().optional(),
    secondary_text_color: z.string().nullable().optional(),
    paragraph_color:      z.string().nullable().optional(),
    is_active:            z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

const DEFAULT_FORM: FormData = {
    name: '',
    primary_bg_color:     '#7C3AED',
    primary_text_color:   '#0F172A',
    secondary_text_color: '#64748B',
    paragraph_color:      '#475569',
    is_active: true,
};

function ColorSwatches({ row }: { row: ColorPalette }) {
    return (
        <div className="flex items-center gap-1.5">
            {COLOR_FIELDS.map(f => (
                <div
                    key={f.key}
                    title={`${f.label}: ${row[f.key] || '—'}`}
                    className="w-5 h-5 rounded-full border border-black/10 shadow-sm shrink-0"
                    style={{ backgroundColor: row[f.key] || '#e5e7eb' }}
                />
            ))}
        </div>
    );
}

export function ColorPalettesContent() {
    const [page, setPage]   = useState(1);
    const [limit, setLimit] = useState(10);
    const { data: res, isLoading } = useColorPalettes({ page, limit });
    const palettes   = useMemo(() => res?.data ?? [], [res]);
    const pagination = res?.pagination as PaginationMeta | undefined;

    const createPalette = useCreateColorPalette();
    const updatePalette = useUpdateColorPalette();
    const deletePalette = useDeleteColorPalette();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editItem,   setEditItem]   = useState<ColorPalette | null>(null);
    const [deleteId,   setDeleteId]   = useState<number | null>(null);

    const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: DEFAULT_FORM });

    const closeDialog = () => { setDialogOpen(false); setEditItem(null); form.reset(); };

    const openCreate = () => {
        setEditItem(null);
        form.reset(DEFAULT_FORM);
        setDialogOpen(true);
    };

    const openEdit = (item: ColorPalette) => {
        setEditItem(item);
        form.reset({
            name:                 item.name,
            primary_bg_color:     item.primary_bg_color     || DEFAULT_FORM.primary_bg_color,
            primary_text_color:   item.primary_text_color   || DEFAULT_FORM.primary_text_color,
            secondary_text_color: item.secondary_text_color || DEFAULT_FORM.secondary_text_color,
            paragraph_color:      item.paragraph_color      || DEFAULT_FORM.paragraph_color,
            is_active:            Number(item.is_active) === 1,
        });
        setDialogOpen(true);
    };

    const onSubmit = (data: FormData) => {
        const payload = { ...data, is_active: data.is_active ? 1 : 0 };
        if (editItem) {
            updatePalette.mutate({ id: editItem.id, data: payload as never }, { onSuccess: closeDialog });
        } else {
            createPalette.mutate(payload as never, { onSuccess: closeDialog });
        }
    };

    const columns: CommonColumn<ColorPalette>[] = [
        {
            key: 'name',
            header: 'Palette Name',
            sortable: true,
            render: (row) => (
                <div className="flex items-center gap-2">
                    <Palette className="size-4 text-muted-foreground shrink-0" />
                    <span className="font-medium">{row.name}</span>
                </div>
            ),
        },
        {
            key: 'primary_bg_color',
            header: 'Colors',
            render: (row) => <ColorSwatches row={row} />,
        },
        {
            key: 'is_active',
            header: 'Status',
            render: (row) => (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${Number(row.is_active) === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {Number(row.is_active) === 1 ? 'Active' : 'Inactive'}
                </span>
            ),
        },
    ];

    const isBusy = createPalette.isPending || updatePalette.isPending;

    return (
        <PermissionGuard permission="color_palettes.view">
            <div className="space-y-6">
                <PageLoader open={isBusy} />

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Color Palettes</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Reusable website color sets vendors can pick from in the website builder</p>
                    </div>
                    <Button onClick={openCreate} className="gap-2">
                        <Plus className="size-4" /> New Palette
                    </Button>
                </div>

                <CommonTable
                    data={palettes}
                    columns={columns}
                    isLoading={isLoading}
                    onEdit={openEdit}
                    onDelete={(row) => setDeleteId(row.id)}
                    emptyMessage="No color palettes found. Create your first palette."
                />

                {pagination && (
                    <TablePagination
                        pagination={pagination}
                        onPageChange={setPage}
                        onLimitChange={(v) => { setLimit(v); setPage(1); }}
                    />
                )}

                {/* Create / Edit dialog */}
                <Dialog open={dialogOpen} onOpenChange={(o) => !o && closeDialog()}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{editItem ? 'Edit Color Palette' : 'New Color Palette'}</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-1">
                            {/* Name */}
                            <div className="space-y-1.5">
                                <Label>Palette Name <span className="text-destructive">*</span></Label>
                                <Input {...form.register('name')} placeholder="e.g. Royal Purple, Corporate Dark" />
                                {form.formState.errors.name && (
                                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                                )}
                            </div>

                            {/* Color pickers — 2-column grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {COLOR_FIELDS.map(f => {
                                    const colorValue = form.watch(f.key as ColorKey) || '';
                                    return (
                                        <div key={f.key} className="space-y-1.5">
                                            <Label className="text-xs">{f.label}</Label>
                                            <div className="flex items-center gap-2 border rounded-md pl-3 pr-2 h-10 bg-background focus-within:ring-2 focus-within:ring-ring">
                                                <input
                                                    type="color"
                                                    value={colorValue || f.default}
                                                    onChange={(e) => form.setValue(f.key as ColorKey, e.target.value, { shouldDirty: true })}
                                                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0"
                                                />
                                                <input
                                                    type="text"
                                                    value={colorValue}
                                                    onChange={(e) => form.setValue(f.key as ColorKey, e.target.value, { shouldDirty: true })}
                                                    placeholder={f.default}
                                                    spellCheck={false}
                                                    className="flex-1 min-w-0 text-sm font-mono bg-transparent border-0 outline-none focus:ring-0 placeholder:text-muted-foreground/60"
                                                />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">{f.hint}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Active toggle */}
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div>
                                    <p className="text-sm font-medium">Active</p>
                                    <p className="text-xs text-muted-foreground">Inactive palettes won&apos;t appear in the website builder</p>
                                </div>
                                <Switch
                                    checked={form.watch('is_active')}
                                    onCheckedChange={(v) => form.setValue('is_active', v)}
                                />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={closeDialog}>Cancel</Button>
                                <Button type="submit" disabled={isBusy}>
                                    {editItem ? 'Save Changes' : 'Create Palette'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <DeleteDialog
                    open={!!deleteId}
                    onOpenChange={(o) => !o && setDeleteId(null)}
                    onConfirm={() => {
                        if (deleteId) deletePalette.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
                    }}
                    isDeleting={deletePalette.isPending}
                    title="Delete Color Palette"
                    description="This palette will be removed. Vendors who picked it will keep their colors but lose the palette reference."
                />
            </div>
        </PermissionGuard>
    );
}
