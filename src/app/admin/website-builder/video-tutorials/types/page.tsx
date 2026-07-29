import { Metadata } from 'next';
import { VideoTutorialTypesContent } from '../../_components/video-tutorial-types-content';

export const metadata: Metadata = {
    title: 'Tutorial Types | Video Tutorials Admin',
    description: 'Manage video tutorial types.',
};

export default function VideoTutorialTypesPage() {
    return <VideoTutorialTypesContent />;
}
