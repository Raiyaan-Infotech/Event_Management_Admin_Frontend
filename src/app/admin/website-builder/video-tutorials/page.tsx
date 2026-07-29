import { Metadata } from 'next';
import { VideoTutorialsListContent } from '../_components/video-tutorials-list-content';

export const metadata: Metadata = {
    title: 'Video Tutorials | Website Builder Admin',
    description: 'Manage and organize all video tutorials for your users.',
};

export default function WebsiteVideoTutorialsPage() {
    return <VideoTutorialsListContent />;
}
