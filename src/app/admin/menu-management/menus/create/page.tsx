import { Suspense } from 'react';
import { MenuFormContent } from './_components/menu-form-content';

// useSearchParams needs a Suspense boundary or the route fails to prerender.
export default function MenuFormPage() {
    return (
        <Suspense fallback={null}>
            <MenuFormContent />
        </Suspense>
    );
}
