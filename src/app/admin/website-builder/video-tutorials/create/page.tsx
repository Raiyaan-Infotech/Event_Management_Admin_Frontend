import { Metadata } from 'next';
import { VideoTutorialFormContent } from '../../_components/video-tutorial-form-content';

export const metadata: Metadata = {
    title: 'Add Video Tutorial | Website Builder Admin',
    description: 'Create a new step-by-step video tutorial.',
};

export default function CreateVideoTutorialPage() {
    return <VideoTutorialFormContent />;
}
