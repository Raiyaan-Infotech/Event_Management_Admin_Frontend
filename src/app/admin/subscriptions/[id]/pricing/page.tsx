'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Pencil,
    IndianRupee,
    Gift,
    ReceiptText,
    CheckCircle2,
    Crown,
    ChevronRight,
    Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PageLoader } from '@/components/common/page-loader';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { cn } from '@/lib/utils';
import {
    useSubscriptionPlan,
    BILLING_CYCLES,
    currencySymbol,
} from '@/hooks/use-subscription-plans';

export default function ViewPricingPage({ params }: { params: Promise<{ id: string }> }) {
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

    const cycle = BILLING_CYCLES.find((c) => c.value === plan.billing_cycle);
    const cycleLabel = cycle?.label ?? plan.billing_cycle;
    const symbol = currencySymbol(plan.currency_code);
    const isActive = Number(plan.is_active) === 1;
    const menus = plan.planMenus ?? [];
    const trialDays = Number(plan.trial_days || 0);
    const price = Number(plan.price || 0);

    const stamp = (value?: string) => {
        if (!value) return '—';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return '—';
        return `${d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })} ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
    };

    const dateOnly = (d: Date) =>
        d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });

    /**
     * First charge lands when the trial ends. Counted from the plan's creation
     * date because that is the only date on the record — a real subscription
     * would count from its own start date instead.
     */
    const nextBilling = () => {
        if (trialDays <= 0) return '—';
        const start = new Date(plan.created_at);
        if (Number.isNaN(start.getTime())) return '—';
        start.setDate(start.getDate() + trialDays);
        return dateOnly(start);
    };

    /** "Billed yearly" under the headline price. */
    const billedLabel = plan.billing_cycle === 'lifetime'
        ? 'One-time payment'
        : `Billed ${cycleLabel.toLowerCase()}`;

    return (
        <PermissionGuard permission="subscription_plans.view">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px] lg:items-start">
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
                                <h1 className="text-lg font-bold tracking-tight text-foreground">View Pricing</h1>
                                <p className="text-xs text-muted-foreground">
                                    Detailed pricing information for this subscription plan.
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => router.push(`/admin/subscriptions/create?id=${plan.id}&step=3`)}
                            className="h-9 gap-2 border-primary/40 text-primary hover:bg-primary/5"
                        >
                            <Pencil className="h-4 w-4" /> Edit Plan
                        </Button>
                    </div>

                    {/* Pricing Overview */}
                    <Card className="border-border bg-card shadow-xs">
                        <CardContent className="space-y-4 p-5">
                            <SectionHeading icon={<IndianRupee className="h-4 w-4" />} title="Pricing Overview" />

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:divide-x lg:divide-border">
                                <div className="lg:pr-4">
                                    <p className="text-2xl font-extrabold tracking-tight text-primary">
                                        {symbol}
                                        {price.toLocaleString()}
                                        <span className="ml-1 text-sm font-semibold text-muted-foreground">
                                            {cycle?.suffix ?? ''}
                                        </span>
                                    </p>
                                    <p className="mt-0.5 text-[11px] text-muted-foreground">{billedLabel}</p>
                                </div>

                                <OverviewCell label="Billing Cycle" value={cycleLabel} />
                                <OverviewCell label="Plan Type" value={plan.planType?.name ?? '—'} />
                                <OverviewCell
                                    label="Trial Period"
                                    value={trialDays > 0 ? `${trialDays} Days` : 'No trial'}
                                />
                                <OverviewCell label="Trial Price" value={trialDays > 0 ? 'Free' : '—'} />
                            </div>

                            {trialDays > 0 && (
                                <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                    <p className="text-xs text-emerald-800">
                                        Trial is available for {trialDays} days. No payment required during the trial period.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* What's Included */}
                    <Card className="border-border bg-card shadow-xs">
                        <CardContent className="p-5">
                            <SectionHeading icon={<Gift className="h-4 w-4" />} title="What's Included" />

                            {menus.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No menus included in this plan.</p>
                            ) : (
                                <ul className="grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
                                    {menus.map((pm) => (
                                        <li key={pm.menu_id} className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                                            <span className="min-w-0 break-words text-sm text-foreground">
                                                {pm.menu?.name ?? `Menu #${pm.menu_id}`}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pricing & Billing Details */}
                    <Card className="border-border bg-card shadow-xs">
                        <CardContent className="p-5">
                            <SectionHeading icon={<ReceiptText className="h-4 w-4" />} title="Pricing &amp; Billing Details" />

                            <div className="overflow-hidden rounded-lg border border-border">
                                {[
                                    [`Price (${cycleLabel})`, `${symbol} ${price.toLocaleString()}`],
                                    ['Billing Cycle', cycleLabel],
                                    ['Next Billing Date (After Trial)', nextBilling()],
                                    ['Trial Period', trialDays > 0 ? `${trialDays} Days` : '—'],
                                    ['Trial Price', trialDays > 0 ? `${symbol} 0 (Free)` : '—'],
                                ].map(([label, value], i) => (
                                    <div
                                        key={label}
                                        className={cn(
                                            'flex items-center justify-between gap-4 px-4 py-3 text-sm',
                                            // Zebra striping, as drawn.
                                            i % 2 === 0 ? 'bg-muted/40' : 'bg-card'
                                        )}
                                    >
                                        <span className="min-w-0 break-words text-muted-foreground">{label}</span>
                                        <span className="shrink-0 font-semibold text-foreground">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        variant="outline"
                        onClick={() => router.push('/admin/subscriptions')}
                        className="h-10 w-full sm:w-40"
                    >
                        Close
                    </Button>
                </div>

                {/* ------------------------------------------------------- sidebar */}
                <Card className="border-border bg-card shadow-xs lg:sticky lg:top-6">
                    <CardContent className="space-y-4 p-5">
                        <p className="text-sm font-bold text-foreground">Plan Summary</p>

                        <div className="flex items-center gap-3">
                            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                                <Crown className="h-5 w-5" />
                            </span>
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
                        </div>

                        <div>
                            <h2 className="break-words text-base font-bold text-foreground">{plan.name}</h2>
                            <p className="text-xs text-muted-foreground">Plan Code: {plan.plan_code}</p>
                        </div>

                        <div className="space-y-3 border-t border-border pt-4">
                            <SummaryRow label="Plan Type" value={plan.planType?.name ?? '—'} />
                            <SummaryRow label="Billing Cycle" value={cycleLabel} />
                            <SummaryRow label="Trial Period" value={trialDays > 0 ? `${trialDays} Days` : '—'} />
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
                            {/* A null scope means the plan is not restricted. */}
                            <SummaryRow label="Event Category" value={plan.category?.name ?? 'All Categories'} />
                            <SummaryRow label="Event Type" value={plan.eventType?.name ?? 'All Types'} />
                            <SummaryRow label="Religion" value={plan.religion?.name ?? 'All Religions'} />
                        </div>

                        <div className="space-y-2 border-t border-border pt-4">
                            <p className="text-xs font-bold text-foreground">Menus</p>
                            <button
                                type="button"
                                onClick={() => router.push(`/admin/subscriptions/${plan.id}`)}
                                className="flex w-full items-center justify-between gap-3 rounded-md px-1 py-1 text-left transition-colors hover:bg-muted"
                            >
                                <Badge variant="secondary" className="text-[11px]">
                                    {plan.total_menus} Included
                                </Badge>
                                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="space-y-3 border-t border-border pt-4">
                            <SummaryRow label="Created On" value={stamp(plan.created_at)} />
                            <SummaryRow label="Last Updated" value={stamp(plan.updated_at)} />
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => router.push(`/admin/subscriptions/${plan.id}`)}
                            className="h-10 w-full gap-2 border-primary/40 text-primary hover:bg-primary/5"
                        >
                            <Eye className="h-4 w-4" /> Preview Plan
                        </Button>
                    </CardContent>
                </Card>
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

function OverviewCell({ label, value }: { label: string; value: string }) {
    return (
        <div className="lg:px-4">
            <p className="text-[11px] text-muted-foreground">{label}</p>
            <p className="mt-0.5 break-words text-sm font-semibold text-foreground">{value}</p>
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
