import { PageLoader } from '@/components/common/page-loader';

export default function LoginPageLoading() {
    return <PageLoader open={true} text="Loading Login Page Settings..." />;
}
