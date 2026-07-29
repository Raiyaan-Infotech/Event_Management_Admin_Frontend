import { Metadata } from 'next';
import { VideoTutorialSubCategoriesContent } from '../../_components/video-tutorial-subcategories-content';

export const metadata: Metadata = {
    title: 'Sub Categories | Video Tutorials Admin',
    description: 'Manage video tutorial sub categories.',
};

export default function VideoTutorialSubCategoriesPage() {
    return <VideoTutorialSubCategoriesContent />;
}
