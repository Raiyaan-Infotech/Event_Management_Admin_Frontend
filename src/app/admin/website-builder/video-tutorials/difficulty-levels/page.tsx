import { Metadata } from 'next';
import { VideoTutorialDifficultyContent } from '../../_components/video-tutorial-difficulty-content';

export const metadata: Metadata = {
    title: 'Difficulty Levels | Video Tutorials Admin',
    description: 'Manage video tutorial difficulty levels.',
};

export default function VideoTutorialDifficultyPage() {
    return <VideoTutorialDifficultyContent />;
}
