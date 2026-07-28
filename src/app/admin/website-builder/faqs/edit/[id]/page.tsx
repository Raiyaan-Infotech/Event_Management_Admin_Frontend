import { FaqFormContent } from '../../../_components/faq-form-content';

export const metadata = {
    title: 'Edit FAQ | Website Builder Admin',
};

interface EditFaqPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditWebsiteFaqPage({ params }: EditFaqPageProps) {
    const resolvedParams = await params;
    const faqId = Number(resolvedParams.id);
    return <FaqFormContent id={faqId} />;
}
