import { Suspense } from 'react';
import { PlanWizardContent } from './_components/plan-wizard-content';

// useSearchParams needs a Suspense boundary or the route fails to prerender.
export default function PlanWizardPage() {
    return (
        <Suspense fallback={null}>
            <PlanWizardContent />
        </Suspense>
    );
}
