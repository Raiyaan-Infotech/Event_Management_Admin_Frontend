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
    useDeletePlanWithReason,
    type SubscriptionPlan,
} from '@/hooks/use-subscription-plans';

export default function DeletePlanPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    // Essential here: once deleted, the plan can no longer be fetched, so the
    // success screen has to render the snapshot the API returned.
    const [result, setResult] = useState<SubscriptionPlan | null>(null);

    const { data: plan, isLoading } = useSubscriptionPlan(id);
    const { data: reasons } = usePlanReasons();
    const removePlan = useDeletePlanWithReason((deleted) => setResult(deleted));

    if (isLoading) return <PageLoader open />;
    // Only a "not found" *before* deleting is an error — afterwards the success
    // screen is driven by `result`.
    if (!plan && !result) {
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
        <PermissionGuard permission="subscription_plans.delete">
            <PlanActionScreen
                variant="delete"
                plan={(result ?? plan)!}
                reasons={reasons?.deletion ?? []}
                isSubmitting={removePlan.isPending}
                result={result}
                onSubmit={(reason, comments) =>
                    removePlan.mutate({ id: Number(id), reason, comments })
                }
            />
        </PermissionGuard>
    );
}
