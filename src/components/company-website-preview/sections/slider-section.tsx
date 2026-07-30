'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSliderMinHeight, type SlideItem, type SliderMeta, type ThemeColors } from './preview-shared';

function SliderSectionBase({ slides, meta, theme }: { slides: SlideItem[]; meta: SliderMeta; theme: ThemeColors }) {
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (slides.length <= 1 || !meta.autoplay) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, meta.autoplaySpeed);
    return () => clearInterval(timer);
  }, [slides.length, meta.autoplay, meta.autoplaySpeed]);

  if (!slides.length) return null;

  const slide = slides[current];
  const minHeight = getSliderMinHeight(meta.height);
  const isAdvanced = meta.type === 'advanced';
  const imgFilter = isAdvanced ? `brightness(${slide.brightness / 100}) blur(${slide.blur}px)` : undefined;

  return (
    <section className="relative isolate overflow-hidden" style={{ minHeight }}>
      {slide.imageUrl ? (
        <img key={slide.id} src={slide.imageUrl} alt={slide.title} className="absolute inset-0 -z-20 h-full w-full object-cover transition-opacity duration-700" style={{ filter: imgFilter }} />
      ) : (
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(135deg,#170b13,#3a1830_45%,#130d0c)]" />
      )}
      <div className="absolute inset-0 -z-10 bg-black" style={{ opacity: isAdvanced ? Math.max(0, Math.min(100, slide.overlayOpacity)) / 100 : 0.55 }} />
      <div className="mx-auto flex w-full max-w-[1280px] items-center px-4 py-16 sm:px-6 lg:px-8" style={{ minHeight }}>
        <div className="max-w-[620px]">
          <h2 className="text-[30px] font-black leading-[1.1] tracking-tight sm:text-[42px] lg:text-[50px]" style={{ color: isAdvanced ? slide.titleColor : '#FFFFFF' }}>
            {slide.title}
          </h2>
          {slide.description ? (
            <p className="mt-5 max-w-[500px] text-[15px] font-medium leading-7 sm:text-[16px]" style={{ color: isAdvanced ? slide.descriptionColor : 'rgba(255,255,255,0.85)' }}>
              {slide.description}
            </p>
          ) : null}
          {slide.buttonLabel ? (
            <div className="mt-7">
              <a href={slide.buttonLink} className="inline-flex h-11 items-center justify-center rounded px-6 text-[13px] font-bold shadow-sm transition hover:-translate-y-0.5" style={{ backgroundColor: theme.primaryButton, color: '#FFFFFF' }}>
                {slide.buttonLabel}
              </a>
            </div>
          ) : null}
        </div>
      </div>

      {slides.length > 1 ? (
        <>
          <button type="button" onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)} className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/30" aria-label="Previous slide">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => setCurrent((c) => (c + 1) % slides.length)} className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/30" aria-label="Next slide">
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
            {slides.map((s, i) => (
              <button key={s.id} type="button" onClick={() => setCurrent(i)} aria-label={`Go to slide ${i + 1}`} className={cn('h-2 rounded-full transition-all duration-300', i === current ? 'w-6 bg-white' : 'w-2 bg-white/40')} />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}

export const SliderSection = React.memo(SliderSectionBase);
