import { PageLoader } from '@/components/common/page-loader';

export default function SeoLoading() {
    return <PageLoader open={true} text="Loading SEO Settings..." />;
}
