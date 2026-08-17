'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Copy, Eye, FileText, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PageLoader } from '@/components/common/page-loader';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { cn } from '@/lib/utils';
import {
    useSubscriptionPlan,
    formatPlanPrice,
    BILLING_CYCLES,
} from '@/hooks/use-subscription-plans';

/**
 * Shown after "Duplicate Plan" on the list.
 *
 * The copy is a new record with its own code and id, and the list alone never
 * said what was created — this screen names it before the admin goes on to
 * edit it. It reads the plan back by id rather than carrying the mutation
 * response through navigation, so a refresh or a shared link still resolves.
 */
export default function PlanDuplicatedPage({ params }: { params: Promise<{ id: string }> }) {
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

    const active = Number(plan.is_active) === 1;
    const cycle = BILLING_CYCLES.find((c) => c.value === plan.billing_cycle);

    return (
        <PermissionGuard permission="subscription_plans.view">
            <div className="mx-auto max-w-3xl space-y-5">
                <Card className="border-border bg-card shadow-xs">
                    <CardContent className="flex flex-col items-center gap-4 px-5 py-12 text-center">
                        <span className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
                            <CheckCircle2 className="h-14 w-14 text-emerald-600" />
                        </span>

                        <h2 className="text-xl font-bold text-foreground">Plan Duplicated Successfully!</h2>
                        <p className="max-w-lg text-sm text-muted-foreground">
                            A copy of the plan was created as{' '}
                            <span className="font-semibold text-emerald-600">{plan.name}</span>. Its menus and
                            pricing were copied across — edit it to give it its own details.
                        </p>

                        <div className="flex w-full max-w-xl items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-left">
                            <Copy className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                            <p className="text-xs text-amber-800">
                                {active
                                    ? 'The copy is active, so it is already offered for new subscriptions. Deactivate it while you finish editing if that is not intended.'
                                    : 'The copy is inactive, so it is not offered for new subscriptions yet.'}
                            </p>
                        </div>

                        <div className="mt-2 w-full max-w-2xl rounded-lg border border-border p-4 text-left">
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                    <FileText className="h-4 w-4" />
                                </span>
                                <span className="min-w-0 break-words text-sm font-bold text-foreground">
                                    {plan.name}
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
                            </div>

                            <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                                <Row label="Plan Code" value={plan.plan_code} />
                                <Row label="Price" value={formatPlanPrice(plan)} />
                                <Row label="Plan Type" value={plan.planType?.name ?? '—'} />
                                <Row label="Billing Cycle" value={cycle?.label ?? plan.billing_cycle} />
                                <Row label="Trial Period" value={`${plan.trial_days ?? 0} Days`} />
                                <Row label="Total Menus" value={String(plan.total_menus ?? 0)} />
                                <Row label="Event Category" value={plan.category?.name ?? 'All Categories'} />
                                <Row label="Event Type" value={plan.eventType?.name ?? 'All Types'} />
                            </dl>
                        </div>

                        <div className="mt-4 flex flex-col items-center gap-2">
                            <Button
                                onClick={() => router.push(`/admin/subscriptions/create?id=${plan.id}`)}
                                className="h-10 w-56 gap-2"
                            >
                                <Pencil className="h-4 w-4" /> Edit This Copy
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => router.push(`/admin/subscriptions/${plan.id}`)}
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
        </PermissionGuard>
    );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex min-w-0 items-start gap-2">
            <dt className="w-32 shrink-0 text-xs text-muted-foreground">{label}</dt>
            <dd className="min-w-0 break-words text-xs font-semibold text-foreground">{value}</dd>
        </div>
    );
}
