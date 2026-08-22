import { Suspense } from 'react';
import { FrameStyleForm } from '../_components/frame-style-form';

// useSearchParams needs a Suspense boundary or the route fails to prerender.
export default function UploadFrameStylePage() {
    return (
        <Suspense fallback={null}>
            <FrameStyleForm />
        </Suspense>
    );
}
