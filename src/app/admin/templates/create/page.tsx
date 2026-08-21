import { Suspense } from 'react';
import { TemplateWizardContent } from './_components/template-wizard-content';

// useSearchParams needs a Suspense boundary or the route fails to prerender.
export default function CreateTemplatePage() {
    return (
        <Suspense fallback={null}>
            <TemplateWizardContent />
        </Suspense>
    );
}
