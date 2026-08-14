import { PageLoader } from '@/components/common/page-loader';

// Route-level loader, matching src/app/admin/loading.tsx — without this the
// route shows nothing while its chunk and data resolve.
export default function Loading() {
    return <PageLoader open={true} text="Loading..." />;
}
