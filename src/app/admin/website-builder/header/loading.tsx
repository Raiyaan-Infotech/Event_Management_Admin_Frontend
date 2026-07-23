import { PageLoader } from '@/components/common/page-loader';

export default function HeaderLoading() {
    return <PageLoader open={true} text="Loading Header Settings..." />;
}
