import { Metadata } from 'next';
import { VideoTutorialFormContent } from '../../../_components/video-tutorial-form-content';

export const metadata: Metadata = {
    title: 'Edit Video Tutorial | Website Builder Admin',
    description: 'Edit video tutorial details.',
};

interface EditVideoTutorialPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditVideoTutorialPage({ params }: EditVideoTutorialPageProps) {
    const resolvedParams = await params;
    const tutorialId = Number(resolvedParams.id);
    return <VideoTutorialFormContent id={tutorialId} />;
}
