import { Suspense } from 'react';
import { LoginDemoContent } from '../_components/login-demo-content';
import { PageLoader } from '@/components/common/page-loader';

export const metadata = {
    title: 'Login & Demo Block Customizer | Website Builder',
    description: 'Select and apply Login & Demo CTA block variants per page.',
};

export default function LoginDemoPage() {
    return (
        <Suspense fallback={<PageLoader open={true} />}>
            <LoginDemoContent initialPageSlug="home" />
        </Suspense>
    );
}
