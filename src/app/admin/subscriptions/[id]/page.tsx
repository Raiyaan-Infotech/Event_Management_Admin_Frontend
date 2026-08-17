'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Info, Users, IndianRupee, Eye, Crown, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PageLoader } from '@/components/common/page-loader';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { DynamicIcon } from '@/components/common/dynamic-icon';
import { cn } from '@/lib/utils';
import {
    useSubscriptionPlan,
    formatPlanPrice,
    BILLING_CYCLES,
} from '@/hooks/use-subscription-plans';

// The menu grid is 10 columns at lg. Collapse only once it would run past two
// full rows, so the "+N more" tile completes a row instead of appearing at an
// arbitrary count. Derived from the layout rather than hardcoded to a number
// read off a mockup.
const MENU_GRID_COLS = 10;
const MENU_ROWS_BEFORE_COLLAPSE = 2;
const MENU_TILE_LIMIT = MENU_GRID_COLS * MENU_ROWS_BEFORE_COLLAPSE - 1; // last slot is the "+N more" tile

export default function ViewSubscriptionPlanPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { data: plan, isLoading } = useSubscriptionPlan(id);
    const [showAllMenus, setShowAllMenus] = useState(false);

    if (isLoading) return <PageLoader open />;
    if (!plan) {
        return (
            <div className="py-20 text-center text-sm text-muted-foreground">
                Plan not found.
                <div className="mt-4">
                    <Button variant="outline" onClick={() => router.push('/admin/subscriptions')}>
                        Back to Plans
                    </Button>
                </div>
            </div>
        );
    }

    const cycleLabel = BILLING_CYCLES.find((c) => c.value === plan.billing_cycle)?.label ?? plan.billing_cycle;
    const isActive = Number(plan.is_active) === 1;
    const menus = plan.planMenus ?? [];
    const planTypeName = plan.planType?.name ?? '—';

    const stamp = (value?: string) => {
        if (!value) return '—';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return '—';
        return `${d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })} ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
    };

    // Only collapse when it actually saves a row — hiding one tile behind a
    // "+1 more" button would be worse than just showing it.
    const shouldCollapse = !showAllMenus && menus.length > MENU_TILE_LIMIT + 1;
    const visibleMenus = shouldCollapse ? menus.slice(0, MENU_TILE_LIMIT) : menus;
    const hiddenCount = menus.length - visibleMenus.length;

    const statusBadge = (
        <Badge
            variant="outline"
            className={cn(
                'text-[11px]',
                isActive
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border-slate-300 bg-slate-50 text-slate-600'
            )}
        >
            {plan.is_trial ? 'Trial' : isActive ? 'Active' : 'Inactive'}
        </Badge>
    );

    return (
        <PermissionGuard permission="subscription_plans.view">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px] lg:items-start">
                {/* ---------------------------------------------------------- main */}
                <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 rounded-full"
                                onClick={() => router.push('/admin/subscriptions')}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-lg font-bold tracking-tight text-foreground">
                                    View Subscription Plan Details
                                </h1>
                                <p className="text-xs text-muted-foreground">
                                    Detailed information about this subscription plan.
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => router.push(`/admin/subscriptions/create?id=${plan.id}`)}
                            className="h-9 gap-2 border-primary/40 text-primary hover:bg-primary/5"
                        >
                            <Pencil className="h-4 w-4" /> Edit Plan
                        </Button>
                    </div>

                    <SectionCard icon={<Info className="h-4 w-4" />} title="Plan Information">
                        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
                            <Row label="Plan Name" value={plan.name} />
                            <Row label="Plan Code" value={plan.plan_code} />
                            <Row label="Status" value={statusBadge} />
                            {/* Stacked rather than inline — the only long value here. */}
                            <div className="min-w-0 space-y-1">
                                <p className="text-xs text-muted-foreground">Short Description</p>
                                <p className="break-words text-sm font-medium text-foreground">
                                    {plan.short_description || '—'}
                                </p>
                            </div>

                            <Row label="Plan Type" value={planTypeName} />
                            <Row label="Billing Cycle" value={cycleLabel} />
                            <Row label="Trial Period" value={`${plan.trial_days} Days`} />
                            <Row label="Created On" value={stamp(plan.created_at)} />

                            <Row label="Created By" value={plan.creator?.full_name ?? '—'} />
                            <Row label="Last Updated" value={stamp(plan.updated_at)} />
                            <Row label="Updated By" value={plan.updater?.full_name ?? '—'} />
                        </div>
                    </SectionCard>

                    {/* Applies To and Pricing share one card, split by a rule. */}
                    <Card className="border-border bg-card shadow-xs">
                        <CardContent className="space-y-5 p-5">
                            <div>
                                <SectionHeading icon={<Users className="h-4 w-4" />} title="Applies To" />
                                <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {/* A null scope means the plan is not restricted. */}
                                    <Row label="Event Category" value={plan.category?.name ?? 'All Categories'} />
                                    <Row label="Event Type" value={plan.eventType?.name ?? 'All Types'} />
                                    <Row label="Religion" value={plan.religion?.name ?? 'All Religions'} />
                                </div>
                                <p className="mt-3 text-xs text-muted-foreground">
                                    Menus will be available based on the above selection.
                                </p>
                            </div>

                            <div className="border-t border-border pt-5">
                                <SectionHeading icon={<IndianRupee className="h-4 w-4" />} title="Pricing Information" />
                                <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <Row label="Price" value={formatPlanPrice(plan)} />
                                    <Row label="Billing Cycle" value={cycleLabel} />
                                    <Row label="Plan Type" value={planTypeName} />
                                    <Row label="Trial Period" value={`${plan.trial_days} Days`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <SectionCard icon={<Eye className="h-4 w-4" />} title="Plan Visibility">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm text-muted-foreground">
                                {plan.is_visible ? 'Visible to all subscribers' : 'Hidden from subscribers'}
                            </span>
                            <Badge
                                variant="outline"
                                className={cn(
                                    'text-[11px]',
                                    plan.is_visible
                                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                        : 'border-slate-300 bg-slate-50 text-slate-600'
                                )}
                            >
                                {plan.is_visible ? 'Enabled' : 'Disabled'}
                            </Badge>
                        </div>
                    </SectionCard>

                    <Card className="border-border bg-card shadow-xs">
                        <CardContent className="p-5">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <p className="text-sm font-bold text-foreground">
                                    Included Menus ({menus.length})
                                </p>
                                {showAllMenus && menus.length > MENU_TILE_LIMIT + 1 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowAllMenus(false)}
                                        className="text-xs font-semibold text-primary hover:underline"
                                    >
                                        Show less
                                    </button>
                                )}
                            </div>

                            {menus.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No menus included in this plan.</p>
                            ) : (
                                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-10">
                                    {visibleMenus.map((pm) => {
                                        const limitCount = Object.keys(pm.limits_json ?? {}).length;
                                        return (
                                            <div
                                                key={pm.menu_id}
                                                className="flex flex-col items-center gap-1.5 rounded-lg border border-border p-2.5 text-center"
                                                title={limitCount > 0 ? `${limitCount} limit(s) configured` : undefined}
                                            >
                                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-primary/20 bg-primary/5">
                                                    <DynamicIcon name={pm.menu?.icon} color={pm.menu?.color} size="h-4 w-4" />
                                                </span>
                                                <span className="break-words text-[11px] font-medium leading-tight">
                                                    {pm.menu?.name ?? `Menu #${pm.menu_id}`}
                                                </span>
                                            </div>
                                        );
                                    })}

                                    {hiddenCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setShowAllMenus(true)}
                                            className="flex flex-col items-center justify-center rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-center text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                                        >
                                            +{hiddenCount} more
                                        </button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ------------------------------------------------------- sidebar */}
                <div className="space-y-4 lg:sticky lg:top-6">
                    <Card className="border-border bg-card shadow-xs">
                        <CardContent className="space-y-4 p-5">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                                    <Crown className="h-5 w-5" />
                                </span>
                                <span className="text-sm font-bold text-foreground">Plan Summary</span>
                            </div>

                            <div className="space-y-2">
                                {statusBadge}
                                <h2 className="break-words text-lg font-bold text-foreground">{plan.name}</h2>
                                {plan.short_description && (
                                    <p className="break-words text-xs text-muted-foreground">
                                        {plan.short_description}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3 border-t border-border pt-4">
                                <SummaryRow label="Plan Code" value={plan.plan_code} />
                                <SummaryRow label="Plan Type" value={planTypeName} />
                                <SummaryRow label="Billing Cycle" value={cycleLabel} />
                                <SummaryRow label="Trial Period" value={`${plan.trial_days} Days`} />
                                <SummaryRow
                                    label="Status"
                                    value={
                                        <span className={isActive ? 'text-emerald-600' : 'text-muted-foreground'}>
                                            {isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    }
                                />
                            </div>

                            <div className="space-y-3 border-t border-border pt-4">
                                <p className="text-xs font-bold text-foreground">Applies To</p>
                                <SummaryRow label="Event Category" value={plan.category?.name ?? 'All Categories'} />
                                <SummaryRow label="Event Type" value={plan.eventType?.name ?? 'All Types'} />
                                <SummaryRow label="Religion" value={plan.religion?.name ?? 'All Religions'} />
                                <SummaryRow label="Total Menus" value={String(plan.total_menus)} />
                            </div>

                            <div className="space-y-3 border-t border-border pt-4">
                                <p className="text-xs font-bold text-foreground">Visibility</p>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-xs text-muted-foreground">
                                        {plan.is_visible ? 'Visible to all subscribers' : 'Hidden from subscribers'}
                                    </span>
                                    {plan.is_visible ? (
                                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                                    ) : (
                                        <span className="text-xs text-muted-foreground">—</span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3 border-t border-border pt-4">
                                <p className="text-xs font-bold text-foreground">Timestamps</p>
                                <SummaryRow label="Created On" value={stamp(plan.created_at)} />
                                <SummaryRow label="Last Updated" value={stamp(plan.updated_at)} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sits outside the card, as drawn. */}
                    <Button
                        variant="outline"
                        onClick={() => router.push('/admin/subscriptions')}
                        className="h-10 w-full"
                    >
                        Close
                    </Button>
                </div>
            </div>
        </PermissionGuard>
    );
}

/* ------------------------------------------------------------- primitives */

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div className="mb-4 flex items-center gap-2">
            <span className="text-primary">{icon}</span>
            <span className="text-sm font-bold text-foreground">{title}</span>
        </div>
    );
}

function SectionCard({
    icon,
    title,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <Card className="border-border bg-card shadow-xs">
            <CardContent className="p-5">
                <SectionHeading icon={icon} title={title} />
                {children}
            </CardContent>
        </Card>
    );
}

/** "Label : Value", the layout used throughout the design. */
function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex min-w-0 items-start gap-2">
            <span className="w-24 shrink-0 text-xs text-muted-foreground">{label}</span>
            <span className="shrink-0 text-xs text-muted-foreground">:</span>
            <span className="min-w-0 break-words text-sm font-medium text-foreground">{value}</span>
        </div>
    );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-3">
            <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
            <span className="min-w-0 break-words text-right text-xs font-semibold text-foreground">{value}</span>
        </div>
    );
}
