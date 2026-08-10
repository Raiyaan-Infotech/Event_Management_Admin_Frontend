'use client';

import * as React from 'react';
import { useWebsiteLanguage } from '../website-language-provider';
import { Play } from 'lucide-react';
import type { ThemeColors } from './preview-shared';

export type VideoTutorialItem = {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
};

function VideoTutorialsSectionBase({ videos, theme }: { videos: VideoTutorialItem[]; theme: ThemeColors }) {
  const { t } = useWebsiteLanguage();
  if (!videos || !videos.length) return null;

  return (
    <section id="video-tutorials" className="w-full border-t border-slate-100 bg-white py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="mb-3 inline-flex rounded px-3 py-1 text-[12px] font-bold text-white" style={{ backgroundColor: theme.primaryButton }}>
            {t('video_tutorials.badge', 'Video Showcase')}
          </span>
          <h2 className="mt-4 text-[28px] font-black leading-tight tracking-tight sm:text-[36px]" style={{ color: theme.primaryText }}>
            {t('video_tutorials.heading', 'Video Tutorials & Event Highlights')}
          </h2>
          <div className="mx-auto mt-3 h-[3px] w-12 rounded-full" style={{ backgroundColor: theme.primaryButton }} />
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((vid) => (
            <a
              key={vid.id}
              href={vid.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group overflow-hidden rounded-md border border-slate-100 bg-slate-50/50 shadow-xs transition duration-300 hover:-translate-y-1 hover:border-slate-200 hover:bg-white hover:shadow-lg"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                {vid.thumbnailUrl ? (
                  <img
                    src={vid.thumbnailUrl}
                    alt={vid.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,#170b13,#3a1830_45%,#130d0c)]" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-md text-white shadow-xl transition duration-300 group-hover:scale-110"
                    style={{ backgroundColor: theme.primaryButton }}
                  >
                    <Play className="ml-1 h-6 w-6 fill-current" />
                  </div>
                </div>
                {vid.duration && (
                  <span className="absolute bottom-3 right-3 rounded bg-black/75 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-xs">
                    {vid.duration}
                  </span>
                )}
              </div>

              <div className="p-5">
                <h3 className="text-[16px] font-bold text-slate-900" style={{ color: theme.primaryText }}>
                  {vid.title}
                </h3>
                <p className="mt-2 text-[13px] font-medium leading-6 text-slate-600">
                  {vid.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export const VideoTutorialsSection = React.memo(VideoTutorialsSectionBase);
