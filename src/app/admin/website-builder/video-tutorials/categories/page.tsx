import { Metadata } from 'next';
import { VideoTutorialCategoriesContent } from '../../_components/video-tutorial-categories-content';

export const metadata: Metadata = {
    title: 'Categories | Video Tutorials Admin',
    description: 'Manage video tutorial categories.',
};

export default function VideoTutorialCategoriesPage() {
    return <VideoTutorialCategoriesContent />;
}
