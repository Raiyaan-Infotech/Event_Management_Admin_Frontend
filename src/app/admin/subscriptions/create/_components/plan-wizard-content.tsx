'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    ChevronDown,
    FileText,
    Search,
    Send,
    Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
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
import { DynamicIcon } from '@/components/common/dynamic-icon';
import { cn } from '@/lib/utils';
import { usePlanTypes } from '@/hooks/use-plan-types';
import { usePlanBadges, badgeStyleProps, type BadgeStyle } from '@/hooks/use-plan-badges';
import { useEventCategories, useEventTypes, useReligions, useEventMenus } from '@/hooks/use-menu-management';
import {
    useSubscriptionPlan,
    useCreateSubscriptionPlan,
    useUpdateSubscriptionPlan,
    useLimitCatalog,
    BILLING_CYCLES,
    CURRENCIES,
    currencySymbol,
    type BillingCycle,
    type SubscriptionPlanPayload,
    type SubscriptionPlan,
} from '@/hooks/use-subscription-plans';

const STEPS = [
    'Plan Information',
    'Menu Selection',
    'Pricing',
    'Configuration',
    'Review',
    'Success',
] as const;

interface MenuSelection {
    for_website: boolean;
    for_mobile: boolean;
    limits: Record<string, string>;
}

interface FormState {
    // Step 1
    name: string;
    plan_code: string;
    plan_type_id: string;
    plan_badge_id: string;
    billing_cycle: BillingCycle;
    short_description: string;
    is_active: boolean;
    // Step 2
    for_website: boolean;
    for_mobile: boolean;
    event_category_id: string;
    event_type_id: string;
    religion_id: string;
    // Step 3
    currency_code: string;
    price: string;
    trial_days: string;
}

const emptyForm = (): FormState => ({
    name: '',
    plan_code: '',
    plan_type_id: '',
    plan_badge_id: '',
    billing_cycle: 'monthly',
    short_description: '',
    is_active: true,
    for_website: true,
    for_mobile: true,
    event_category_id: '',
    event_type_id: '',
    religion_id: '',
    currency_code: 'INR',
    price: '',
    trial_days: '0',
});

export function PlanWizardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const isEdit = !!id;
    // "Manage Menus" from the list deep-links straight to step 2.
    const initialStep = Math.min(Math.max(Number(searchParams.get('step') || 1), 1), 5);

    const [step, setStep] = useState(initialStep);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [menuSearch, setMenuSearch] = useState('');
    const [selection, setSelection] = useState<Record<number, MenuSelection>>({});
    const [loadedId, setLoadedId] = useState<string | null>(null);
    const [savedPlan, setSavedPlan] = useState<SubscriptionPlan | null>(null);

    const { data: existing, isLoading: loadingPlan } = useSubscriptionPlan(id ?? undefined);
    const { data: planTypes } = usePlanTypes({ limit: 200, is_active: 1 });
    const { data: planBadges } = usePlanBadges();
    const { data: catalog } = useLimitCatalog();
    const { data: categories } = useEventCategories({ limit: 200, is_active: true });

    const { data: eventTypes } = useEventTypes({
        limit: 200,
        is_active: true,
        event_category_id: form.event_category_id || undefined,
    });
    const { data: religions } = useReligions({
        limit: 200,
        is_active: true,
        event_category_id: form.event_category_id || undefined,
        event_type_id: form.event_type_id || undefined,
    });

    // The menus offered are the ones matching the plan's scope — a menu outside
    // it could never apply to a subscriber on this plan.
    const { data: menusData, isLoading: loadingMenus } = useEventMenus({
        limit: 200,
        is_active: true,
        event_category_id: form.event_category_id || undefined,
        event_type_id: form.event_type_id || undefined,
    });
    const menus = menusData?.data ?? [];

    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => (prev[key as string] ? { ...prev, [key as string]: false } : prev));
    };

    // Load once per id, so a refetch cannot clobber in-progress edits.
    useEffect(() => {
        if (!existing || !id || loadedId === id) return;
        setForm({
            name: existing.name ?? '',
            plan_code: existing.plan_code ?? '',
            plan_type_id: existing.plan_type_id ? String(existing.plan_type_id) : '',
            plan_badge_id: existing.plan_badge_id ? String(existing.plan_badge_id) : '',
            billing_cycle: existing.billing_cycle ?? 'monthly',
            short_description: existing.short_description ?? '',
            is_active: Number(existing.is_active) === 1,
            for_website: !!existing.for_website,
            for_mobile: !!existing.for_mobile,
            event_category_id: existing.event_category_id ? String(existing.event_category_id) : '',
            event_type_id: existing.event_type_id ? String(existing.event_type_id) : '',
            religion_id: existing.religion_id ? String(existing.religion_id) : '',
            currency_code: existing.currency_code ?? 'INR',
            price: String(Number(existing.price ?? 0)),
            trial_days: String(existing.trial_days ?? 0),
        });
        const next: Record<number, MenuSelection> = {};
        (existing.planMenus ?? []).forEach((pm) => {
            const limits: Record<string, string> = {};
            Object.entries(pm.limits_json ?? {}).forEach(([k, v]) => {
                limits[k] = v === null || v === undefined ? '' : String(v);
            });
            next[pm.menu_id] = {
                for_website: !!pm.for_website,
                for_mobile: !!pm.for_mobile,
                limits,
            };
        });
        setSelection(next);
        setLoadedId(id);
    }, [existing, id, loadedId]);

    const selectedIds = useMemo(
        () => Object.keys(selection).map(Number).filter((k) => selection[k]?.for_website || selection[k]?.for_mobile),
        [selection]
    );
    const selectedMenus = useMemo(
        () => menus.filter((m) => selectedIds.includes(m.id)),
        [menus, selectedIds]
    );

    const filteredMenus = useMemo(() => {
        const q = menuSearch.trim().toLowerCase();
        if (!q) return menus;
        return menus.filter((m) => m.name.toLowerCase().includes(q) || m.slug.toLowerCase().includes(q));
    }, [menus, menuSearch]);

    const toggleMenu = (menuId: number, platform: 'for_website' | 'for_mobile', checked: boolean) => {
        setSelection((prev) => {
            const current = prev[menuId] ?? { for_website: false, for_mobile: false, limits: {} };
            return { ...prev, [menuId]: { ...current, [platform]: checked } };
        });
    };

    const allSelected =
        filteredMenus.length > 0 &&
        filteredMenus.every((m) => selection[m.id]?.for_website || selection[m.id]?.for_mobile);

    const toggleAll = (checked: boolean) => {
        setSelection((prev) => {
            const next = { ...prev };
            filteredMenus.forEach((m) => {
                const current = next[m.id] ?? { for_website: false, for_mobile: false, limits: {} };
                next[m.id] = {
                    ...current,
                    // Only offer a platform the plan itself targets.
                    for_website: checked && form.for_website,
                    for_mobile: checked && form.for_mobile,
                };
            });
            return next;
        });
    };

    const setLimit = (menuId: number, key: string, value: string) => {
        setSelection((prev) => {
            const current = prev[menuId] ?? { for_website: false, for_mobile: false, limits: {} };
            return { ...prev, [menuId]: { ...current, limits: { ...current.limits, [key]: value } } };
        });
    };

    /* ------------------------------------------------------- step validation */

    const validateStep = (target: number): boolean => {
        const next: Record<string, boolean> = {};

        if (target >= 1) {
            if (!form.name.trim()) next.name = true;
            if (!form.plan_code.trim()) next.plan_code = true;
            if (!form.plan_type_id) next.plan_type_id = true;
            if (!form.billing_cycle) next.billing_cycle = true;
            if (!form.short_description.trim()) next.short_description = true;
        }
        if (target >= 2) {
            if (!form.for_website && !form.for_mobile) next.menu_for = true;
            if (selectedIds.length === 0) next.menus = true;
        }
        if (target >= 3) {
            if (!form.currency_code) next.currency_code = true;
            if (form.price === '' || Number.isNaN(Number(form.price))) next.price = true;
        }

        if (Object.keys(next).length > 0) {
            setErrors(next);
            toast.error('Please fill all mandatory fields.');
            return false;
        }
        setErrors({});
        return true;
    };

    const goNext = () => {
        if (!validateStep(step)) return;
        setStep((s) => Math.min(s + 1, 6));
    };

    /* ------------------------------------------------------------- persistence */

    const buildPayload = (): SubscriptionPlanPayload => ({
        name: form.name.trim(),
        plan_code: form.plan_code.trim(),
        plan_type_id: form.plan_type_id ? Number(form.plan_type_id) : null,
        plan_badge_id: form.plan_badge_id ? Number(form.plan_badge_id) : null,
        billing_cycle: form.billing_cycle,
        short_description: form.short_description.trim(),
        for_website: form.for_website,
        for_mobile: form.for_mobile,
        // Empty = "applies to all", which is what the list renders as All Categories/Types/Religions.
        event_category_id: form.event_category_id ? Number(form.event_category_id) : null,
        event_type_id: form.event_type_id ? Number(form.event_type_id) : null,
        religion_id: form.religion_id ? Number(form.religion_id) : null,
        currency_code: form.currency_code,
        price: Number(form.price || 0),
        trial_days: Number(form.trial_days || 0),
        is_active: form.is_active,
        menus: selectedIds.map((menuId, index) => {
            const sel = selection[menuId];
            // Blank limit fields are dropped rather than stored as "" — a missing
            // key means unlimited, which is what the form shows.
            const limits = Object.entries(sel.limits ?? {}).reduce<Record<string, string | number>>(
                (acc, [k, v]) => {
                    if (v !== '' && v !== null && v !== undefined) acc[k] = v;
                    return acc;
                },
                {}
            );
            return {
                menu_id: menuId,
                for_website: sel.for_website,
                for_mobile: sel.for_mobile,
                limits_json: Object.keys(limits).length > 0 ? limits : null,
                sort_order: index,
            };
        }),
    });

    const createPlan = useCreateSubscriptionPlan((plan) => {
        setSavedPlan(plan);
        setStep(6);
    });
    const updatePlan = useUpdateSubscriptionPlan((plan) => {
        setSavedPlan(plan);
        setStep(6);
    });

    const submit = () => {
        if (!validateStep(3)) return;
        const payload = buildPayload();
        if (isEdit && id) updatePlan.mutate({ id: Number(id), data: payload });
        else createPlan.mutate(payload);
    };

    const isSaving = createPlan.isPending || updatePlan.isPending;
    const planTypeName = planTypes?.data?.find((p) => String(p.id) === form.plan_type_id)?.name ?? '—';
    // Inactive badges are excluded: pinning one would save an id that renders nothing.
    const activeBadges = useMemo(
        () => (planBadges ?? []).filter((b) => Boolean(Number(b.is_active))),
        [planBadges]
    );
    const selectedBadge = activeBadges.find((b) => String(b.id) === form.plan_badge_id);
    const cycleLabel = BILLING_CYCLES.find((c) => c.value === form.billing_cycle)?.label ?? form.billing_cycle;

    return (
        <PermissionGuard permission={isEdit ? 'subscription_plans.edit' : 'subscription_plans.create'}>
            <div className="space-y-5">
                <PageLoader open={isSaving || (isEdit && loadingPlan)} />

                <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-foreground">
                            {isEdit ? 'Edit Subscription Plan' : 'Add Subscription Plan'}
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            {isEdit ? 'Update this plan and its included menus.' : 'Create a new subscription plan.'}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/admin/subscriptions')}
                        className="h-9 gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Plans
                    </Button>
                </div>

                <StepBar step={step} onStepClick={(target) => {
                    // Backwards is always safe; forwards must pass the steps in between.
                    if (target < step || validateStep(target - 1)) setStep(target);
                }} />

                {step === 1 && (
                    <WizardCard title="Plan Information" subtitle="Create a new subscription plan with basic details.">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Field label="Plan Name" required error={errors.name}>
                                <Input
                                    value={form.name}
                                    onChange={(e) => setField('name', e.target.value)}
                                    placeholder="e.g. Premium Plan"
                                    maxLength={150}
                                    className={cn('h-10', errors.name && 'border-destructive')}
                                />
                            </Field>

                            <Field
                                label="Plan Code"
                                required
                                error={errors.plan_code}
                                helper="Unique code for internal reference (no spaces)."
                            >
                                <Input
                                    value={form.plan_code}
                                    // Upper-cased and stripped as you type, so what you see is what is saved.
                                    onChange={(e) =>
                                        setField('plan_code', e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))
                                    }
                                    placeholder="e.g. PREMIUM"
                                    maxLength={50}
                                    className={cn('h-10 font-mono', errors.plan_code && 'border-destructive')}
                                />
                            </Field>

                            <Field label="Plan Type" required error={errors.plan_type_id}>
                                <Select value={form.plan_type_id} onValueChange={(v) => setField('plan_type_id', v)}>
                                    <SelectTrigger className={cn('h-10', errors.plan_type_id && 'border-destructive')}>
                                        <SelectValue placeholder="Select plan type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(planTypes?.data ?? []).length === 0 ? (
                                            <div className="px-2 py-3 text-xs text-muted-foreground">
                                                No plan types yet — create one under Plan Types.
                                            </div>
                                        ) : (
                                            (planTypes?.data ?? []).map((p) => (
                                                <SelectItem key={p.id} value={String(p.id)}>
                                                    {p.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field label="Billing Cycle" required error={errors.billing_cycle}>
                                <Select
                                    value={form.billing_cycle}
                                    onValueChange={(v) => setField('billing_cycle', v as BillingCycle)}
                                >
                                    <SelectTrigger className={cn('h-10', errors.billing_cycle && 'border-destructive')}>
                                        <SelectValue placeholder="Select billing cycle" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {BILLING_CYCLES.map((c) => (
                                            <SelectItem key={c.value} value={c.value}>
                                                {c.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field
                                label="Short Description"
                                required
                                error={errors.short_description}
                                helper={`${form.short_description.length}/200`}
                            >
                                <Textarea
                                    value={form.short_description}
                                    onChange={(e) => setField('short_description', e.target.value.slice(0, 200))}
                                    placeholder="Enter short description"
                                    className={cn('min-h-[96px] text-sm', errors.short_description && 'border-destructive')}
                                />
                            </Field>

                            <Field label="Status" required helper="Active plans will be visible to users.">
                                <div className="flex h-10 items-center gap-3 rounded-md border border-border bg-card px-3">
                                    <Switch
                                        checked={form.is_active}
                                        onCheckedChange={(v) => setField('is_active', v)}
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        {form.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </Field>

                            {/* Belongs here per the design, not on the Pricing step —
                                it is a property of the plan, and step 3 already
                                reads it back on the Review card. */}
                            <Field label="Trial Period (Days)" helper="Leave 0 for no trial.">
                                <Input
                                    type="number"
                                    min={0}
                                    value={form.trial_days}
                                    onChange={(e) => setField('trial_days', e.target.value)}
                                    className="h-10"
                                />
                            </Field>

                            {/* One badge per plan. Inactive badges are filtered out —
                                assigning one would show nothing on the card. The
                                'none' sentinel maps to '' because an empty SelectItem
                                value cannot be selected back once a badge is chosen. */}
                            <Field
                                label="Plan Badge"
                                helper={
                                    activeBadges.length
                                        ? 'Shown on this plan card. Manage the list under Plan Badges.'
                                        : 'No active badges yet — create one under Subscriptions > Plan Badges.'
                                }
                            >
                                <Select
                                    value={form.plan_badge_id || 'none'}
                                    onValueChange={(v) => setField('plan_badge_id', v === 'none' ? '' : v)}
                                    disabled={!activeBadges.length}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="No badge" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No badge</SelectItem>
                                        {activeBadges.map((b) => (
                                            <SelectItem key={b.id} value={String(b.id)}>
                                                {b.text}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedBadge && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">Preview:</span>
                                        <span {...badgeStyleProps(selectedBadge.style, selectedBadge.color)}>
                                            {selectedBadge.text}
                                        </span>
                                    </div>
                                )}
                            </Field>
                        </div>
                    </WizardCard>
                )}

                {step === 2 && (
                    <WizardCard title="Menu Selection" subtitle="Select the event menus you want to include in this plan.">
                        <div className="space-y-4">
                            <Field label="Menu For" required error={errors.menu_for}>
                                <div
                                    className={cn(
                                        'flex h-10 items-center gap-6 rounded-md border border-border bg-card px-3',
                                        errors.menu_for && 'border-destructive'
                                    )}
                                >
                                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                                        <Checkbox
                                            checked={form.for_website}
                                            onCheckedChange={(c) => setField('for_website', c === true)}
                                        />
                                        Website
                                    </label>
                                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                                        <Checkbox
                                            checked={form.for_mobile}
                                            onCheckedChange={(c) => setField('for_mobile', c === true)}
                                        />
                                        Mobile App
                                    </label>
                                </div>
                            </Field>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Field label="Event Category" helper="Leave empty to apply to all categories.">
                                    <Select
                                        value={form.event_category_id}
                                        onValueChange={(v) => {
                                            setField('event_category_id', v);
                                            // Type and religion belong to the old category.
                                            setField('event_type_id', '');
                                            setField('religion_id', '');
                                            setSelection({});
                                        }}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="All categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(categories?.data ?? []).map((c) => (
                                                <SelectItem key={c.id} value={String(c.id)}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field label="Event Type" helper="Leave empty to apply to all types.">
                                    <Select
                                        value={form.event_type_id}
                                        onValueChange={(v) => {
                                            setField('event_type_id', v);
                                            setField('religion_id', '');
                                            setSelection({});
                                        }}
                                        disabled={!form.event_category_id}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue
                                                placeholder={form.event_category_id ? 'All types' : 'Select a category first'}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(eventTypes?.data ?? []).map((t) => (
                                                <SelectItem key={t.id} value={String(t.id)}>
                                                    {t.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field label="Religion" helper="Leave empty to apply to all religions.">
                                    <Select
                                        value={form.religion_id}
                                        onValueChange={(v) => setField('religion_id', v)}
                                        disabled={!form.event_type_id}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue
                                                placeholder={form.event_type_id ? 'All religions' : 'Select an event type first'}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(religions?.data ?? []).map((r) => (
                                                <SelectItem key={r.id} value={String(r.id)}>
                                                    {r.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                            </div>

                            {/* Menu picker */}
                            <div className={cn('rounded-lg border border-border', errors.menus && 'border-destructive')}>
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-3">
                                    <div className="relative min-w-[220px] flex-1">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            value={menuSearch}
                                            onChange={(e) => setMenuSearch(e.target.value)}
                                            placeholder="Search menu..."
                                            className="h-9 pl-9"
                                        />
                                    </div>
                                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                                        <Checkbox checked={allSelected} onCheckedChange={(c) => toggleAll(c === true)} />
                                        Select All
                                    </label>
                                </div>

                                <div className="max-h-[360px] overflow-y-auto">
                                    <table className="w-full text-sm">
                                        <thead className="sticky top-0 bg-muted/60">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                                    Menu Name
                                                </th>
                                                <th className="w-24 px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                                    Website
                                                </th>
                                                <th className="w-24 px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                                    Mobile App
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loadingMenus ? (
                                                <tr>
                                                    <td colSpan={3} className="py-10 text-center text-muted-foreground">
                                                        Loading menus...
                                                    </td>
                                                </tr>
                                            ) : filteredMenus.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="py-10 text-center text-muted-foreground">
                                                        No menus match this scope.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredMenus.map((m) => {
                                                    const sel = selection[m.id];
                                                    return (
                                                        <tr key={m.id} className="border-t border-border/50">
                                                            <td className="px-3 py-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-muted/40">
                                                                        <DynamicIcon name={m.icon} color={m.color} size="h-3.5 w-3.5" />
                                                                    </span>
                                                                    <span className="break-all font-medium">{m.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-2 text-center">
                                                                {/* Disabled when the plan does not target that platform. */}
                                                                <Checkbox
                                                                    checked={!!sel?.for_website}
                                                                    disabled={!form.for_website}
                                                                    onCheckedChange={(c) => toggleMenu(m.id, 'for_website', c === true)}
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2 text-center">
                                                                <Checkbox
                                                                    checked={!!sel?.for_mobile}
                                                                    disabled={!form.for_mobile}
                                                                    onCheckedChange={(c) => toggleMenu(m.id, 'for_mobile', c === true)}
                                                                />
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
                                    {selectedIds.length} menu{selectedIds.length === 1 ? '' : 's'} selected
                                </div>
                            </div>
                        </div>
                    </WizardCard>
                )}

                {step === 3 && (
                    <WizardCard title="Pricing Details" subtitle="Set the price for this subscription plan.">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <Field label="Currency" required error={errors.currency_code}>
                                <Select value={form.currency_code} onValueChange={(v) => setField('currency_code', v)}>
                                    <SelectTrigger className={cn('h-10', errors.currency_code && 'border-destructive')}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CURRENCIES.map((c) => (
                                            <SelectItem key={c.code} value={c.code}>
                                                {c.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field label="Plan Price" required error={errors.price}>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                        {currencySymbol(form.currency_code)}
                                    </span>
                                    <Input
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        value={form.price}
                                        onChange={(e) => setField('price', e.target.value)}
                                        placeholder="0.00"
                                        className={cn('h-10 pl-7', errors.price && 'border-destructive')}
                                    />
                                </div>
                            </Field>

                            <Field label="Billing Cycle" required>
                                <Select
                                    value={form.billing_cycle}
                                    onValueChange={(v) => setField('billing_cycle', v as BillingCycle)}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {BILLING_CYCLES.map((c) => (
                                            <SelectItem key={c.value} value={c.value}>
                                                {c.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>
                    </WizardCard>
                )}

                {step === 4 && (
                    <WizardCard
                        title="Plan Configuration"
                        subtitle="Configure limits, quotas and other settings for the selected menus."
                    >
                        {selectedMenus.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No menus selected. Go back to Menu Selection to pick some.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {selectedMenus.map((m) => (
                                    <MenuLimitsPanel
                                        key={m.id}
                                        menu={m}
                                        fields={catalog?.[m.slug] ?? []}
                                        values={selection[m.id]?.limits ?? {}}
                                        onChange={(key, value) => setLimit(m.id, key, value)}
                                    />
                                ))}
                            </div>
                        )}
                    </WizardCard>
                )}

                {step === 5 && (
                    <div className="space-y-4">
                        <WizardCard title="Review & Confirm" subtitle="Review all details before creating the subscription plan.">
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                                <ReviewCard title="Plan Information" onEdit={() => setStep(1)} rows={[
                                    ['Plan Name', form.name || '—'],
                                    ['Plan Code', form.plan_code || '—'],
                                    ['Plan Type', planTypeName],
                                    ['Billing Cycle', cycleLabel],
                                    ['Status', form.is_active ? 'Active' : 'Inactive'],
                                    ['Plan Badge', selectedBadge?.text ?? 'No badge'],
                                    ['Short Description', form.short_description || '—'],
                                ]} />
                                <ReviewCard title="Pricing Information" onEdit={() => setStep(3)} rows={[
                                    ['Price', `${currencySymbol(form.currency_code)} ${Number(form.price || 0).toLocaleString()}`],
                                    ['Billing Cycle', cycleLabel],
                                    ['Trial Period', `${form.trial_days || 0} Days`],
                                    ['Currency', form.currency_code],
                                ]} />
                                <ReviewCard title="Menu Selection" onEdit={() => setStep(2)} rows={[
                                    ['Menu For', [form.for_website && 'Website', form.for_mobile && 'Mobile App'].filter(Boolean).join(', ') || '—'],
                                    ['Event Category', categories?.data?.find((c) => String(c.id) === form.event_category_id)?.name ?? 'All Categories'],
                                    ['Event Type', eventTypes?.data?.find((t) => String(t.id) === form.event_type_id)?.name ?? 'All Types'],
                                    ['Religion', religions?.data?.find((r) => String(r.id) === form.religion_id)?.name ?? 'All Religions'],
                                    ['Total Menus', String(selectedIds.length)],
                                ]} />
                            </div>
                        </WizardCard>

                        <Card className="border-border bg-card shadow-xs">
                            <CardHeader className="border-b border-border bg-muted/40 px-4 py-3">
                                <CardTitle className="text-xs font-bold uppercase tracking-wide text-foreground">
                                    Included Menus &amp; Configuration Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                {selectedMenus.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No menus selected.</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                                        {selectedMenus.map((m) => {
                                            const limitCount = Object.values(selection[m.id]?.limits ?? {}).filter(
                                                (v) => v !== '' && v !== null && v !== undefined
                                            ).length;
                                            return (
                                                <div
                                                    key={m.id}
                                                    className="flex flex-col items-center gap-1.5 rounded-lg border border-border p-3 text-center"
                                                >
                                                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted/40">
                                                        <DynamicIcon name={m.icon} color={m.color} size="h-4 w-4" />
                                                    </span>
                                                    <span className="break-all text-xs font-medium">{m.name}</span>
                                                    <Badge variant="secondary" className="text-[10px]">
                                                        {limitCount} Limit{limitCount === 1 ? '' : 's'}
                                                    </Badge>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {step === 6 && (() => {
                    // Everything here comes off the saved record, so it reflects
                    // what the server stored rather than what the form held.
                    const done = savedPlan;
                    // Prefer the badge the server joined back onto the saved row;
                    // selectedBadge is the fallback before `done` lands.
                    const savedBadge = done?.planBadge ?? selectedBadge ?? null;
                    const cycle = BILLING_CYCLES.find((c) => c.value === (done?.billing_cycle ?? form.billing_cycle));
                    const stamp = (value?: string | null) => {
                        if (!value) return '\u2014';
                        const d = new Date(value);
                        if (Number.isNaN(d.getTime())) return '\u2014';
                        return `${d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })} ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
                    };
                    const active = done ? Number(done.is_active) === 1 : form.is_active;

                    return (
                        <div className="mx-auto max-w-3xl space-y-5">
                            <h1 className="text-lg font-bold tracking-tight text-foreground">
                                Plan {isEdit ? 'Updated' : 'Created'} Successfully!
                            </h1>

                            <Card className="border-border bg-card shadow-xs">
                                <CardContent className="flex flex-col items-center gap-4 px-5 py-12 text-center">
                                    <span className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
                                        <CheckCircle2 className="h-14 w-14 text-emerald-600" />
                                    </span>

                                    <h2 className="text-xl font-bold text-foreground">
                                        Your Plan has been {isEdit ? 'updated' : 'created'} successfully!
                                    </h2>
                                    <p className="max-w-lg text-sm text-muted-foreground">
                                        All changes to the{' '}
                                        <span className="font-semibold text-emerald-600">
                                            {done?.name ?? form.name}
                                        </span>{' '}
                                        have been saved. The updated plan details are shown below.
                                    </p>

                                    <div className="flex w-full max-w-xl items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-left">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                        <p className="text-xs text-emerald-800">
                                            {active
                                                ? 'The updated plan is now active and available for new subscriptions.'
                                                : 'The plan is saved but inactive, so it is not offered for new subscriptions.'}
                                        </p>
                                    </div>

                                    <div className="mt-2 w-full max-w-2xl rounded-lg border border-border p-4 text-left">
                                        <div className="mb-4 flex flex-wrap items-center gap-2">
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                                <FileText className="h-4 w-4" />
                                            </span>
                                            <span className="text-sm font-bold text-foreground">
                                                {done?.name ?? form.name}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    'text-[11px]',
                                                    active
                                                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                                        : 'border-slate-300 bg-slate-50 text-slate-600'
                                                )}
                                            >
                                                {active ? 'Active' : 'Inactive'}
                                            </Badge>
                                            {/* Read back from the saved row where possible, so this
                                                reflects what was actually persisted. */}
                                            {savedBadge && (
                                                <span {...badgeStyleProps(savedBadge.style as BadgeStyle, savedBadge.color)}>
                                                    {savedBadge.text}
                                                </span>
                                            )}
                                        </div>

                                        <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                                            <SuccessRow label="Plan Code" value={done?.plan_code ?? form.plan_code} />
                                            <SuccessRow
                                                label={`Price (${cycle?.label ?? ''})`}
                                                value={`${currencySymbol(done?.currency_code ?? form.currency_code)} ${Number(done?.price ?? form.price ?? 0).toLocaleString()}`}
                                            />
                                            <SuccessRow label="Plan Type" value={done?.planType?.name ?? planTypeName} />
                                            <SuccessRow
                                                label="Status"
                                                value={
                                                    <span className={active ? 'text-emerald-600' : 'text-muted-foreground'}>
                                                        {active ? 'Active' : 'Inactive'}
                                                    </span>
                                                }
                                            />
                                            <SuccessRow label="Billing Cycle" value={cycle?.label ?? ''} />
                                            <SuccessRow label="Updated On" value={stamp(done?.updated_at)} />
                                            <SuccessRow
                                                label="Trial Period"
                                                value={`${done?.trial_days ?? form.trial_days} Days`}
                                            />
                                            <SuccessRow
                                                label="Updated By"
                                                value={done?.updater?.full_name ?? done?.creator?.full_name ?? '\u2014'}
                                            />
                                            <SuccessRow
                                                label="Trial Price"
                                                value={Number(done?.trial_days ?? form.trial_days) > 0 ? 'Free' : '\u2014'}
                                            />
                                            <SuccessRow
                                                label="Plan Badge"
                                                value={
                                                    savedBadge ? (
                                                        <span {...badgeStyleProps(savedBadge.style as BadgeStyle, savedBadge.color)}>
                                                            {savedBadge.text}
                                                        </span>
                                                    ) : (
                                                        'No badge'
                                                    )
                                                }
                                            />
                                        </dl>
                                    </div>

                                    <div className="mt-4 flex flex-col items-center gap-2">
                                        <Button
                                            onClick={() =>
                                                router.push(
                                                    done ? `/admin/subscriptions/${done.id}` : '/admin/subscriptions'
                                                )
                                            }
                                            className="h-10 w-56 gap-2"
                                        >
                                            <Eye className="h-4 w-4" /> View Plan Details
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => router.push('/admin/subscriptions')}
                                            className="h-10 w-56 gap-2"
                                        >
                                            <ArrowLeft className="h-4 w-4" /> Back to Plans
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    );
                })()}

                {/* Footer nav — hidden on the success screen, which has its own CTA */}
                {step < 6 && (
                    <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                        {step > 1 ? (
                            <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="h-9 gap-2">
                                <ArrowLeft className="h-4 w-4" /> Back
                            </Button>
                        ) : (
                            <Button variant="outline" onClick={() => router.push('/admin/subscriptions')} className="h-9">
                                Cancel
                            </Button>
                        )}

                        {step < 5 ? (
                            <Button onClick={goNext} className="h-9 gap-2">
                                Next: {STEPS[step]} <ArrowRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button onClick={submit} disabled={isSaving} className="h-9 gap-2 bg-emerald-600 hover:bg-emerald-700">
                                <Send className="h-4 w-4" />
                                {isEdit ? 'Update Plan' : 'Create Plan'}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </PermissionGuard>
    );
}

/* --------------------------------------------------------------- sub-components */

function StepBar({ step, onStepClick }: { step: number; onStepClick: (target: number) => void }) {
    return (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 rounded-lg border border-border bg-card p-3">
            {STEPS.map((label, i) => {
                const index = i + 1;
                const done = step > index;
                const active = step === index;
                return (
                    <button
                        key={label}
                        type="button"
                        // The success step is an outcome, not a destination.
                        disabled={index === 6}
                        onClick={() => onStepClick(index)}
                        className={cn(
                            'flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors',
                            index !== 6 && 'hover:bg-muted',
                            active ? 'font-semibold text-foreground' : 'text-muted-foreground',
                            index === 6 && 'cursor-default'
                        )}
                    >
                        <span
                            className={cn(
                                'inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                                active && 'bg-primary text-primary-foreground',
                                done && 'bg-emerald-100 text-emerald-700',
                                !active && !done && 'bg-muted text-muted-foreground'
                            )}
                        >
                            {done ? <Check className="h-3 w-3" /> : index}
                        </span>
                        {label}
                    </button>
                );
            })}
        </div>
    );
}

function WizardCard({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}) {
    return (
        <Card className="border-border bg-card shadow-xs">
            <CardHeader className="border-b border-border bg-muted/40 px-4 py-3">
                <div className="flex items-center gap-2.5">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <FileText className="h-4 w-4" />
                    </span>
                    <div>
                        <CardTitle className="text-sm font-bold text-foreground">{title}</CardTitle>
                        <p className="text-xs text-muted-foreground">{subtitle}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4">{children}</CardContent>
        </Card>
    );
}

function Field({
    label,
    required,
    helper,
    error,
    children,
}: {
    label: string;
    required?: boolean;
    helper?: string;
    error?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-sm font-medium">
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            {children}
            {helper && (
                <p className={cn('text-[11px]', error ? 'text-destructive' : 'text-muted-foreground')}>{helper}</p>
            )}
        </div>
    );
}

function MenuLimitsPanel({
    menu,
    fields,
    values,
    onChange,
}: {
    menu: { id: number; name: string; icon: string | null; color: string | null };
    fields: Array<{ key: string; label: string; type?: 'select'; options?: string[]; helper?: string }>;
    values: Record<string, string>;
    onChange: (key: string, value: string) => void;
}) {
    const [open, setOpen] = useState(true);

    return (
        <div className="rounded-lg border border-border">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
            >
                <span className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-muted/40">
                        <DynamicIcon name={menu.icon} color={menu.color} size="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm font-semibold">{menu.name}</span>
                    {fields.length === 0 && (
                        <span className="text-[11px] text-muted-foreground">no configurable limits</span>
                    )}
                </span>
                <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', open && 'rotate-180')} />
            </button>

            {open && fields.length > 0 && (
                <div className="grid grid-cols-1 gap-4 border-t border-border p-3 md:grid-cols-3">
                    {fields.map((f) => (
                        <div key={f.key} className="space-y-1.5">
                            <Label className="text-xs font-medium">
                                {f.label} <span className="text-destructive">*</span>
                            </Label>
                            {f.type === 'select' ? (
                                <Select value={values[f.key] ?? ''} onValueChange={(v) => onChange(f.key, v)}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Unlimited" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(f.options ?? []).map((o) => (
                                            <SelectItem key={o} value={o}>
                                                {o}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    type="number"
                                    min={0}
                                    value={values[f.key] ?? ''}
                                    onChange={(e) => onChange(f.key, e.target.value)}
                                    // Blank means unlimited — that is why it is not required.
                                    placeholder="Unlimited"
                                    className="h-9"
                                />
                            )}
                            {f.helper && <p className="text-[10px] text-muted-foreground">{f.helper}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ReviewCard({
    title,
    onEdit,
    rows,
}: {
    title: string;
    onEdit: () => void;
    rows: Array<[string, string]>;
}) {
    return (
        <div className="rounded-lg border border-border">
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-2">
                <span className="text-xs font-bold uppercase tracking-wide text-foreground">{title}</span>
                <button type="button" onClick={onEdit} className="text-xs font-semibold text-primary hover:underline">
                    Edit
                </button>
            </div>
            <dl className="space-y-2 p-3">
                {rows.map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-3">
                        <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
                        <dd className="break-all text-right text-xs font-medium text-foreground">{value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

/** "Label : Value", matching the rest of the subscription screens. */
function SuccessRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex min-w-0 items-start gap-2">
            <dt className="w-24 shrink-0 text-xs text-muted-foreground">{label}</dt>
            <span className="shrink-0 text-xs text-muted-foreground">:</span>
            <dd className="min-w-0 break-words text-sm font-medium text-foreground">{value}</dd>
        </div>
    );
}
