import { PageLoader } from '@/components/common/page-loader';

export default function NavMenuLoading() {
    return <PageLoader open={true} text="Loading Nav Menu Settings..." />;
}
