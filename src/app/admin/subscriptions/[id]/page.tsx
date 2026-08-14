'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Info, Users, IndianRupee, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoader } from '@/components/common/page-loader';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { DynamicIcon } from '@/components/common/dynamic-icon';
import {
    useSubscriptionPlan,
    formatPlanPrice,
    BILLING_CYCLES,
} from '@/hooks/use-subscription-plans';

export default function ViewSubscriptionPlanPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { data: plan, isLoading } = useSubscriptionPlan(id);

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

    return (
        <PermissionGuard permission="subscription_plans.view">
            <div className="space-y-5">
                <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => router.push('/admin/subscriptions')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight text-foreground">
                                View Subscription Plan Details
                            </h1>
                            <p className="text-xs text-muted-foreground">Detailed information about this subscription plan.</p>
                        </div>
                    </div>

                    <Button
                        onClick={() => router.push(`/admin/subscriptions/create?id=${plan.id}`)}
                        className="h-9 gap-2"
                    >
                        <Pencil className="h-4 w-4" /> Edit Plan
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px] lg:items-start">
                    <div className="space-y-5">
                        <Section icon={<Info className="h-4 w-4" />} title="Plan Information">
                            <DetailGrid
                                rows={[
                                    ['Plan Name', plan.name],
                                    ['Plan Code', plan.plan_code],
                                    ['Status', isActive ? 'Active' : 'Inactive'],
                                    ['Plan Type', plan.planType?.name ?? '—'],
                                    ['Billing Cycle', cycleLabel],
                                    ['Trial Period', `${plan.trial_days} Days`],
                                    ['Short Description', plan.short_description || '—'],
                                ]}
                            />
                        </Section>

                        <Section icon={<Users className="h-4 w-4" />} title="Applies To">
                            {/* A null scope means the plan is not restricted. */}
                            <DetailGrid
                                rows={[
                                    ['Event Category', plan.category?.name ?? 'All Categories'],
                                    ['Event Type', plan.eventType?.name ?? 'All Types'],
                                    ['Religion', plan.religion?.name ?? 'All Religions'],
                                ]}
                            />
                            <p className="mt-2 text-xs text-muted-foreground">
                                Menus are available based on the above selection.
                            </p>
                        </Section>

                        <Section icon={<IndianRupee className="h-4 w-4" />} title="Pricing Information">
                            <DetailGrid
                                rows={[
                                    ['Price', formatPlanPrice(plan)],
                                    ['Billing Cycle', cycleLabel],
                                    ['Currency', plan.currency_code],
                                    ['Trial Period', `${plan.trial_days} Days`],
                                ]}
                            />
                        </Section>

                        <Section icon={<Eye className="h-4 w-4" />} title="Plan Visibility">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm text-muted-foreground">
                                    {plan.is_visible ? 'Visible to all subscribers' : 'Hidden from subscribers'}
                                </span>
                                <Badge
                                    variant="outline"
                                    className={
                                        plan.is_visible
                                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                            : 'border-slate-300 bg-slate-50 text-slate-600'
                                    }
                                >
                                    {plan.is_visible ? 'Enabled' : 'Disabled'}
                                </Badge>
                            </div>
                        </Section>

                        <Card className="border-border bg-card shadow-xs">
                            <CardHeader className="border-b border-border bg-muted/40 px-4 py-3">
                                <CardTitle className="text-sm font-bold text-foreground">
                                    Included Menus ({menus.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                {menus.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No menus included in this plan.</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                                        {menus.map((pm) => {
                                            const limitCount = Object.keys(pm.limits_json ?? {}).length;
                                            return (
                                                <div
                                                    key={pm.menu_id}
                                                    className="flex flex-col items-center gap-1.5 rounded-lg border border-border p-3 text-center"
                                                >
                                                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted/40">
                                                        <DynamicIcon
                                                            name={pm.menu?.icon}
                                                            color={pm.menu?.color}
                                                            size="h-4 w-4"
                                                        />
                                                    </span>
                                                    <span className="break-all text-xs font-medium">
                                                        {pm.menu?.name ?? `Menu #${pm.menu_id}`}
                                                    </span>
                                                    <div className="flex flex-wrap justify-center gap-1">
                                                        {!!pm.for_website && (
                                                            <Badge variant="secondary" className="text-[9px]">Web</Badge>
                                                        )}
                                                        {!!pm.for_mobile && (
                                                            <Badge variant="secondary" className="text-[9px]">App</Badge>
                                                        )}
                                                    </div>
                                                    {limitCount > 0 && (
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {limitCount} limit{limitCount === 1 ? '' : 's'}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Summary sidebar */}
                    <Card className="border-border bg-card shadow-xs lg:sticky lg:top-6">
                        <CardHeader className="border-b border-border bg-muted/40 px-4 py-3">
                            <CardTitle className="text-sm font-bold text-foreground">Plan Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-4">
                            <div>
                                <Badge
                                    variant="outline"
                                    className={
                                        isActive
                                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                            : 'border-slate-300 bg-slate-50 text-slate-600'
                                    }
                                >
                                    {plan.is_trial ? 'Trial' : isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                <h2 className="mt-2 break-all text-lg font-bold text-foreground">{plan.name}</h2>
                                {plan.short_description && (
                                    <p className="break-words text-xs text-muted-foreground">{plan.short_description}</p>
                                )}
                            </div>

                            <dl className="space-y-2 border-t border-border pt-3">
                                {[
                                    ['Plan Code', plan.plan_code],
                                    ['Plan Type', plan.planType?.name ?? '—'],
                                    ['Billing Cycle', cycleLabel],
                                    ['Trial Period', `${plan.trial_days} Days`],
                                    ['Price', formatPlanPrice(plan)],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex items-start justify-between gap-3">
                                        <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
                                        <dd className="break-all text-right text-xs font-semibold text-foreground">{value}</dd>
                                    </div>
                                ))}
                            </dl>

                            <div className="space-y-2 border-t border-border pt-3">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    Applies To
                                </p>
                                {[
                                    ['Event Category', plan.category?.name ?? 'All Categories'],
                                    ['Event Type', plan.eventType?.name ?? 'All Types'],
                                    ['Religion', plan.religion?.name ?? 'All Religions'],
                                    ['Total Menus', String(plan.total_menus)],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex items-start justify-between gap-3">
                                        <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
                                        <span className="break-all text-right text-xs font-semibold text-foreground">{value}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                onClick={() => router.push('/admin/subscriptions')}
                                className="w-full"
                            >
                                Close
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PermissionGuard>
    );
}

function Section({
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
            <CardHeader className="border-b border-border bg-muted/40 px-4 py-3">
                <div className="flex items-center gap-2.5">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                        {icon}
                    </span>
                    <CardTitle className="text-sm font-bold text-foreground">{title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-4">{children}</CardContent>
        </Card>
    );
}

function DetailGrid({ rows }: { rows: Array<[string, string]> }) {
    return (
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map(([label, value]) => (
                <div key={label} className="min-w-0 space-y-0.5">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
                    <dd className="break-words text-sm text-foreground">{value}</dd>
                </div>
            ))}
        </dl>
    );
}
