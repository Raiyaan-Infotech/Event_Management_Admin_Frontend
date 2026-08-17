'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/common/page-loader';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PlanActionScreen } from '../../_components/plan-action-screen';
import {
    useSubscriptionPlan,
    usePlanReasons,
    useDeactivatePlan,
    type SubscriptionPlan,
} from '@/hooks/use-subscription-plans';

export default function DeactivatePlanPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    // Held locally rather than re-read: the success screen renders exactly what
    // the action returned, including who/when.
    const [result, setResult] = useState<SubscriptionPlan | null>(null);

    const { data: plan, isLoading } = useSubscriptionPlan(id);
    const { data: reasons } = usePlanReasons();
    const deactivate = useDeactivatePlan((updated) => setResult(updated));

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

    return (
        <PermissionGuard permission="subscription_plans.edit">
            <PlanActionScreen
                variant="deactivate"
                plan={plan}
                reasons={reasons?.deactivation ?? []}
                isSubmitting={deactivate.isPending}
                result={result}
                onSubmit={(reason, comments) =>
                    deactivate.mutate({ id: Number(id), reason, comments })
                }
            />
        </PermissionGuard>
    );
}
