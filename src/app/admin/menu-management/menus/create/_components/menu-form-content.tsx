'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft,
    Globe,
    LayoutList,
    Plus,
    RotateCcw,
    Save,
    Smartphone,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PageLoader } from '@/components/common/page-loader';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { ConfirmResetDialog } from '@/components/common/confirm-reset-dialog';
import { cn } from '@/lib/utils';
import { IconField, ColorField } from '../../../_components/icon-color-fields';
import {
    useEventMenu,
    useCreateEventMenu,
    useUpdateEventMenu,
    useEventCategories,
    useEventTypes,
    useReligions,
    type MenuPlatform,
} from '@/hooks/use-menu-management';

interface FormState {
    name: string;
    description: string;
    remarks: string;
    menu_type: MenuPlatform[];
    event_category_id: string;
    event_type_id: string;
    religion_id: string;
    display_website: boolean;
    display_mobile: boolean;
    active_website: boolean;
    active_mobile: boolean;
    sort_order: number;
    icon: string;
    color: string;
}

const emptyForm = (): FormState => ({
    name: '',
    description: '',
    remarks: '',
    menu_type: ['website', 'mobile'],
    event_category_id: '',
    event_type_id: '',
    religion_id: '',
    display_website: true,
    display_mobile: true,
    active_website: true,
    active_mobile: true,
    sort_order: 1,
    icon: '',
    color: '#6E22FE',
});

export function MenuFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const isEdit = !!id;

    const [form, setForm] = useState<FormState>(emptyForm);
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [resetOpen, setResetOpen] = useState(false);
    const [loadedId, setLoadedId] = useState<string | null>(null);

    const { data: existing, isLoading: loadingMenu, refetch } = useEventMenu(id ?? undefined);
    const { data: categories, isLoading: loadingCategories } = useEventCategories({ limit: 200, is_active: true });

    // Religions are scoped under (category, type) as well, so the list narrows
    // with the cascade. Fetching unscoped would offer religions the backend
    // rejects for this menu.
    const { data: religions, isLoading: loadingReligions } = useReligions({
        limit: 200,
        is_active: true,
        event_category_id: form.event_category_id || undefined,
        event_type_id: form.event_type_id || undefined,
    });

    // Event Types are fetched for the selected category only — a type from
    // another category is rejected by the backend, so it must not be offerable.
    const { data: eventTypes, isLoading: loadingTypes } = useEventTypes({
        limit: 200,
        is_active: true,
        event_category_id: form.event_category_id || undefined,
    });

    const createMenu = useCreateEventMenu((menu) => {
        // Stay on the form and switch to edit mode, so Save doesn't bounce the
        // user away from a record they may still be editing.
        router.replace(`/admin/menu-management/menus/create?id=${menu.id}`);
    });
    const updateMenu = useUpdateEventMenu();

    const applyRecord = (record: NonNullable<typeof existing>) => {
        setForm({
            name: record.name ?? '',
            description: record.description ?? '',
            remarks: record.remarks ?? '',
            menu_type: record.menu_type?.length ? record.menu_type : ['website'],
            event_category_id: record.event_category_id ? String(record.event_category_id) : '',
            event_type_id: record.event_type_id ? String(record.event_type_id) : '',
            religion_id: record.religion_id ? String(record.religion_id) : '',
            display_website: !!record.display_website,
            display_mobile: !!record.display_mobile,
            active_website: !!record.active_website,
            active_mobile: !!record.active_mobile,
            sort_order: record.sort_order ?? 1,
            icon: record.icon ?? '',
            color: record.color ?? '#6E22FE',
        });
        setErrors({});
    };

    // Load once per id. Without the guard, every refetch would clobber whatever
    // the user has typed since.
    useEffect(() => {
        if (existing && id && loadedId !== id) {
            applyRecord(existing);
            setLoadedId(id);
        }
    }, [existing, id, loadedId]);

    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => (prev[key as string] ? { ...prev, [key as string]: false } : prev));
    };

    const toggleMenuType = (platform: MenuPlatform, checked: boolean) => {
        setForm((prev) => ({
            ...prev,
            menu_type: checked
                ? Array.from(new Set([...prev.menu_type, platform]))
                : prev.menu_type.filter((p) => p !== platform),
        }));
        setErrors((prev) => (prev.menu_type ? { ...prev, menu_type: false } : prev));
    };

    const wantsWebsite = form.menu_type.includes('website');
    const wantsMobile = form.menu_type.includes('mobile');

    const handleSave = () => {
        const next: Record<string, boolean> = {};
        if (!form.name.trim()) next.name = true;
        if (form.menu_type.length === 0) next.menu_type = true;
        if (!form.event_category_id) next.event_category_id = true;
        if (!form.event_type_id) next.event_type_id = true;
        if (!form.religion_id) next.religion_id = true;
        if (!form.icon.trim()) next.icon = true;
        if (!form.color.trim()) next.color = true;

        if (Object.keys(next).length > 0) {
            setErrors(next);
            toast.error('Please fill all mandatory fields.');
            return;
        }
        setErrors({});

        const payload = {
            name: form.name.trim(),
            description: form.description.trim() || null,
            remarks: form.remarks.trim() || null,
            menu_type: form.menu_type,
            event_category_id: Number(form.event_category_id),
            event_type_id: Number(form.event_type_id),
            religion_id: Number(form.religion_id),
            // A platform the menu does not target has no meaningful status.
            display_website: wantsWebsite ? form.display_website : false,
            display_mobile: wantsMobile ? form.display_mobile : false,
            active_website: wantsWebsite ? form.active_website : false,
            active_mobile: wantsMobile ? form.active_mobile : false,
            sort_order: Number(form.sort_order) || 0,
            icon: form.icon,
            color: form.color,
        };

        if (isEdit && id) {
            updateMenu.mutate({ id: Number(id), data: payload });
        } else {
            createMenu.mutate(payload);
        }
    };

    const handleSaveAndAddAnother = () => {
        const next: Record<string, boolean> = {};
        if (!form.name.trim()) next.name = true;
        if (form.menu_type.length === 0) next.menu_type = true;
        if (!form.event_category_id) next.event_category_id = true;
        if (!form.event_type_id) next.event_type_id = true;
        if (!form.religion_id) next.religion_id = true;
        if (!form.icon.trim()) next.icon = true;
        if (!form.color.trim()) next.color = true;

        if (Object.keys(next).length > 0) {
            setErrors(next);
            toast.error('Please fill all mandatory fields.');
            return;
        }
        setErrors({});

        createMenu.mutate(
            {
                name: form.name.trim(),
                description: form.description.trim() || null,
                remarks: form.remarks.trim() || null,
                menu_type: form.menu_type,
                event_category_id: Number(form.event_category_id),
                event_type_id: Number(form.event_type_id),
                religion_id: Number(form.religion_id),
                display_website: wantsWebsite ? form.display_website : false,
                display_mobile: wantsMobile ? form.display_mobile : false,
                active_website: wantsWebsite ? form.active_website : false,
                active_mobile: wantsMobile ? form.active_mobile : false,
                sort_order: Number(form.sort_order) || 0,
                icon: form.icon,
                color: form.color,
            },
            {
                onSuccess: () => {
                    // Keep the taxonomy selections — consecutive menus almost
                    // always belong to the same event — and bump the order.
                    setForm((prev) => ({
                        ...prev,
                        name: '',
                        icon: '',
                        sort_order: (Number(prev.sort_order) || 0) + 1,
                    }));
                },
            }
        );
    };

    /**
     * Reset re-reads the saved record rather than reverting to local state, so
     * it genuinely discards unsaved edits instead of restoring a stale copy.
     */
    const handleReset = async () => {
        if (isEdit && id) {
            const fresh = await refetch();
            if (fresh.data) applyRecord(fresh.data);
        } else {
            setForm(emptyForm());
            setErrors({});
        }
    };

    const isSaving = createMenu.isPending || updateMenu.isPending;
    const categoryOptions = categories?.data ?? [];
    const typeOptions = eventTypes?.data ?? [];

    return (
        <PermissionGuard permission={isEdit ? 'event_menus.edit' : 'event_menus.create'}>
            <div className="space-y-5">
                <PageLoader open={isSaving || (isEdit && loadingMenu)} />

                {/* Header */}
                <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-foreground">
                            {isEdit ? 'Edit Menu' : 'Add Menu Name'}
                        </h1>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/admin/menu-management/menus')}
                        className="h-9 gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Menu List
                    </Button>
                </div>

                <Card className="border-border bg-card shadow-xs">
                    <CardHeader className="border-b border-border bg-muted/40 px-4 py-3">
                        <div className="flex items-center gap-2.5">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <LayoutList className="h-4 w-4" />
                            </span>
                            <div>
                                <CardTitle className="text-sm font-bold text-foreground">Menu Information</CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    Create a new menu for website and mobile app.
                                </p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-5 p-4">
                        {/* Row 1 — name + menu type */}
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">
                                    Menu Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    value={form.name}
                                    onChange={(e) => setField('name', e.target.value)}
                                    placeholder="Enter menu name (e.g. Home, Gallery, Agenda)"
                                    maxLength={150}
                                    className={cn('h-10', errors.name && 'border-destructive')}
                                />
                                <p className="text-[11px] text-muted-foreground">
                                    This name will be used to identify the menu.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">
                                    Menu Type (Select Multiple) <span className="text-destructive">*</span>
                                </Label>
                                <div
                                    className={cn(
                                        'flex h-10 items-center gap-6 rounded-md border border-border bg-card px-3',
                                        errors.menu_type && 'border-destructive'
                                    )}
                                >
                                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                                        <Checkbox
                                            checked={wantsWebsite}
                                            onCheckedChange={(c) => toggleMenuType('website', c === true)}
                                        />
                                        Website
                                    </label>
                                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                                        <Checkbox
                                            checked={wantsMobile}
                                            onCheckedChange={(c) => toggleMenuType('mobile', c === true)}
                                        />
                                        Mobile App
                                    </label>
                                </div>
                                <p className="text-[11px] text-muted-foreground">Select one or more menu types.</p>
                            </div>
                        </div>

                        {/* Row 2 — taxonomy */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">
                                    Event Category <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={form.event_category_id}
                                    onValueChange={(v) => {
                                        setField('event_category_id', v);
                                        // Type AND religion are scoped under the
                                        // category; keeping either would fail
                                        // server validation.
                                        setField('event_type_id', '');
                                        setField('religion_id', '');
                                    }}
                                >
                                    <SelectTrigger className={cn('h-10', errors.event_category_id && 'border-destructive')}>
                                        <SelectValue placeholder="Select event category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoryOptions.length === 0 ? (
                                            <div className="px-2 py-3 text-xs text-muted-foreground">
                                                {loadingCategories ? 'Loading…' : 'No event categories yet.'}
                                            </div>
                                        ) : (
                                            categoryOptions.map((c) => (
                                                <SelectItem key={c.id} value={String(c.id)}>
                                                    {c.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">
                                    Event Type <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={form.event_type_id}
                                    onValueChange={(v) => {
                                        setField('event_type_id', v);
                                        // Religion is scoped to the event type.
                                        setField('religion_id', '');
                                    }}
                                    disabled={!form.event_category_id}
                                >
                                    <SelectTrigger className={cn('h-10', errors.event_type_id && 'border-destructive')}>
                                        <SelectValue
                                            placeholder={
                                                form.event_category_id
                                                    ? 'Select event type'
                                                    : 'Select a category first'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {typeOptions.length === 0 ? (
                                            <div className="px-2 py-3 text-xs text-muted-foreground">
                                                {loadingTypes ? 'Loading…' : 'No event types in this category.'}
                                            </div>
                                        ) : (
                                            typeOptions.map((t) => (
                                                <SelectItem key={t.id} value={String(t.id)}>
                                                    {t.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">
                                    Religion <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={form.religion_id}
                                    onValueChange={(v) => setField('religion_id', v)}
                                    disabled={!form.event_type_id}
                                >
                                    <SelectTrigger
                                        className={cn('h-10', errors.religion_id && 'border-destructive')}
                                    >
                                        <SelectValue
                                            placeholder={
                                                form.event_type_id ? 'Select religion' : 'Select an event type first'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(religions?.data ?? []).length === 0 ? (
                                            <div className="px-2 py-3 text-xs text-muted-foreground">
                                                {loadingReligions
                                                    ? 'Loading…'
                                                    : 'No religions for this event type.'}
                                            </div>
                                        ) : (
                                            (religions?.data ?? []).map((r) => (
                                                <SelectItem key={r.id} value={String(r.id)}>
                                                    {r.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <p className="text-[11px] text-muted-foreground">
                                    Religions are listed for the selected event category and type.
                                </p>
                            </div>
                        </div>

                        {/* Row 3 — the two status panels */}
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <StatusPanel
                                title="Display / Hide Status"
                                subtitle="Show or hide this menu in website and mobile app."
                                websiteLabel="Show menu in website"
                                mobileLabel="Show menu in mobile app"
                                showWebsite={wantsWebsite}
                                showMobile={wantsMobile}
                                websiteValue={form.display_website}
                                mobileValue={form.display_mobile}
                                onWebsiteChange={(v) => setField('display_website', v)}
                                onMobileChange={(v) => setField('display_mobile', v)}
                            />
                            <StatusPanel
                                title="Active / Inactive Status"
                                subtitle="Activate or deactivate this menu in website and mobile app."
                                websiteLabel="Menu will be active in website"
                                mobileLabel="Menu will be active in mobile app"
                                showWebsite={wantsWebsite}
                                showMobile={wantsMobile}
                                websiteValue={form.active_website}
                                mobileValue={form.active_mobile}
                                onWebsiteChange={(v) => setField('active_website', v)}
                                onMobileChange={(v) => setField('active_mobile', v)}
                            />
                        </div>

                        {/* Row 4 — order, icon, colour */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">
                                    Sort Order <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={form.sort_order}
                                    onChange={(e) => setField('sort_order', Number(e.target.value))}
                                    className="h-10"
                                />
                                <p className="text-[11px] text-muted-foreground">
                                    Lower numbers will appear first in the menu list.
                                </p>
                            </div>

                            <IconField
                                label="Menu Icon"
                                required
                                value={form.icon}
                                onChange={(v) => setField('icon', v)}
                                color={form.color}
                                error={errors.icon}
                                helper="Select an icon to represent this menu."
                            />

                            <ColorField
                                label="Menu Color"
                                required
                                value={form.color}
                                onChange={(v) => setField('color', v)}
                                error={errors.color}
                                helper="Choose a color for the menu icon and highlights."
                            />
                        </div>
                        {/* Row 5 — free text. Optional: a menu is usable without either. */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">Description</Label>
                                <Textarea
                                    value={form.description}
                                    onChange={(e) => setField('description', e.target.value)}
                                    placeholder="What this menu is for"
                                    className="min-h-[80px] text-sm"
                                />
                                <p className="text-[11px] text-muted-foreground">
                                    Shown on the menu's view page.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">Remarks</Label>
                                <Textarea
                                    value={form.remarks}
                                    onChange={(e) => setField('remarks', e.target.value.slice(0, 300))}
                                    placeholder="Internal note"
                                    className="min-h-[80px] text-sm"
                                />
                                <p className="text-right text-[11px] text-muted-foreground">
                                    {form.remarks.length}/300
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer actions */}
                <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setResetOpen(true)}
                        className="h-9 gap-2 border-rose-200 text-rose-600 hover:bg-rose-50"
                    >
                        <RotateCcw className="h-4 w-4" /> Reset
                    </Button>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button type="button" onClick={handleSave} disabled={isSaving} className="h-9 gap-2">
                            <Save className="h-4 w-4" />
                            {isEdit ? 'Update Menu' : 'Save Menu'}
                        </Button>
                        {/* Only meaningful when creating — in edit mode there is
                            no "another" to chain from. */}
                        {!isEdit && (
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleSaveAndAddAnother}
                                disabled={isSaving}
                                className="h-9 gap-2"
                            >
                                <Plus className="h-4 w-4" /> Save &amp; Add Another
                            </Button>
                        )}
                    </div>
                </div>

                <ConfirmResetDialog open={resetOpen} onOpenChange={setResetOpen} onConfirm={handleReset} />
            </div>
        </PermissionGuard>
    );
}

function StatusPanel({
    title,
    subtitle,
    websiteLabel,
    mobileLabel,
    showWebsite,
    showMobile,
    websiteValue,
    mobileValue,
    onWebsiteChange,
    onMobileChange,
}: {
    title: string;
    subtitle: string;
    websiteLabel: string;
    mobileLabel: string;
    showWebsite: boolean;
    showMobile: boolean;
    websiteValue: boolean;
    mobileValue: boolean;
    onWebsiteChange: (value: boolean) => void;
    onMobileChange: (value: boolean) => void;
}) {
    return (
        <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-semibold text-foreground">
                {title} <span className="text-destructive">*</span>
            </p>
            <p className="mb-3 text-xs text-muted-foreground">{subtitle}</p>

            <div className="divide-y divide-border">
                {showWebsite && (
                    <StatusRow
                        icon={<Globe className="h-4 w-4" />}
                        title="Website"
                        subtitle={websiteLabel}
                        checked={websiteValue}
                        onChange={onWebsiteChange}
                    />
                )}
                {showMobile && (
                    <StatusRow
                        icon={<Smartphone className="h-4 w-4" />}
                        title="Mobile App"
                        subtitle={mobileLabel}
                        checked={mobileValue}
                        onChange={onMobileChange}
                    />
                )}
                {!showWebsite && !showMobile && (
                    <p className="py-3 text-xs text-muted-foreground">
                        Select a menu type above to configure this.
                    </p>
                )}
            </div>
        </div>
    );
}

function StatusRow({
    icon,
    title,
    subtitle,
    checked,
    onChange,
}: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-3 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    {icon}
                </span>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{title}</p>
                    <p className="break-words text-xs text-muted-foreground">{subtitle}</p>
                </div>
            </div>
            <Switch checked={checked} onCheckedChange={onChange} />
        </div>
    );
}
