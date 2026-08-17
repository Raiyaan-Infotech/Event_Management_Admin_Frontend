'use client';

import { useState, useMemo } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CommonTable, type CommonColumn } from '@/components/common/common-table';
import { TablePagination, type PaginationMeta } from '@/components/common/table-pagination';
import { DeleteDialog } from '@/components/common/delete-dialog';
import { PageLoader } from '@/components/common/page-loader';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { DynamicIcon } from '@/components/common/dynamic-icon';
import { IconField, ColorField } from './icon-color-fields';
import { cn } from '@/lib/utils';
import type { TaxonomyRecord, TaxonomyPayload } from '@/hooks/use-menu-management';

/**
 * Event Category, Event Type and Religion are the same screen with different
 * labels, so they share this component rather than being three copies.
 *
 * Layout follows the Template Categories page (form card on top, searchable
 * table below); the field set follows the Menu Management mockup.
 */

export interface TaxonomyManagerProps<T extends TaxonomyRecord> {
    /** e.g. "Event Category" — used for headings, toasts and dialog copy. */
    entityLabel: string;
    /** Plural, for the table heading and empty state. */
    entityPlural: string;
    description: string;
    /** Field label for the name input, e.g. "Category Name". */
    nameLabel: string;
    namePlaceholder: string;
    iconLabel: string;
    colorLabel: string;
    /** Permission slug prefix, e.g. "event_categories". */
    permissionPrefix: string;
    /** Default colour for a fresh form. */
    defaultColor?: string;

    /**
     * Cascading scope selects rendered before the name field.
     *
     * Event Types has one (Event Category). Religions has two — Event Category
     * then its Event Type — matching how the records are actually scoped.
     * Each entry names the payload key it writes, so the same component serves
     * both without knowing the domain.
     */
    scopeSelects?: Array<{
        key: 'event_category_id' | 'event_type_id';
        label: string;
        placeholder: string;
        options: Array<{ id: number; name: string }>;
        isLoading?: boolean;
        /** Shown in place of the option list when there is nothing to choose. */
        emptyHint?: string;
        /** Locked until an earlier select has a value. */
        disabledUntil?: 'event_category_id';
        /** Cleared when this select changes, so a stale child can't survive. */
        clears?: Array<'event_category_id' | 'event_type_id'>;
    }>;

    /**
     * Fired whenever a scope value changes — on selection, on edit, and on
     * reset. The page needs it to refetch a dependent list (Event Types for the
     * chosen category); without the edit/reset calls, opening a saved row would
     * show an empty child dropdown.
     */
    onScopeChange?: (key: 'event_category_id' | 'event_type_id', value: string) => void;

    data: T[];
    pagination: PaginationMeta | null;
    isLoading: boolean;
    isSaving: boolean;
    isDeleting: boolean;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
    onSearch: (value: string) => void;
    onCreate: (payload: TaxonomyPayload, done: () => void) => void;
    onUpdate: (id: number, payload: Partial<TaxonomyPayload>, done: () => void) => void;
    onToggleStatus: (id: number, isActive: boolean) => void;
    onDelete: (id: number, done: () => void) => void;
}

interface FormState {
    name: string;
    description: string;
    icon: string;
    color: string;
    is_active: boolean;
    event_category_id: string;
    event_type_id: string;
}

const emptyForm = (defaultColor: string): FormState => ({
    name: '',
    description: '',
    icon: '',
    color: defaultColor,
    is_active: true,
    event_category_id: '',
    event_type_id: '',
});

export function TaxonomyManager<T extends TaxonomyRecord>(props: TaxonomyManagerProps<T>) {
    const {
        entityLabel,
        entityPlural,
        description,
        nameLabel,
        namePlaceholder,
        iconLabel,
        colorLabel,
        permissionPrefix,
        defaultColor = '#6E22FE',
        scopeSelects = [],
        onScopeChange,
        data,
        pagination,
        isLoading,
        isSaving,
        isDeleting,
        onPageChange,
        onLimitChange,
        onSearch,
        onCreate,
        onUpdate,
        onToggleStatus,
        onDelete,
    } = props;

    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<FormState>(() => emptyForm(defaultColor));
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Functional updaters throughout: the icon picker resolves asynchronously,
    // and a `{ ...form }` spread would write back a stale snapshot and wipe
    // whatever was typed while it was open.
    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => (prev[key as string] ? { ...prev, [key as string]: false } : prev));
    };

    const resetForm = () => {
        setEditingId(null);
        setForm(emptyForm(defaultColor));
        setErrors({});
        // Tell the page the scope is cleared too, or a dependent list stays
        // filtered to the record that was just being edited.
        scopeSelects.forEach((s) => onScopeChange?.(s.key, ''));
    };

    const handleEdit = (row: T) => {
        setEditingId(row.id);
        setForm({
            name: row.name ?? '',
            description: row.description ?? '',
            icon: row.icon ?? '',
            color: row.color ?? defaultColor,
            is_active: Number(row.is_active) === 1,
            event_category_id: (row as any).event_category_id
                ? String((row as any).event_category_id)
                : '',
            event_type_id: (row as any).event_type_id ? String((row as any).event_type_id) : '',
        });
        setErrors({});
        // Push the row's scope out so dependent lists load for THIS record —
        // otherwise the Event Type dropdown opens empty on edit.
        scopeSelects.forEach((s) => {
            const raw = (row as any)[s.key];
            onScopeChange?.(s.key, raw ? String(raw) : '');
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSave = () => {
        const next: Record<string, boolean> = {};
        if (!form.name.trim()) next.name = true;
        if (!form.description.trim()) next.description = true;
        if (!form.icon.trim()) next.icon = true;
        if (!form.color.trim()) next.color = true;
        // Every configured scope select is mandatory — a record with a missing
        // scope can never be reached by the Menu form's cascade.
        scopeSelects.forEach((s) => {
            if (!form[s.key]) next[s.key] = true;
        });

        if (Object.keys(next).length > 0) {
            setErrors(next);
            toast.error('Please fill all mandatory fields.');
            return;
        }
        setErrors({});

        const payload: TaxonomyPayload = {
            name: form.name.trim(),
            description: form.description.trim(),
            icon: form.icon,
            color: form.color,
            is_active: form.is_active,
            ...scopeSelects.reduce(
                (acc, s) => ({ ...acc, [s.key]: Number(form[s.key]) }),
                {} as Record<string, number>
            ),
        };

        if (editingId) {
            onUpdate(editingId, payload, resetForm);
        } else {
            onCreate(payload, resetForm);
        }
    };

    const columns: CommonColumn<T>[] = useMemo(() => {
        const cols: CommonColumn<T>[] = [
            {
                key: 'name',
                header: nameLabel,
                sortable: true,
                // Icon sits inside the name cell rather than in its own column —
                // it reads as part of the record and saves a column of width.
                render: (row) => (
                    <div className="flex items-center gap-2.5">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40">
                            <DynamicIcon name={row.icon} color={row.color} size="h-4 w-4" />
                        </span>
                        <span className="font-medium">{row.name}</span>
                    </div>
                ),
            },
            {
                key: 'description',
                header: 'Description',
                render: (row) =>
                    row.description ? (
                        // break-all + line-clamp, never `truncate` — the table is
                        // auto-layout, so truncate has no width to work against.
                        <span
                            className="block max-w-xs break-all line-clamp-2 text-xs text-muted-foreground"
                            title={row.description}
                        >
                            {row.description}
                        </span>
                    ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                    ),
            },
        ];

        // One column per configured scope, reading the joined record the API
        // returns (`category` / `eventType`).
        scopeSelects.forEach((s) => {
            const relation = s.key === 'event_category_id' ? 'category' : 'eventType';
            cols.push({
                key: relation,
                header: s.label,
                render: (row) => {
                    const joined = (row as any)[relation];
                    return joined ? (
                        <span className="text-sm">{joined.name}</span>
                    ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                    );
                },
            });
        });

        cols.push(
            {
                key: 'color',
                header: 'Color',
                render: (row) =>
                    row.color ? (
                        <div className="flex items-center gap-2">
                            <span
                                className="inline-block h-4 w-4 shrink-0 rounded-full border border-border"
                                style={{ background: row.color }}
                            />
                            <span className="font-mono text-[11px] text-muted-foreground">{row.color}</span>
                        </div>
                    ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                    ),
            }
        );

        return cols;
    }, [nameLabel, scopeSelects]);

    return (
        <PermissionGuard permission={`${permissionPrefix}.view`}>
            <div className="space-y-5">
                <PageLoader open={isSaving || isDeleting} />

                {/* Header */}
                <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-foreground">{entityPlural}</h1>
                        <p className="text-xs text-muted-foreground">{description}</p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={resetForm}
                        className="h-8 cursor-pointer border-rose-200 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                        <RotateCcw className="mr-1 h-3.5 w-3.5 text-rose-500" /> Reset Form
                    </Button>
                </div>

                {/* Add / Edit form */}
                <Card className="border-border bg-card shadow-xs">
                    <CardHeader className="border-b border-border bg-muted/40 px-4 py-3">
                        <CardTitle className="text-xs font-bold uppercase tracking-wide text-foreground">
                            {editingId ? `Edit ${entityLabel}` : `Add ${entityLabel}`}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {/* Scope selects — Event Types has one, Religions has two */}
                            {scopeSelects.map((s) => {
                                const locked = !!s.disabledUntil && !form[s.disabledUntil];
                                return (
                                    <div key={s.key} className="space-y-1.5">
                                        <Label className="text-sm font-medium">
                                            {s.label} <span className="text-destructive">*</span>
                                        </Label>
                                        <Select
                                            value={form[s.key]}
                                            disabled={locked}
                                            onValueChange={(v) => {
                                                setField(s.key, v);
                                                onScopeChange?.(s.key, v);
                                                // A child select still holding a value from the
                                                // previous parent would fail server validation.
                                                s.clears?.forEach((k) => {
                                                    setField(k, '');
                                                    onScopeChange?.(k, '');
                                                });
                                            }}
                                        >
                                            <SelectTrigger
                                                className={cn('h-10', errors[s.key] && 'border-destructive')}
                                            >
                                                <SelectValue placeholder={s.placeholder} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {s.options.length === 0 ? (
                                                    <div className="px-2 py-3 text-xs text-muted-foreground">
                                                        {s.isLoading
                                                            ? 'Loading…'
                                                            : s.emptyHint ?? 'Nothing to choose yet.'}
                                                    </div>
                                                ) : (
                                                    s.options.map((o) => (
                                                        <SelectItem key={o.id} value={String(o.id)}>
                                                            {o.name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                );
                            })}

                            {/* Name */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">
                                    {nameLabel} <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    value={form.name}
                                    onChange={(e) => setField('name', e.target.value)}
                                    placeholder={namePlaceholder}
                                    maxLength={100}
                                    className={cn('h-10', errors.name && 'border-destructive')}
                                />
                            </div>

                            {/* Status */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">
                                    Status <span className="text-destructive">*</span>
                                </Label>
                                <div className="flex h-10 items-center justify-between rounded-md border border-border bg-card px-3">
                                    <span className="text-sm text-muted-foreground">
                                        {form.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                    <Switch
                                        checked={form.is_active}
                                        onCheckedChange={(v) => setField('is_active', v)}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
                                <Label className="text-sm font-medium">
                                    Description <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    value={form.description}
                                    onChange={(e) => setField('description', e.target.value)}
                                    placeholder="Enter description"
                                    maxLength={255}
                                    className={cn('min-h-[80px] text-sm', errors.description && 'border-destructive')}
                                />
                            </div>

                            <IconField
                                label={iconLabel}
                                required
                                value={form.icon}
                                onChange={(v) => setField('icon', v)}
                                color={form.color}
                                error={errors.icon}
                                helper={`Select an icon to represent this ${entityLabel.toLowerCase()}.`}
                            />

                            <ColorField
                                label={colorLabel}
                                required
                                value={form.color}
                                onChange={(v) => setField('color', v)}
                                error={errors.color}
                                helper={`Choose a color for this ${entityLabel.toLowerCase()}.`}
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                            {editingId && (
                                <Button type="button" variant="outline" size="sm" onClick={resetForm} className="h-9">
                                    Cancel
                                </Button>
                            )}
                            <Button type="button" size="sm" onClick={handleSave} disabled={isSaving} className="h-9 gap-1.5">
                                <Save className="h-3.5 w-3.5" />
                                {isSaving ? 'Saving...' : editingId ? `Update ${entityLabel}` : `Save ${entityLabel}`}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* List */}
                <Card className="border-border bg-card shadow-xs">
                    <CardHeader className="border-b border-border bg-muted/40 px-4 py-3">
                        <CardTitle className="text-xs font-bold uppercase tracking-wide text-foreground">
                            {entityPlural} List
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <CommonTable
                            columns={columns}
                            data={data as any}
                            isLoading={isLoading}
                            emptyMessage={`No ${entityPlural.toLowerCase()} found. Create your first one above.`}
                            searchPlaceholder={`Search ${entityPlural.toLowerCase()}...`}
                            onSearch={onSearch}
                            onStatusToggle={(row, value) => onToggleStatus(row.id, value)}
                            onEdit={handleEdit}
                            onDelete={(row) => setDeleteId(row.id)}
                            disableStatusToggle={(row) => !!row.has_pending_approval}
                            disableEdit={(row) => !!row.has_pending_approval}
                            disableDelete={(row) => !!row.has_pending_approval}
                            showStatus
                            showCreated
                            showActions
                        />
                        {pagination && (
                            <TablePagination
                                pagination={pagination}
                                onPageChange={onPageChange}
                                onLimitChange={onLimitChange}
                            />
                        )}
                    </CardContent>
                </Card>

                <DeleteDialog
                    open={deleteId !== null}
                    onOpenChange={(open: boolean) => !open && setDeleteId(null)}
                    title={`Delete ${entityLabel}`}
                    description={`Are you sure you want to delete this ${entityLabel.toLowerCase()}? This action cannot be undone.`}
                    isDeleting={isDeleting}
                    onConfirm={() => {
                        if (deleteId !== null) {
                            onDelete(deleteId, () => {
                                setDeleteId(null);
                                // Clearing the form matters when the row being
                                // deleted is the one loaded into it.
                                if (editingId === deleteId) resetForm();
                            });
                        }
                    }}
                />
            </div>
        </PermissionGuard>
    );
}
